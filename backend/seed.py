import sys
import os
import random
from datetime import datetime, timedelta

# Ensure app is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import (
    InfrastructureAsset, AssetHistory, Inspection, Maintenance,
    AssetType, AssetStatus, AssetCondition, MaintenancePriority, MaintenanceStatus,
    User, UserRole
)
from app.auth.security import get_password_hash

def seed_demo_users(db):
    print("Seeding demo users...")
    demo_password = get_password_hash("Demo@123")
    
    users = [
        User(name="Super Admin", email="super.admin@infratrack.demo", password_hash=demo_password, role=UserRole.SUPER_ADMIN),
        User(name="Roads Admin", email="roads.admin@infratrack.demo", password_hash=demo_password, role=UserRole.DEPARTMENT_ADMIN, department="Roads & Buildings Department"),
        User(name="Ahmedabad Officer", email="ahmedabad.officer@infratrack.demo", password_hash=demo_password, role=UserRole.DISTRICT_OFFICER, district="Ahmedabad"),
        User(name="Ahmedabad Inspector", email="ahmedabad.inspector@infratrack.demo", password_hash=demo_password, role=UserRole.FIELD_INSPECTOR, district="Ahmedabad"),
        User(name="Maintenance Team", email="maintenance@infratrack.demo", password_hash=demo_password, role=UserRole.MAINTENANCE_OFFICER),
        User(name="Finance Desk", email="finance@infratrack.demo", password_hash=demo_password, role=UserRole.FINANCE_OFFICER),
        User(name="L&T Contractor", email="contractor@infratrack.demo", password_hash=demo_password, role=UserRole.CONTRACTOR)
    ]
    for u in users:
        db.add(u)
    db.commit()
    print(f"Created {len(users)} demo users.")

