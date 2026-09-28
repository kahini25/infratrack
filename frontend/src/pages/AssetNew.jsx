import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAsset } from '../services/api';
import LocationPickerModal from '../components/LocationPickerModal';
import { PlusCircle, ArrowLeft, Save, AlertCircle, MapPin, Check, RefreshCw } from 'lucide-react';

export default function AssetNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    asset_code: '',
    name: '',
    asset_type: 'ROAD',
    description: '',
    department: 'Roads & Buildings Department',
    state: 'Gujarat',
    district: 'Ahmedabad',
    location_address: '',
    zone: 'WEST_ZONE',
    latitude: null,
    longitude: null,
    status: 'PLANNED',
    condition: 'GOOD',
    installation_date: '',
    acquisition_cost: '',
    vendor: '',
    warranty_expiry: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationConfirm = (coords) => {
    setFormData((prev) => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        asset_code: formData.asset_code.trim(),
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : null,
        department: formData.department ? formData.department.trim() : null,
        district: formData.district ? formData.district.trim() : null,
        location_address: formData.location_address ? formData.location_address.trim() : null,
        zone: formData.zone ? formData.zone.trim() : null,
        vendor: formData.vendor ? formData.vendor.trim() : null,
        acquisition_cost: formData.acquisition_cost !== '' && formData.acquisition_cost !== null ? parseFloat(formData.acquisition_cost) : null,
        latitude: formData.latitude !== null && !isNaN(formData.latitude) ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== null && !isNaN(formData.longitude) ? parseFloat(formData.longitude) : null,
        installation_date: formData.installation_date || null,
        warranty_expiry: formData.warranty_expiry || null
      };

      const created = await createAsset(payload);
      navigate(`/assets/${created.id}`);
    } catch (err) {
      console.error('Failed to create asset:', err);
      const detail = err.response?.data?.detail;
      let msg = 'Failed to create asset. Check required fields.';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail)) {
        msg = detail.map((d) => `${d.loc ? d.loc.slice(-1) : ''}: ${d.msg}`).join(' | ');
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Register Infrastructure Asset</h1>
            <p className="text-xs text-slate-400">Register new state public asset into inventory tracking system.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Validated Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-8">
        
        {/* SECTION 1: Asset Information */}
        <div>
          <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Section 1: Asset Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Code *</label>
              <input
                type="text"
                name="asset_code"
                required
                placeholder="e.g. RD-AHM-105"
                value={formData.asset_code}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. SG Highway Section 2 Bridge"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Type *</label>
              <select
                name="asset_type"
                value={formData.asset_type}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
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
            </div>

          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Technical specs or general notes..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* SECTION 2: Administrative Information */}
        <div>
          <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Section 2: Administrative Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Gandhinagar">Gandhinagar</option>
                <option value="Surat">Surat</option>
                <option value="Vadodara">Vadodara</option>
                <option value="Rajkot">Rajkot</option>
                <option value="Kutch">Kutch</option>
                <option value="Bhavnagar">Bhavnagar</option>
                <option value="Mehsana">Mehsana</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Zone</label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

          </div>
        </div>

        {/* SECTION 3: Location & Map Pinning */}
        <div>
          <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Section 3: Location & Map Coordinates
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location Address / Area</label>
              <input
                type="text"
                name="location_address"
                placeholder="e.g. S.G. Highway Near Thaltej Crossroad, Ahmedabad"
                value={formData.location_address}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Map Picker Trigger Button & Pinned Coordinates Display */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1">Geospatial Coordinates (Optional)</span>
                {formData.latitude !== null && formData.longitude !== null ? (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span>📍 Pinned on Map</span>
                    <span className="font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Lat: {formData.latitude}, Lng: {formData.longitude}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    📍 Location not pinned (Can be added on map or saved without coordinates)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all shrink-0"
              >
                <MapPin className="w-4 h-4" />
                <span>{formData.latitude !== null ? 'Change Location on Map' : 'Locate on Map'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: Lifecycle & Condition */}
        <div>
          <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Section 4: Lifecycle & Condition
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="PLANNED">PLANNED</option>
                <option value="PROCURED">PROCURED</option>
                <option value="UNDER_CONSTRUCTION">UNDER CONSTRUCTION</option>
                <option value="ACTIVE">ACTIVE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="EXCELLENT">EXCELLENT</option>
                <option value="GOOD">GOOD</option>
                <option value="FAIR">FAIR</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Installation / Commission Date</label>
              <input
                type="date"
                name="installation_date"
                value={formData.installation_date}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

          </div>
        </div>

        {/* SECTION 5: Financial & Vendor Information */}
        <div>
          <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Section 5: Financial & Vendor Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Acquisition Cost (₹)</label>
              <input
                type="number"
                name="acquisition_cost"
                placeholder="Cost in INR"
                value={formData.acquisition_cost}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vendor / Contractor</label>
              <input
                type="text"
                name="vendor"
                placeholder="e.g. Larsen & Toubro"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Warranty Expiry Date</label>
              <input
                type="date"
                name="warranty_expiry"
                value={formData.warranty_expiry}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Registering...' : 'Register Asset'}</span>
          </button>
        </div>

      </form>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handleLocationConfirm}
        district={formData.district}
        initialLat={formData.latitude}
        initialLng={formData.longitude}
        addressHint={formData.location_address}
      />

    </div>
  );
}
