import React, { useEffect, useState } from 'react';
import { getAssets } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search, Plus, Filter, Database, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Building2, MapPin, AlertTriangle
} from 'lucide-react';

const STATUS_BADGE = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  UNDER_MAINTENANCE: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  UNDER_CONSTRUCTION: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  PLANNED: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  PROCURED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  RETIRED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  DISPOSED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const CONDITION_BADGE = {
  EXCELLENT: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  GOOD: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  FAIR: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  POOR: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
};

export default function AssetList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState(false);

  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const limit = 15;

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * limit,
        limit,
      };
      if (search) params.search = search;
      if (assetType) params.asset_type = assetType;
      if (statusFilter) params.status = statusFilter;
      if (conditionFilter) params.condition = conditionFilter;
      if (districtFilter) params.district = districtFilter;
      if (departmentFilter) params.department = departmentFilter;
      if (needsAttentionFilter) params.needs_attention = true;

      const data = await getAssets(params);
      setAssets(data);
    } catch (err) {
      console.error('Failed to fetch assets list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [search, assetType, statusFilter, conditionFilter, districtFilter, departmentFilter, needsAttentionFilter, page]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-white">Infrastructure Asset Inventory</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Search, filter, and track public infrastructure assets across Gujarat state.</p>
        </div>

        {user && (user.role === 'SUPER_ADMIN' || user.role === 'DEPARTMENT_ADMIN' || user.role === 'DISTRICT_OFFICER') && (
          <Link
            to="/assets/new"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Infrastructure Asset</span>
          </Link>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search assets by code, name, department, district, address, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="">Asset Type: All</option>
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="">Status: All</option>
            <option value="PLANNED">PLANNED</option>
            <option value="PROCURED">PROCURED</option>
            <option value="UNDER_CONSTRUCTION">UNDER CONSTRUCTION</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
            <option value="RETIRED">RETIRED</option>
            <option value="DISPOSED">DISPOSED</option>
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="">Condition: All</option>
            <option value="EXCELLENT">EXCELLENT</option>
            <option value="GOOD">GOOD</option>
            <option value="FAIR">FAIR</option>
            <option value="POOR">POOR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="">District: All</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Surat">Surat</option>
            <option value="Vadodara">Vadodara</option>
            <option value="Rajkot">Rajkot</option>
            <option value="Kutch">Kutch</option>
            <option value="Bhavnagar">Bhavnagar</option>
            <option value="Mehsana">Mehsana</option>
          </select>

          <button
            onClick={() => setNeedsAttentionFilter(!needsAttentionFilter)}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
              needsAttentionFilter
                ? 'bg-red-500/10 border-red-500 text-red-400'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-red-500/50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Needs Attention</span>
          </button>

          <button
            onClick={() => {
              setSearch('');
              setAssetType('');
              setStatusFilter('');
              setConditionFilter('');
              setDistrictFilter('');
              setDepartmentFilter('');
              setNeedsAttentionFilter(false);
              setPage(1);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
          >
            Reset Filters
          </button>

        </div>

      </div>

      {/* Asset Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold">
            Loading asset inventory records...
          </div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No infrastructure assets matched your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800 tracking-wider">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Asset Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">District / Zone</th>
                  <th className="py-3.5 px-4">Map Location</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assets.map((asset) => {
                  const statusStyle = STATUS_BADGE[asset.status] || 'bg-slate-800 text-slate-300';
                  const condStyle = CONDITION_BADGE[asset.condition] || 'text-slate-300';
                  const isLocated = asset.latitude !== null && asset.latitude !== undefined && asset.longitude !== null && asset.longitude !== undefined;

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => navigate(`/assets/${asset.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 group-hover:underline">
                        {asset.asset_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 max-w-[220px] truncate">{asset.name}</div>
                        {asset.needs_attention && (
                          <div className="mt-1 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Needs Attention</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {asset.asset_type.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-semibold text-slate-200">{asset.district}</div>
                        <div className="text-[10px] text-slate-500">{asset.zone || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isLocated ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <MapPin className="w-3 h-3" />
                            <span>Located</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>Not pinned</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-[160px] truncate">
                        {asset.department || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold ${statusStyle}`}>
                          {asset.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold ${condStyle}`}>
                          {asset.condition}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assets/${asset.id}`);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {page}</span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={assets.length < limit}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