def generate_seed_data():
    print("Initializing Database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    
    seed_demo_users(db)

    print("Generating seed data for State-Level Infrastructure Asset Inventory (Gujarat)...")

    departments = [
        "Roads & Buildings Department",
        "Urban Development & Urban Housing Department",
        "Water Resources Department",
        "Health & Family Welfare Department",
        "Education Department",
        "Home & Police Infrastructure Cell",
        "Energy & Petrochemicals Department",
        "Gujarat Municipal Finance Board"
    ]

    districts = [
        "Ahmedabad",
        "Gandhinagar",
        "Surat",
        "Vadodara",
        "Rajkot",
        "Kutch",
        "Bhavnagar",
        "Mehsana"
    ]

    zones = [
        "NORTH_ZONE",
        "SOUTH_ZONE",
        "EAST_ZONE",
        "WEST_ZONE",
        "CENTRAL_ZONE",
        "GIFT_CITY_ZONE",
        "CAPITAL_ZONE"
    ]

    vendors = [
        "Larsen & Toubro Ltd",
        "Tata Projects Ltd",
        "Dilip Buildcon",
        "Sadbhav Engineering",
        "Adani Infra",
        "Siemens Mobility",
        "Gujarat Gas & Water Works",
        "BEL Systems",
        "Local PWD Contractor"
    ]

    asset_templates = [
        # ROADS
        ("RD-AHM-001", "S.G. Highway Section 1 (Thaltej Flyover to Vaishnodevi Circle)", AssetType.ROAD, "6-lane arterial highway with service lanes", "Ahmedabad", "Roads & Buildings Department"),
        ("RD-AHM-002", "Ashram Road Corridor (Paldi to Income Tax Circle)", AssetType.ROAD, "Major urban transit corridor with BRTS lanes", "Ahmedabad", "Urban Development & Urban Housing Department"),
        ("RD-AHM-003", "132 Feet Ring Road Segment B", AssetType.ROAD, "Heavy transport ring road connecting Satellite to Memnagar", "Ahmedabad", "Roads & Buildings Department"),
        ("RD-GDN-001", "Gandhinagar-Koba Highway Link", AssetType.ROAD, "Four-lane express connectivity to Airport", "Gandhinagar", "Roads & Buildings Department"),
        ("RD-SRT-001", "Surat Outer Ring Road Section 4", AssetType.ROAD, "8-lane industrial heavy corridor", "Surat", "Roads & Buildings Department"),
        ("RD-VDR-001", "Vadodara Express Highway Link", AssetType.ROAD, "Arterial road connecting industrial zone", "Vadodara", "Roads & Buildings Department"),

        # BRIDGES
        ("BRG-AHM-001", "Atal Pedestrian Bridge (Sabarmati Riverfront)", AssetType.BRIDGE, "Iconic steel truss footbridge across Sabarmati", "Ahmedabad", "Urban Development & Urban Housing Department"),
        ("BRG-AHM-002", "Ellisbridge Heritage Railway Bridge", AssetType.BRIDGE, "Historic iron arch structure undergoing preservation", "Ahmedabad", "Roads & Buildings Department"),
        ("BRG-SRT-001", "Tapi River Cable-Stayed Cable Bridge", AssetType.BRIDGE, "Multi-span cable stayed bridge", "Surat", "Roads & Buildings Department"),
        ("BRG-VDR-001", "Vishwamitri River Overbridge", AssetType.BRIDGE, "Four-lane vehicular overpass", "Vadodara", "Roads & Buildings Department"),

        # GOVERNMENT BUILDINGS
        ("BLD-AHM-001", "Collectorate Bhavan Complex", AssetType.GOVERNMENT_BUILDING, "District administrative office headquarters", "Ahmedabad", "Home & Police Infrastructure Cell"),
        ("BLD-GDN-001", "Swarnim Sankul-1 (Secretariat)", AssetType.GOVERNMENT_BUILDING, "State executive administrative block", "Gandhinagar", "Roads & Buildings Department"),
        ("BLD-RJK-001", "Rajkot District Panchayat Bhavan", AssetType.GOVERNMENT_BUILDING, "Administrative district head office", "Rajkot", "Roads & Buildings Department"),

        # HOSPITALS
        ("HSP-AHM-001", "Civil Hospital Asarwa Trauma Block", AssetType.HOSPITAL, "1200-bed super-specialty tertiary care hospital", "Ahmedabad", "Health & Family Welfare Department"),
        ("HSP-SRT-001", "New Civil Hospital Surat Emergency Wing", AssetType.HOSPITAL, "Regional emergency healthcare center", "Surat", "Health & Family Welfare Department"),
        ("HSP-GDN-001", "GMERS Medical College & Civil Hospital", AssetType.HOSPITAL, "District government hospital and teaching facility", "Gandhinagar", "Health & Family Welfare Department"),

        # SCHOOLS
        ("SCH-AHM-001", "AMC Model Smart School No. 14", AssetType.SCHOOL, "Primary municipal model school with digital labs", "Ahmedabad", "Education Department"),
        ("SCH-KTC-001", "Bhuj District Secondary High School", AssetType.SCHOOL, "Reconstructed resilient school building", "Kutch", "Education Department"),

        # WATER PIPELINES
        ("WTR-AHM-001", "Narmada Main Trunk Canal Feeder Pipeline #4", AssetType.WATER_PIPELINE, "1800mm MS pipeline supplying raw water to Kotarpur", "Ahmedabad", "Water Resources Department"),
        ("WTR-SRT-001", "Ukai Dam Bulk Water Grid Pipeline", AssetType.WATER_PIPELINE, "Regional raw water transmission network", "Surat", "Water Resources Department"),
        ("WTR-KTC-001", "Kutch Branch Canal Bulk Water Pumping Line", AssetType.WATER_PIPELINE, "Inter-district desert supply network", "Kutch", "Water Resources Department"),

        # STREETLIGHTS & SMART LIGHTING
        ("STL-AHM-001", "SG Highway LED Smart Lighting Grid", AssetType.STREETLIGHT, "Centralized IoT controlled highway streetlights", "Ahmedabad", "Energy & Petrochemicals Department"),
        ("STL-GDN-001", "GIFT City Smart Lighting Corridor", AssetType.STREETLIGHT, "Smart grid pole infrastructure", "Gandhinagar", "Energy & Petrochemicals Department"),

        # TRAFFIC SIGNALS
        ("TRF-AHM-001", "Income Tax Circle Adaptive Signal Junction", AssetType.TRAFFIC_SIGNAL, "Camera-assisted AI traffic light array", "Ahmedabad", "Home & Police Infrastructure Cell"),
        ("TRF-RJK-001", "Trikon Baug Junction Signal Array", AssetType.TRAFFIC_SIGNAL, "High-density central square traffic lights", "Rajkot", "Home & Police Infrastructure Cell"),

        # CCTV & SURVEILLANCE
        ("CCTV-AHM-001", "Safe City Surveillance Node - Kalupur Junction", AssetType.CCTV, "High-definition PTZ optical traffic monitoring cameras", "Ahmedabad", "Home & Police Infrastructure Cell"),
        ("CCTV-SRT-001", "Surat Smart City Security Camera Mesh", AssetType.CCTV, "Integrated command control camera node", "Surat", "Home & Police Infrastructure Cell"),

        # PUBLIC FACILITIES
        ("PUB-AHM-001", "Kankaria Lakefront Public Pavilion", AssetType.PUBLIC_FACILITY, "Recreational and public amenities park center", "Ahmedabad", "Urban Development & Urban Housing Department"),
        ("PUB-BHV-001", "Bhavnagar Oceanfront Public Promenade", AssetType.PUBLIC_FACILITY, "Coastal civic recreation facility", "Bhavnagar", "Urban Development & Urban Housing Department")
    ]

    statuses = list(AssetStatus)
    conditions = list(AssetCondition)

    district_coords = {
        "Ahmedabad": (23.0225, 72.5714),
        "Gandhinagar": (23.2156, 72.6369),
        "Surat": (21.1702, 72.8311),
        "Vadodara": (22.3072, 73.1812),
        "Rajkot": (22.3039, 70.8022),
        "Kutch": (23.7337, 69.8597),
        "Bhavnagar": (21.7645, 72.1519),
        "Mehsana": (23.5880, 72.3693)
    }

    created_assets = []

    # Create templated assets
    for template in asset_templates:
        code, name, atype, desc_text, district_val, dept_val = template
        status_val = random.choice([AssetStatus.ACTIVE, AssetStatus.ACTIVE, AssetStatus.ACTIVE, AssetStatus.UNDER_MAINTENANCE, AssetStatus.UNDER_CONSTRUCTION, AssetStatus.PLANNED])
        condition_val = random.choice([AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.GOOD, AssetCondition.FAIR, AssetCondition.POOR])
        
        if status_val == AssetStatus.UNDER_MAINTENANCE:
            condition_val = random.choice([AssetCondition.POOR, AssetCondition.CRITICAL])

        install_date = datetime.now().date() - timedelta(days=random.randint(100, 3650))
        cost = float(random.randint(10, 800)) * 100000.0

        base_lat, base_lng = district_coords[district_val]

        asset = InfrastructureAsset(
            asset_code=code,
            name=name,
            asset_type=atype,
            description=desc_text,
            department=dept_val,
            state="Gujarat",
            district=district_val,
            location_address=f"{name.split('(')[0].strip()}, District {district_val}, Gujarat",
            zone=random.choice(zones),
            latitude=round(base_lat + random.uniform(-0.05, 0.05), 6),
            longitude=round(base_lng + random.uniform(-0.05, 0.05), 6),
            status=status_val,
            condition=condition_val,
            installation_date=install_date,
            acquisition_cost=cost,
            vendor=random.choice(vendors),
            warranty_expiry=install_date + timedelta(days=1825),
            created_at=datetime.utcnow() - timedelta(days=random.randint(10, 500))
        )
        db.add(asset)
        created_assets.append(asset)

    # Generate 50 additional state infrastructure assets
    for i in range(1, 55):
        atype = random.choice(list(AssetType))
        dist_val = random.choice(districts)
        code = f"{atype.value[:3]}-{dist_val[:3].upper()}-{100+i}"
        name = f"{dist_val} Regional {atype.value.replace('_', ' ').title()} Unit #{i}"
        status_val = random.choice(statuses)
        condition_val = random.choice(conditions)

        install_date = datetime.now().date() - timedelta(days=random.randint(50, 2000))
        cost = float(random.randint(5, 400)) * 100000.0

        base_lat, base_lng = district_coords[dist_val]

        asset = InfrastructureAsset(
            asset_code=code,
            name=name,
            asset_type=atype,
            description=f"State infrastructure asset registered under {atype.value} category in {dist_val} district.",
            department=random.choice(departments),
            state="Gujarat",
            district=dist_val,
            location_address=f"Sector {random.randint(1, 25)}, District {dist_val}, Gujarat",
            zone=random.choice(zones),
            latitude=round(base_lat + random.uniform(-0.1, 0.1), 6),
            longitude=round(base_lng + random.uniform(-0.1, 0.1), 6),
            status=status_val,
            condition=condition_val,
            installation_date=install_date,
            acquisition_cost=cost,
            vendor=random.choice(vendors),
            warranty_expiry=install_date + timedelta(days=1095),
            created_at=datetime.utcnow() - timedelta(days=random.randint(5, 300))
        )
        db.add(asset)
        created_assets.append(asset)

    db.commit()
    print(f"Created {len(created_assets)} state-level infrastructure assets.")

    # Generate Asset History, Inspections, and Maintenance records for assets
    inspections_count = 0
    histories_count = 0
    maintenances_count = 0

    inspectors = ["Er. Ramesh Sharma", "Er. Priya Shah", "Inspector Vikram Patel", "Quality Audit Officer K. Mehta", "Tech Inspector S. Verma"]
    engineers = ["District Maintenance Cell", "Electrical Wing Team 2", "Civil Works Division", "Pipeline Repairs Squad", "Smart City Operations"]

    for asset in created_assets:
        h1 = AssetHistory(
            asset_id=asset.id,
            old_status=None,
            new_status=AssetStatus.PLANNED,
            changed_by="System Admin",
            reason="State Infrastructure Plan Budget Sanction",
            remarks="Approved under Gujarat State Infrastructure Masterplan",
            created_at=asset.created_at
        )
        db.add(h1)
        histories_count += 1

        if asset.status in [AssetStatus.ACTIVE, AssetStatus.UNDER_MAINTENANCE, AssetStatus.RETIRED]:
            h2 = AssetHistory(
                asset_id=asset.id,
                old_status=AssetStatus.PLANNED,
                new_status=AssetStatus.PROCURED,
                changed_by="State Procurement Division",
                reason="Tender Awarded",
                remarks=f"Contract awarded to {asset.vendor}",
                created_at=asset.created_at + timedelta(days=15)
            )
            h3 = AssetHistory(
                asset_id=asset.id,
                old_status=AssetStatus.PROCURED,
                new_status=AssetStatus.ACTIVE if asset.status != AssetStatus.UNDER_MAINTENANCE else AssetStatus.UNDER_MAINTENANCE,
                changed_by="Chief Executive Engineer",
                reason="Commissioning Clearance",
                remarks="Commissioned into public service after safety compliance verification",
                created_at=asset.created_at + timedelta(days=60)
            )
            db.add(h2)
            db.add(h3)
            histories_count += 2

        num_insp = random.randint(1, 3)
        for j in range(num_insp):
            insp = Inspection(
                asset_id=asset.id,
                inspected_by=random.choice(inspectors),
                inspection_date=datetime.utcnow() - timedelta(days=random.randint(5, 180)),
                condition=asset.condition if j == 0 else random.choice(conditions),
                remarks=random.choice([
                    "Structural integrity verified. Normal wear noted.",
                    "Minor surface cracks identified; recommended localized repair.",
                    "Routine monsoon pre-inspection completed successfully.",
                    "High vibration detected during peak load test; monitoring advised.",
                    "Excellent condition, regular preventative maintenance active."
                ]),
                created_at=datetime.utcnow() - timedelta(days=random.randint(5, 180))
            )
            db.add(insp)
            inspections_count += 1

        if asset.condition in [AssetCondition.POOR, AssetCondition.CRITICAL, AssetCondition.FAIR] or asset.status == AssetStatus.UNDER_MAINTENANCE:
            m_status = MaintenanceStatus.IN_PROGRESS if asset.status == AssetStatus.UNDER_MAINTENANCE else random.choice([MaintenanceStatus.REPORTED, MaintenanceStatus.ASSIGNED, MaintenanceStatus.COMPLETED])
            maint = Maintenance(
                asset_id=asset.id,
                issue=random.choice([
                    "Bitumen layer degradation and pothole formation",
                    "Expansion joint alignment anomaly and seal leakage",
                    "Subsurface water seepage near foundation junction",
                    "Voltage fluctuation causing LED controller tripping",
                    "Pressure drop detected across main distribution valve"
                ]),
                priority=MaintenancePriority.HIGH if asset.condition == AssetCondition.CRITICAL else MaintenancePriority.MEDIUM,
                status=m_status,
                reported_by="District Inspection Officer",
                assigned_to=random.choice(engineers),
                reported_at=datetime.utcnow() - timedelta(days=random.randint(2, 30)),
                started_at=datetime.utcnow() - timedelta(days=random.randint(1, 10)) if m_status in [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.COMPLETED] else None,
                completed_at=datetime.utcnow() - timedelta(days=1) if m_status == MaintenanceStatus.COMPLETED else None,
                estimated_cost=float(random.randint(10, 150)) * 10000.0,
                actual_cost=float(random.randint(10, 140)) * 10000.0 if m_status == MaintenanceStatus.COMPLETED else None,
                remarks="Work execution monitored by District Infra Cell."
            )
            db.add(maint)
            maintenances_count += 1

    db.commit()
    db.close()

    print(f"Successfully seeded database with state-level hierarchy:")
    print(f"  - Infrastructure Assets: {len(created_assets)}")
    print(f"  - Asset History Logs:   {histories_count}")
    print(f"  - Inspections:          {inspections_count}")
    print(f"  - Maintenance Records:  {maintenances_count}")

if __name__ == "__main__":
    generate_seed_data()
