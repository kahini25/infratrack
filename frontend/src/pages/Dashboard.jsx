import React, { useEffect, useState } from 'react';
import { getDashboardStats, getAssets } from '../services/api';
import InfrastructureMap from '../components/InfrastructureMap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Building2, Activity, AlertTriangle, ShieldCheck, Wrench, Filter, MapPin, History, RefreshCw
} from 'lucide-react';

const CONDITION_COLORS = {
  EXCELLENT: '#06b6d4',
  GOOD: '#22c55e',
  FAIR: '#eab308',
  POOR: '#f97316',
  CRITICAL: '#ef4444'
};

const STATUS_COLORS = {
  ACTIVE: '#22c55e',
  UNDER_MAINTENANCE: '#f97316',
  UNDER_CONSTRUCTION: '#3b82f6',
  PLANNED: '#8b5cf6',
  PROCURED: '#06b6d4',
  RETIRED: '#64748b',
  DISPOSED: '#ef4444'
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state (Department, District, Asset Type, Condition)
  const [deptFilter, setDeptFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await getDashboardStats();
      setStats(statsData);

      const params = {};
      if (deptFilter) params.department = deptFilter;
      if (districtFilter) params.district = districtFilter;
      if (typeFilter) params.asset_type = typeFilter;
      if (conditionFilter) params.condition = conditionFilter;
      if (needsAttentionFilter) params.needs_attention = true;

      const assetsData = await getAssets(params);
      setAssets(assetsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [deptFilter, districtFilter, typeFilter, conditionFilter, needsAttentionFilter]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-400">Loading State Infrastructure Dashboard...</span>
        </div>
      </div>
    );
  }

  const conditionChartData = stats?.assets_by_condition
    ? Object.entries(stats.assets_by_condition).map(([key, val]) => ({ name: key, value: val }))
    : [];

  const statusChartData = stats?.assets_by_status
    ? Object.entries(stats.assets_by_status).map(([key, val]) => ({ name: key, value: val }))
    : [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Dashboard Top Header & Scope Filters */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Gujarat State Infrastructure Dashboard</h1>
            </div>

          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>State Inventory Live Node</span>
          </div>
        </div>

        {/* State / Department / District / Type / Condition Filter Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Scope & Map Filters</span>
            </div>

            {(deptFilter || districtFilter || typeFilter || conditionFilter || needsAttentionFilter) && (
              <button
                onClick={() => {
                  setDeptFilter('');
                  setDistrictFilter('');
                  setTypeFilter('');
                  setConditionFilter('');
                  setNeedsAttentionFilter(false);
                }}
                className="flex items-center space-x-1 text-xs text-cyan-400 hover:underline font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="">District: All Districts</option>
              {stats?.assets_by_district && Object.keys(stats.assets_by_district).map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="">Department: All</option>
              {stats?.assets_by_department && Object.keys(stats.assets_by_department).map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Asset Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="">Type: All Types</option>
              <option value="ROAD">Road</option>
              <option value="BRIDGE">Bridge</option>
              <option value="GOVERNMENT_BUILDING">Government Building</option>
              <option value="SCHOOL">School</option>
              <option value="HOSPITAL">Hospital</option>
              <option value="STREETLIGHT">Streetlight</option>
              <option value="TRAFFIC_SIGNAL">Traffic Signal</option>
              <option value="WATER_PIPELINE">Water Pipeline</option>
              <option value="CCTV">CCTV</option>
              <option value="PUBLIC_FACILITY">Public Facility</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Condition Filter */}
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="">Condition: All</option>
              <option value="EXCELLENT">EXCELLENT</option>
              <option value="GOOD">GOOD</option>
              <option value="FAIR">FAIR</option>
              <option value="POOR">POOR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

          </div>
        </div>

      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Assets</span>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><Building2 className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{stats?.total_assets || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Tracked across State</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Assets</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Activity className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{stats?.assets_by_status?.ACTIVE || 0}</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">Fully Operational</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance</span>
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Wrench className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{stats?.active_maintenances || 0}</div>
          <p className="text-[11px] text-orange-400 mt-1 font-semibold">Active Work Tickets</p>
        </div>

        <div 
          onClick={() => setNeedsAttentionFilter(!needsAttentionFilter)}
          className={`glass-panel p-5 rounded-xl border transition-all cursor-pointer ${needsAttentionFilter ? 'border-red-500 bg-red-500/10' : 'border-slate-800 hover:border-red-500/40'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Needs Attention</span>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><AlertTriangle className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">{stats?.needs_attention_count || 0}</div>
          <p className="text-[11px] text-red-400 mt-1 font-semibold">Click to filter assets</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Maint. Cost</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><span className="font-bold text-xs">₹</span></div>
          </div>
          <div className="mt-3 text-lg font-black text-white">
            ₹{((stats?.maintenance_expenditure?.estimated_total || 0) / 100000).toFixed(1)}L
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Est. Work Budget</p>
        </div>

      </div>

      {/* Geospatial Infrastructure Leaflet Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-extrabold text-white">Geospatial Infrastructure Map (Leaflet / OpenStreetMap)</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Filtered Assets: {assets.length}</span>
        </div>

        <InfrastructureMap assets={assets} height="540px" />
      </div>

      {/* Recharts Data Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4">Infrastructure Condition Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conditionChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {conditionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CONDITION_COLORS[entry.name] || '#0284c7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4">Lifecycle Status Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Activity Logs & Inspections Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Recent Lifecycle Audit Logs</h3>
            </div>
          </div>

          <div className="space-y-3">
            {stats?.recent_lifecycle_changes?.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-cyan-400">Asset #{log.asset_id}</span>
                    <span className="text-slate-500 font-mono">→ {log.new_status}</span>
                  </div>
                  <p className="text-slate-400 mt-1">{log.reason || 'Status update logged'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">{log.changed_by}</span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(log.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Recent Field Inspections</h3>
            </div>
          </div>

          <div className="space-y-3">
            {stats?.recent_inspections?.map((insp) => (
              <div key={insp.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-200">Asset #{insp.asset_id}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-semibold text-emerald-400 border border-slate-700">
                      Condition: {insp.condition}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1 italic">"{insp.remarks}"</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-300 font-medium">{insp.inspected_by}</span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(insp.inspection_date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
