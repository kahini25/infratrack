import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api():
    print("==================================================")
    print("STATE-LEVEL BACKEND ARCHITECTURE VERIFICATION TEST")
    print("==================================================")

    # 1. Login to get token
    login_res = client.post(
        "/api/auth/login",
        data={"username": "super.admin@infratrack.demo", "password": "Demo@123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    print("[OK] 0. Authentication successful.")

    # 1. Root Endpoint
    res = client.get("/")
    assert res.status_code == 200, f"Root API failed: {res.text}"
    print("[OK] 1. Root health endpoint working.")

    # 2. Dashboard Stats
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200, f"Dashboard stats failed: {res.text}"
    stats = res.json()
    required_keys = [
        "total_assets", "assets_by_department", "assets_by_district",
        "assets_by_type", "assets_by_status", "assets_by_condition",
        "active_maintenances", "critical_assets", "poor_condition_assets",
        "recent_inspections", "recent_lifecycle_changes", "maintenance_expenditure"
    ]
    for key in required_keys:
        assert key in stats, f"Missing key in dashboard stats: {key}"
    print("[OK] 2. Dashboard stats returning complete organizational metrics:")
    print(f"     Total Assets: {stats['total_assets']}")
    print(f"     Districts Covered: {len(stats['assets_by_district'])} ({list(stats['assets_by_district'].keys())[:4]}...)")
    print(f"     Departments Covered: {len(stats['assets_by_department'])}")
    print(f"     Critical Assets: {stats['critical_assets']}, Poor Condition: {stats['poor_condition_assets']}")

    # 3. District Filtering
    res = client.get("/api/assets?district=Ahmedabad")
    assert res.status_code == 200
    ahm_assets = res.json()
    print(f"[OK] 3. District filter ('Ahmedabad') returned {len(ahm_assets)} assets.")
    assert len(ahm_assets) > 0, "Expected at least 1 asset in Ahmedabad district"
    for a in ahm_assets:
        assert a["district"] == "Ahmedabad", f"Unexpected district in filter: {a['district']}"

    # 4. Combinable Filters (Department + District)
    dept_url = "/api/assets?department=Roads%20%26%20Buildings%20Department&district=Ahmedabad"
    res = client.get(dept_url)
    assert res.status_code == 200
    dept_dist_assets = res.json()
    print(f"[OK] 4. Combinable filter (Department + District) returned {len(dept_dist_assets)} assets.")

    # 5. Multi-field Combinable Filters (Type + Condition + District)
    multi_url = "/api/assets?asset_type=ROAD&district=Ahmedabad"
    res = client.get(multi_url)
    assert res.status_code == 200
    multi_assets = res.json()
    print(f"[OK] 5. Multi-field filter (Asset Type + District) returned {len(multi_assets)} assets.")

    # 6. Status Change & Automatic History
    res = client.get("/api/assets?limit=1")
    first_asset = res.json()[0]
    asset_id = first_asset["id"]
    
    status_res = client.post(
        f"/api/assets/{asset_id}/status",
        json={
            "new_status": "UNDER_MAINTENANCE",
            "reason": "Road surface cracking inspection failure",
            "changed_by": "District Executive Engineer",
            "remarks": "Initiated emergency resurfacing work order"
        }
    )
    assert status_res.status_code == 200
    updated = status_res.json()
    assert updated["status"] == "UNDER_MAINTENANCE"
    print(f"[OK] 6. Lifecycle status update verified for asset #{asset_id} -> {updated['status']}")

    hist_res = client.get(f"/api/assets/{asset_id}/history")
    assert hist_res.status_code == 200
    hist_logs = hist_res.json()
    assert len(hist_logs) > 0
    assert hist_logs[0]["new_status"] == "UNDER_MAINTENANCE"
    print(f"[OK] 7. Automatic AssetHistory logging verified ({len(hist_logs)} entries found).")

    # 7. Inspection Logging
    insp_res = client.post(
        f"/api/assets/{asset_id}/inspections",
        json={
            "inspected_by": "Senior Auditor Er. Mehta",
            "condition": "CRITICAL",
            "remarks": "Substructure asphalt erosion detected."
        }
    )
    assert insp_res.status_code == 201
    print(f"[OK] 8. Inspection logged successfully for asset #{asset_id}.")

    # 8. Maintenance Reporting
    maint_res = client.post(
        "/api/maintenance",
        json={
            "asset_id": asset_id,
            "issue": "Severe bitumen stripping and pot hole repair required",
            "priority": "CRITICAL",
            "status": "IN_PROGRESS",
            "reported_by": "Field Officer Patel",
            "assigned_to": "Roads Division Squad 4",
            "estimated_cost": 250000.0,
            "remarks": "Emergency contractor dispatched"
        }
    )
    assert maint_res.status_code == 201
    print(f"[OK] 9. Maintenance ticket created successfully.")

    print("\nALL STATE-LEVEL BACKEND ARCHITECTURE VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
