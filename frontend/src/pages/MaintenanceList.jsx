import React, { useEffect, useState } from 'react';
import { getMaintenances, updateMaintenance } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wrench, CheckCircle2, Clock, AlertTriangle, UserCheck, DollarSign } from 'lucide-react';

const PRIORITY_BADGE = {
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

const STATUS_BADGE = {
  REPORTED: 'bg-slate-800 text-slate-300 border-slate-700',
  ASSIGNED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  IN_PROGRESS: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  VERIFIED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

export default function MaintenanceList() {
  const { user } = useAuth();
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const data = await getMaintenances();
      setMaintenances(data);
    } catch (err) {
      console.error('Failed to fetch maintenance tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const handleStatusChange = async (maintId, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'COMPLETED') {
        payload.completed_at = new Date().toISOString();
      }
      await updateMaintenance(maintId, payload);
      fetchMaintenances();
    } catch (err) {
      alert('Failed to update maintenance status.');
    }
  };

  const filtered = selectedStatus
    ? maintenances.filter((m) => m.status === selectedStatus)
    : maintenances;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-6 h-6 text-orange-400" />
            <h1 className="text-2xl font-extrabold text-white">Maintenance Work Orders</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Track issues, priority dispatching, and repair costs across Gujarat infrastructure.</p>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="">Status: All Work Orders</option>
            <option value="REPORTED">REPORTED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="VERIFIED">VERIFIED</option>
          </select>
        </div>
      </div>

      {/* Work Orders List Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm font-semibold">
          Loading maintenance tickets...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          No maintenance tickets match the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((maint) => {
            const priorityStyle = PRIORITY_BADGE[maint.priority] || 'bg-slate-800 text-slate-300';
            const statusStyle = STATUS_BADGE[maint.status] || 'bg-slate-800 text-slate-300';

            return (
              <div
                key={maint.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">Asset Ticket #{maint.asset_id}</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{maint.issue}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold ${priorityStyle}`}>
                    {maint.priority} PRIORITY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-900">
                  <div>
                    <span className="block text-[10px] text-slate-500">Reported By</span>
                    <span className="font-medium text-slate-300">{maint.reported_by || 'Field Officer'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Assigned Squad</span>
                    <span className="font-medium text-slate-300">{maint.assigned_to || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Est. Cost</span>
                    <span className="font-medium text-cyan-400">₹{maint.estimated_cost ? maint.estimated_cost.toLocaleString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Report Date</span>
                    <span className="font-mono text-slate-400">{new Date(maint.reported_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Workflow Status Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className={`px-2.5 py-1 rounded border text-[10px] font-bold ${statusStyle}`}>
                    Status: {maint.status.replace('_', ' ')}
                  </span>

                  {user && ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'MAINTENANCE_OFFICER', 'CONTRACTOR'].includes(user.role) && (
                    <div className="flex items-center space-x-2">
                      {maint.status === 'REPORTED' && (
                        <button
                          onClick={() => handleStatusChange(maint.id, 'ASSIGNED')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                        >
                          Assign Team
                        </button>
                      )}

                      {maint.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleStatusChange(maint.id, 'IN_PROGRESS')}
                          className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                        >
                          Start Work
                        </button>
                      )}

                      {maint.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusChange(maint.id, 'COMPLETED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Mark Completed
                        </button>
                      )}

                      {maint.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleStatusChange(maint.id, 'VERIFIED')}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                        >
                          Audit & Verify
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
