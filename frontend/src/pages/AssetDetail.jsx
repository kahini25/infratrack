import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAssetById, getAssetHistory, getInspections, getMaintenances,
  changeAssetStatus, createInspection, createMaintenance, updateAsset
} from '../services/api';
import InfrastructureMap from '../components/InfrastructureMap';
import LocationPickerModal from '../components/LocationPickerModal';
import {
  Building2, MapPin, Calendar, Wrench, ShieldCheck, History, ArrowLeft, RefreshCw, Plus, FileText, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [statusModal, setStatusModal] = useState(false);
  const [inspectionModal, setInspectionModal] = useState(false);
  const [maintenanceModal, setMaintenanceModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);

  const handleLocationSave = async (locationData) => {
    try {
      const payload = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };
      if (locationData.location_address) {
        payload.location_address = locationData.location_address;
      }
      await updateAsset(id, payload);
      setLocationModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update asset location');
    }
  };

  // Status Change Form
  const [statusForm, setStatusForm] = useState({
    new_status: 'UNDER_MAINTENANCE',
    reason: '',
    changed_by: 'Field Executive Engineer',
    remarks: ''
  });

  // Inspection Form
  const [inspectionForm, setInspectionForm] = useState({
    inspected_by: 'Quality Inspection Officer',
    condition: 'POOR',
    remarks: ''
  });

  // Maintenance Form
  const [maintenanceForm, setMaintenanceForm] = useState({
    issue: '',
    priority: 'HIGH',
    assigned_to: 'District Infra Team A',
    estimated_cost: '',
    remarks: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const assetData = await getAssetById(id);
      setAsset(assetData);

      const historyData = await getAssetHistory(id);
      setHistory(historyData);

      const inspectionData = await getInspections(id);
      setInspections(inspectionData);

      const maintenanceData = await getMaintenances();
      setMaintenances(maintenanceData.filter(m => m.asset_id === parseInt(id)));
    } catch (err) {
      console.error('Failed to fetch asset details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await changeAssetStatus(id, statusForm);
      setStatusModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.');
    }
  };

  const handleInspectionSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInspection(id, inspectionForm);
      setInspectionModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit inspection.');
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenance({
        asset_id: parseInt(id),
        ...maintenanceForm,
        estimated_cost: maintenanceForm.estimated_cost ? parseFloat(maintenanceForm.estimated_cost) : 0
      });
      setMaintenanceModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to report maintenance.');
    }
  };

  if (loading || !asset) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/assets')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-bold">
                {asset.asset_code}
              </span>
              <h1 className="text-2xl font-extrabold text-white">{asset.name}</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {asset.department} • District {asset.district}, {asset.state} (Zone: {asset.zone || 'N/A'})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {user && (user.role === 'SUPER_ADMIN' || user.role === 'DEPARTMENT_ADMIN' || user.role === 'DISTRICT_OFFICER' || user.role === 'FIELD_INSPECTOR' || user.role === 'MAINTENANCE_OFFICER') && (
            <button
              onClick={() => setStatusModal(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Update Status</span>
            </button>
          )}

          {user && (user.role === 'SUPER_ADMIN' || user.role === 'DEPARTMENT_ADMIN' || user.role === 'DISTRICT_OFFICER' || user.role === 'FIELD_INSPECTOR') && (
            <button
              onClick={() => setInspectionModal(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Add Inspection</span>
            </button>
          )}

          {user && (user.role === 'SUPER_ADMIN' || user.role === 'DEPARTMENT_ADMIN' || user.role === 'DISTRICT_OFFICER') && (
            <button
              onClick={() => setMaintenanceModal(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-all"
            >
              <Wrench className="w-4 h-4" />
              <span>Report Maintenance</span>
            </button>
          )}
        </div>
      </div>

      {asset.needs_attention && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col space-y-2">
          <div className="flex items-center space-x-2 text-red-400 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span className="uppercase tracking-wide text-sm">Needs Attention</span>
          </div>
          {asset.attention_reasons && asset.attention_reasons.length > 0 && (
            <div className="text-red-300 text-xs font-semibold ml-7">
              Reason:
              <ul className="list-disc ml-5 mt-1 space-y-0.5">
                {asset.attention_reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Current Status</span>
          <div className="text-base font-extrabold text-cyan-400">{asset.status.replace('_', ' ')}</div>
          <p className="text-[11px] text-slate-500">Lifecycle state</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Condition Rating</span>
          <div className="text-base font-extrabold text-emerald-400">{asset.condition}</div>
          <p className="text-[11px] text-slate-500">Field inspection score</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Acquisition Cost</span>
          <div className="text-base font-extrabold text-white">
            {asset.acquisition_cost ? `₹${(asset.acquisition_cost / 100000).toFixed(1)} Lakhs` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500">Contract value</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Vendor / Contractor</span>
          <div className="text-base font-extrabold text-slate-200 truncate">{asset.vendor || 'N/A'}</div>
          <p className="text-[11px] text-slate-500">Execution partner</p>
        </div>

      </div>

      {/* Asset Specifications & Address Details */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Asset Metadata & Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Description</span>
            <p className="text-slate-200 font-medium">{asset.description || 'No additional specification notes registered.'}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Location Address</span>
            <p className="text-slate-200 font-medium">{asset.location_address || 'District infrastructure hub'}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Installation / Commission Date</span>
            <p className="text-slate-200 font-medium">{asset.installation_date || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Unpinned Location Banner */}
      {(!asset.latitude || !asset.longitude) && (
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-200 text-sm">📍 Location Not Pinned on Map</h4>
              <p className="text-xs text-amber-300/80">This asset does not have geographic coordinates assigned yet. Use the interactive map picker to pin its exact location.</p>
            </div>
          </div>
          <button
            onClick={() => setLocationModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <MapPin className="w-4 h-4" />
            <span>Locate Asset on Map</span>
          </button>
        </div>
      )}

      {/* Individual Asset Geographic Location Map Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-extrabold text-white">Asset Geographic Location Map</h3>
          </div>
          <button
            onClick={() => setLocationModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{asset.latitude && asset.longitude ? 'Re-pin Location' : 'Locate on Map'}</span>
          </button>
        </div>
        <InfrastructureMap assets={[asset]} height="380px" singleAssetMode={true} />
      </div>

      {/* Timeline Tabs: History, Inspections, Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lifecycle History Log Timeline */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Lifecycle Audit Timeline</h3>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {history.map((h) => (
              <div key={h.id} className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-slate-900"></div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>{h.old_status ? `${h.old_status} → ${h.new_status}` : `Initial: ${h.new_status}`}</span>
                  </div>
                  <p className="text-xs text-slate-400">{h.reason || 'Status updated'}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>By: {h.changed_by}</span>
                    <span className="font-mono">{new Date(h.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inspections History */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Inspection Logs</h3>
          </div>

          <div className="space-y-3">
            {inspections.length === 0 ? (
              <p className="text-xs text-slate-500">No inspections logged yet.</p>
            ) : (
              inspections.map((insp) => (
                <div key={insp.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-emerald-400">Condition: {insp.condition}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(insp.inspection_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 italic">"{insp.remarks}"</p>
                  <p className="text-[10px] text-slate-500">Inspector: {insp.inspected_by}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maintenance Tickets */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Wrench className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">Maintenance Work Orders</h3>
          </div>

          <div className="space-y-3">
            {maintenances.length === 0 ? (
              <p className="text-xs text-slate-500">No active or past maintenance work orders.</p>
            ) : (
              maintenances.map((maint) => (
                <div key={maint.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-orange-400">{maint.issue}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">{maint.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Priority: {maint.priority}</span>
                    <span>Assigned: {maint.assigned_to}</span>
                  </div>
                  {maint.estimated_cost && (
                    <div className="text-[10px] text-cyan-400 font-semibold">
                      Est Cost: ₹{maint.estimated_cost.toLocaleString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal 1: Status Change */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full space-y-4 bg-slate-900">
            <h3 className="text-lg font-bold text-white">Change Asset Lifecycle Status</h3>
            <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Status</label>
                <select
                  value={statusForm.new_status}
                  onChange={(e) => setStatusForm({ ...statusForm, new_status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="PLANNED">PLANNED</option>
                  <option value="PROCURED">PROCURED</option>
                  <option value="UNDER_CONSTRUCTION">UNDER CONSTRUCTION</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                  <option value="RETIRED">RETIRED</option>
                  <option value="DISPOSED">DISPOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Change *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled asphalt resurfacing"
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Officer Name</label>
                <input
                  type="text"
                  value={statusForm.changed_by}
                  onChange={(e) => setStatusForm({ ...statusForm, changed_by: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Inspection */}
      {inspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full space-y-4 bg-slate-900">
            <h3 className="text-lg font-bold text-white">Log Field Inspection</h3>
            <form onSubmit={handleInspectionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Inspector Name *</label>
                <input
                  type="text"
                  required
                  value={inspectionForm.inspected_by}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, inspected_by: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Condition Score *</label>
                <select
                  value={inspectionForm.condition}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, condition: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="GOOD">GOOD</option>
                  <option value="FAIR">FAIR</option>
                  <option value="POOR">POOR</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Remarks / Audit Notes</label>
                <textarea
                  rows={3}
                  value={inspectionForm.remarks}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Log Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Maintenance Work Order */}
      {maintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full space-y-4 bg-slate-900">
            <h3 className="text-lg font-bold text-white">Report Maintenance Work Order</h3>
            <form onSubmit={handleMaintenanceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Issue Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subsurface water leakage or pavement cracking"
                  value={maintenanceForm.issue}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issue: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                <select
                  value={maintenanceForm.priority}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Division/Team</label>
                <input
                  type="text"
                  value={maintenanceForm.assigned_to}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, assigned_to: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Budget Cost (₹)</label>
                <input
                  type="number"
                  value={maintenanceForm.estimated_cost}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, estimated_cost: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMaintenanceModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Interactive Location Picker */}
      <LocationPickerModal
        isOpen={locationModal}
        onClose={() => setLocationModal(false)}
        onConfirm={handleLocationSave}
        district={asset.district || 'Ahmedabad'}
        addressHint={asset.location_address || ''}
        initialLat={asset.latitude}
        initialLng={asset.longitude}
      />

    </div>
  );
}
