import React, { useState, useEffect } from 'react';
import {
  Ship,
  Anchor,
  Compass,
  Package,
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
} from 'lucide-react';
import { Vessel, Port, SeaRoute, CargoCategory, Customer } from '../types';

export const MasterDataView: React.FC = () => {
  const [subTab, setSubTab] = useState<'vessels' | 'ports' | 'routes' | 'cargo' | 'customers'>('vessels');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Master Data Lists
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [routes, setRoutes] = useState<SeaRoute[]>([]);
  const [cargoCategories, setCargoCategories] = useState<CargoCategory[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form fields for vessels
  const [vesselForm, setVesselForm] = useState({
    name: '',
    code: '',
    type: 'Kapal Kontainer',
    capacity: 1000,
    capacityUnit: 'TEU',
    buildYear: 2020,
    flag: 'Indonesia',
    status: 'Aktif',
    currentLocation: 'Pelabuhan Tanjung Priok',
    notes: '',
  });

  // Form fields for ports
  const [portForm, setPortForm] = useState({
    code: '',
    name: '',
    city: '',
    province: '',
    country: 'Indonesia',
  });

  // Form fields for routes
  const [routeForm, setRouteForm] = useState({
    originPortId: 0,
    destinationPortId: 0,
    distanceNm: 400,
    estDurationHours: 24,
    baseRatePerTeu: 5000000,
  });

  // Form fields for cargo categories
  const [cargoForm, setCargoForm] = useState({
    code: '',
    name: '',
    categoryType: 'General Cargo',
    handlingFee: 500000,
    description: '',
  });

  // Form fields for customers
  const [customerForm, setCustomerForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    npwp: '',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch all master data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resVessels, resPorts, resRoutes, resCargo, resCust] = await Promise.all([
        fetch('/api/vessels').then((r) => r.json()),
        fetch('/api/ports').then((r) => r.json()),
        fetch('/api/routes').then((r) => r.json()),
        fetch('/api/cargo-categories').then((r) => r.json()),
        fetch('/api/customers').then((r) => r.json()),
      ]);

      setVessels(Array.isArray(resVessels) ? resVessels : []);
      setPorts(Array.isArray(resPorts) ? resPorts : []);
      setRoutes(Array.isArray(resRoutes) ? resRoutes : []);
      setCargoCategories(Array.isArray(resCargo) ? resCargo : []);
      setCustomers(Array.isArray(resCust) ? resCust : []);
    } catch (err) {
      console.error('Error fetching master data:', err);
      showToast('Gagal memuat data dari database Cloud SQL.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal handler
  const handleOpenAdd = () => {
    setEditingItem(null);
    if (subTab === 'vessels') {
      setVesselForm({
        name: '',
        code: `IMO-${Math.floor(1000000 + Math.random() * 9000000)}`,
        type: 'Kapal Kontainer',
        capacity: 1000,
        capacityUnit: 'TEU',
        buildYear: 2021,
        flag: 'Indonesia',
        status: 'Aktif',
        currentLocation: 'Pelabuhan Tanjung Priok',
        notes: '',
      });
    } else if (subTab === 'ports') {
      setPortForm({
        code: '',
        name: '',
        city: '',
        province: '',
        country: 'Indonesia',
      });
    } else if (subTab === 'routes') {
      setRouteForm({
        originPortId: ports[0]?.id || 0,
        destinationPortId: ports[1]?.id || ports[0]?.id || 0,
        distanceNm: 450,
        estDurationHours: 28,
        baseRatePerTeu: 5500000,
      });
    } else if (subTab === 'cargo') {
      setCargoForm({
        code: '',
        name: '',
        categoryType: 'General Cargo',
        handlingFee: 500000,
        description: '',
      });
    } else if (subTab === 'customers') {
      setCustomerForm({
        companyName: '',
        contactPerson: '',
        phone: '+62 ',
        email: '',
        address: '',
        npwp: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    if (subTab === 'vessels') {
      setVesselForm({
        name: item.name,
        code: item.code,
        type: item.type,
        capacity: item.capacity,
        capacityUnit: item.capacityUnit,
        buildYear: item.buildYear,
        flag: item.flag,
        status: item.status,
        currentLocation: item.currentLocation || '',
        notes: item.notes || '',
      });
    } else if (subTab === 'ports') {
      setPortForm({
        code: item.code,
        name: item.name,
        city: item.city,
        province: item.province,
        country: item.country,
      });
    } else if (subTab === 'routes') {
      setRouteForm({
        originPortId: item.originPortId,
        destinationPortId: item.destinationPortId,
        distanceNm: item.distanceNm,
        estDurationHours: item.estDurationHours,
        baseRatePerTeu: item.baseRatePerTeu,
      });
    } else if (subTab === 'cargo') {
      setCargoForm({
        code: item.code,
        name: item.name,
        categoryType: item.categoryType,
        handlingFee: item.handlingFee,
        description: item.description || '',
      });
    } else if (subTab === 'customers') {
      setCustomerForm({
        companyName: item.companyName,
        contactPerson: item.contactPerson,
        phone: item.phone,
        email: item.email,
        address: item.address,
        npwp: item.npwp || '',
      });
    }
    setIsModalOpen(true);
  };

  // Submit form handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = '';
      let payload: any = {};

      if (subTab === 'vessels') {
        endpoint = editingItem ? `/api/vessels/${editingItem.id}` : '/api/vessels';
        payload = vesselForm;
      } else if (subTab === 'ports') {
        endpoint = editingItem ? `/api/ports/${editingItem.id}` : '/api/ports';
        payload = portForm;
      } else if (subTab === 'routes') {
        endpoint = editingItem ? `/api/routes/${editingItem.id}` : '/api/routes';
        payload = routeForm;
      } else if (subTab === 'cargo') {
        endpoint = editingItem ? `/api/cargo-categories/${editingItem.id}` : '/api/cargo-categories';
        payload = cargoForm;
      } else if (subTab === 'customers') {
        endpoint = editingItem ? `/api/customers/${editingItem.id}` : '/api/customers';
        payload = customerForm;
      }

      const res = await fetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Operasi gagal disimpan');
      }

      showToast(
        editingItem ? 'Data berhasil diperbarui di database!' : 'Data baru berhasil ditambahkan ke database!'
      );
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan data', 'error');
    }
  };

  // Delete handler
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Konfirmasi hapus "${name}" dari database?`)) return;
    try {
      let endpoint = '';
      if (subTab === 'vessels') endpoint = `/api/vessels/${id}`;
      else if (subTab === 'ports') endpoint = `/api/ports/${id}`;
      else if (subTab === 'routes') endpoint = `/api/routes/${id}`;
      else if (subTab === 'cargo') endpoint = `/api/cargo-categories/${id}`;
      else if (subTab === 'customers') endpoint = `/api/customers/${id}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus data.');

      showToast('Data berhasil dihapus dari Cloud SQL.');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus data.', 'error');
    }
  };

  // Filtered lists
  const filteredVessels = vessels.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPorts = ports.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoutes = routes.filter(
    (r) =>
      r.originPort?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destinationPort?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCargo = cargoCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm shadow-md transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Sub navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Master Data Pelayaran</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Kelola data induk armada kapal, pelabuhan rute, kategori kargo, dan direktori pelanggan
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchData}
            title="Refresh Data"
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="add-master-data-btn"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center space-x-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>
              Tambah{' '}
              {subTab === 'vessels'
                ? 'Kapal'
                : subTab === 'ports'
                ? 'Pelabuhan'
                : subTab === 'routes'
                ? 'Rute'
                : subTab === 'cargo'
                ? 'Kategori Kargo'
                : 'Pelanggan'}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-tabs pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setSubTab('vessels');
            setSearchQuery('');
          }}
          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 border transition-colors ${
            subTab === 'vessels'
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Ship className="w-4 h-4" />
          <span>Armada Kapal ({vessels.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab('ports');
            setSearchQuery('');
          }}
          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 border transition-colors ${
            subTab === 'ports'
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>Pelabuhan ({ports.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab('routes');
            setSearchQuery('');
          }}
          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 border transition-colors ${
            subTab === 'routes'
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Rute Pelayaran ({routes.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab('cargo');
            setSearchQuery('');
          }}
          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 border transition-colors ${
            subTab === 'cargo'
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Kategori Kargo ({cargoCategories.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab('customers');
            setSearchQuery('');
          }}
          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 border transition-colors ${
            subTab === 'customers'
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pelanggan / Shippers ({customers.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm max-w-md">
        <Search className="w-4 h-4 text-slate-500 mr-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Cari ${
            subTab === 'vessels'
              ? 'nama kapal, IMO, tipe...'
              : subTab === 'ports'
              ? 'pelabuhan, kode, kota...'
              : subTab === 'routes'
              ? 'rute pelabuhan...'
              : subTab === 'cargo'
              ? 'kategori kargo...'
              : 'nama perusahaan shipper...'
          }`}
          className="bg-transparent border-none text-white focus:outline-none w-full text-xs sm:text-sm placeholder-slate-500"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table Data View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {/* 1. VESSEL TABLE */}
        {subTab === 'vessels' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Nama Armada</th>
                  <th className="px-4 py-3">Kode IMO</th>
                  <th className="px-4 py-3">Tipe Kapal</th>
                  <th className="px-4 py-3">Kapasitas</th>
                  <th className="px-4 py-3">Tahun & Bendera</th>
                  <th className="px-4 py-3">Status & Posisi</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredVessels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data armada kapal yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredVessels.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">
                        <div className="flex items-center space-x-2">
                          <Ship className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span>{v.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-300">{v.code}</td>
                      <td className="px-4 py-3">{v.type}</td>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {v.capacity.toLocaleString('id-ID')} {v.capacityUnit}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {v.buildYear} • {v.flag}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            v.status === 'Berlayar'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : v.status === 'Aktif'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {v.status}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                          {v.currentLocation}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          title="Edit Kapal"
                          className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.name)}
                          title="Hapus Kapal"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. PORTS TABLE */}
        {subTab === 'ports' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Kode Pelabuhan</th>
                  <th className="px-4 py-3">Nama Pelabuhan</th>
                  <th className="px-4 py-3">Kota</th>
                  <th className="px-4 py-3">Provinsi & Negara</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPorts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data pelabuhan.
                    </td>
                  </tr>
                ) : (
                  filteredPorts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-blue-300">{p.code}</td>
                      <td className="px-4 py-3 font-semibold text-white">
                        <div className="flex items-center space-x-2">
                          <Anchor className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{p.city}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {p.province}, {p.country}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. ROUTES TABLE */}
        {subTab === 'routes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Rute Pelayaran</th>
                  <th className="px-4 py-3">Jarak Tempuh</th>
                  <th className="px-4 py-3">Estimasi Durasi</th>
                  <th className="px-4 py-3">Tarif Dasar / TEU</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data rute pelayaran.
                    </td>
                  </tr>
                ) : (
                  filteredRoutes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">
                        <div className="flex items-center space-x-2">
                          <Compass className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span>
                            {r.originPort?.name || 'Pelabuhan Asal'} ➔ {r.destinationPort?.name || 'Pelabuhan Tujuan'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{r.distanceNm} NM (Nautical Miles)</td>
                      <td className="px-4 py-3">{r.estDurationHours} Jam (~{(r.estDurationHours / 24).toFixed(1)} Hari)</td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">
                        Rp {r.baseRatePerTeu.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id, `Rute #${r.id}`)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. CARGO CATEGORIES TABLE */}
        {subTab === 'cargo' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Kode Kargo</th>
                  <th className="px-4 py-3">Nama Kategori</th>
                  <th className="px-4 py-3">Tipe Kargo</th>
                  <th className="px-4 py-3">Handling Fee (THC)</th>
                  <th className="px-4 py-3">Deskripsi / Penanganan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCargo.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data kategori kargo.
                    </td>
                  </tr>
                ) : (
                  filteredCargo.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-blue-300">{c.code}</td>
                      <td className="px-4 py-3 font-semibold text-white">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {c.categoryType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-emerald-400">
                        Rp {c.handlingFee.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">{c.description || '-'}</td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. CUSTOMERS TABLE */}
        {subTab === 'customers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Perusahaan Shipper</th>
                  <th className="px-4 py-3">Kontak Person</th>
                  <th className="px-4 py-3">Telepon & Email</th>
                  <th className="px-4 py-3">NPWP</th>
                  <th className="px-4 py-3">Alamat Kantor / Gudang</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data pelanggan.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span>{c.companyName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{c.contactPerson}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-slate-200">{c.phone}</div>
                        <div className="text-slate-400">{c.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{c.npwp || '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">{c.address}</td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.companyName)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingItem ? 'Edit' : 'Tambah'}{' '}
                {subTab === 'vessels'
                  ? 'Data Kapal'
                  : subTab === 'ports'
                  ? 'Pelabuhan'
                  : subTab === 'routes'
                  ? 'Rute Pelayaran'
                  : subTab === 'cargo'
                  ? 'Kategori Kargo'
                  : 'Data Pelanggan'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* VESSEL FORM */}
              {subTab === 'vessels' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nama Kapal</label>
                      <input
                        type="text"
                        required
                        value={vesselForm.name}
                        onChange={(e) => setVesselForm({ ...vesselForm, name: e.target.value })}
                        placeholder="Contoh: KM Samudera Jaya"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Kode IMO / Call Sign</label>
                      <input
                        type="text"
                        required
                        value={vesselForm.code}
                        onChange={(e) => setVesselForm({ ...vesselForm, code: e.target.value })}
                        placeholder="IMO-982101"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tipe Kapal</label>
                      <select
                        value={vesselForm.type}
                        onChange={(e) => setVesselForm({ ...vesselForm, type: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Kapal Kontainer">Kapal Kontainer</option>
                        <option value="Bulk Carrier">Bulk Carrier</option>
                        <option value="Kapal Tanker">Kapal Tanker</option>
                        <option value="Kapal Ro-Ro">Kapal Ro-Ro</option>
                        <option value="General Cargo">General Cargo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Kapasitas</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={vesselForm.capacity}
                        onChange={(e) => setVesselForm({ ...vesselForm, capacity: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Satuan</label>
                      <select
                        value={vesselForm.capacityUnit}
                        onChange={(e) => setVesselForm({ ...vesselForm, capacityUnit: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="TEU">TEU</option>
                        <option value="Ton">Ton</option>
                        <option value="DWT">DWT</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tahun Pembuatan</label>
                      <input
                        type="number"
                        value={vesselForm.buildYear}
                        onChange={(e) => setVesselForm({ ...vesselForm, buildYear: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Bendera</label>
                      <input
                        type="text"
                        value={vesselForm.flag}
                        onChange={(e) => setVesselForm({ ...vesselForm, flag: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Status Kapal</label>
                      <select
                        value={vesselForm.status}
                        onChange={(e) => setVesselForm({ ...vesselForm, status: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Berlayar">Berlayar</option>
                        <option value="Docking / Maintenance">Docking / Maintenance</option>
                        <option value="Siaga">Siaga</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Lokasi / Posisi Terkini</label>
                    <input
                      type="text"
                      value={vesselForm.currentLocation}
                      onChange={(e) => setVesselForm({ ...vesselForm, currentLocation: e.target.value })}
                      placeholder="Contoh: Dermaga 102 Tanjung Priok"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Catatan Teknis</label>
                    <textarea
                      rows={2}
                      value={vesselForm.notes}
                      onChange={(e) => setVesselForm({ ...vesselForm, notes: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* PORTS FORM */}
              {subTab === 'ports' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Kode Port (UN/LOCODE)</label>
                      <input
                        type="text"
                        required
                        value={portForm.code}
                        onChange={(e) => setPortForm({ ...portForm, code: e.target.value.toUpperCase() })}
                        placeholder="Contoh: IDTPP"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nama Pelabuhan</label>
                      <input
                        type="text"
                        required
                        value={portForm.name}
                        onChange={(e) => setPortForm({ ...portForm, name: e.target.value })}
                        placeholder="Pelabuhan Tanjung Priok"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Kota</label>
                      <input
                        type="text"
                        required
                        value={portForm.city}
                        onChange={(e) => setPortForm({ ...portForm, city: e.target.value })}
                        placeholder="Jakarta Utara"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Provinsi</label>
                      <input
                        type="text"
                        required
                        value={portForm.province}
                        onChange={(e) => setPortForm({ ...portForm, province: e.target.value })}
                        placeholder="DKI Jakarta"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Negara</label>
                      <input
                        type="text"
                        required
                        value={portForm.country}
                        onChange={(e) => setPortForm({ ...portForm, country: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ROUTES FORM */}
              {subTab === 'routes' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Pelabuhan Asal</label>
                      <select
                        required
                        value={routeForm.originPortId}
                        onChange={(e) => setRouteForm({ ...routeForm, originPortId: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {ports.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Pelabuhan Tujuan</label>
                      <select
                        required
                        value={routeForm.destinationPortId}
                        onChange={(e) => setRouteForm({ ...routeForm, destinationPortId: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {ports.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Jarak (Mil Laut/NM)</label>
                      <input
                        type="number"
                        required
                        value={routeForm.distanceNm}
                        onChange={(e) => setRouteForm({ ...routeForm, distanceNm: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Estimasi Waktu (Jam)</label>
                      <input
                        type="number"
                        required
                        value={routeForm.estDurationHours}
                        onChange={(e) => setRouteForm({ ...routeForm, estDurationHours: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tarif Dasar / TEU (IDR)</label>
                      <input
                        type="number"
                        required
                        step="100000"
                        value={routeForm.baseRatePerTeu}
                        onChange={(e) => setRouteForm({ ...routeForm, baseRatePerTeu: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* CARGO FORM */}
              {subTab === 'cargo' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Kode Kategori</label>
                      <input
                        type="text"
                        required
                        value={cargoForm.code}
                        onChange={(e) => setCargoForm({ ...cargoForm, code: e.target.value.toUpperCase() })}
                        placeholder="DRY-20"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nama Kategori Kargo</label>
                      <input
                        type="text"
                        required
                        value={cargoForm.name}
                        onChange={(e) => setCargoForm({ ...cargoForm, name: e.target.value })}
                        placeholder="Dry Container 20 Feet"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tipe Penanganan</label>
                      <select
                        value={cargoForm.categoryType}
                        onChange={(e) => setCargoForm({ ...cargoForm, categoryType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="General Cargo">General Cargo</option>
                        <option value="Reefer / Berpendingin">Reefer / Berpendingin</option>
                        <option value="Dangerous Goods">Dangerous Goods</option>
                        <option value="Liquid Bulk">Liquid Bulk</option>
                        <option value="Alat Berat / Curah">Alat Berat / Curah</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Biaya Bongkar Muat (THC)</label>
                      <input
                        type="number"
                        required
                        value={cargoForm.handlingFee}
                        onChange={(e) => setCargoForm({ ...cargoForm, handlingFee: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Deskripsi Penanganan</label>
                    <textarea
                      rows={2}
                      value={cargoForm.description}
                      onChange={(e) => setCargoForm({ ...cargoForm, description: e.target.value })}
                      placeholder="Protokol keselamatan, temperatur dingin, dsb."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* CUSTOMER FORM */}
              {subTab === 'customers' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nama Perusahaan Shipper</label>
                      <input
                        type="text"
                        required
                        value={customerForm.companyName}
                        onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                        placeholder="PT Samudra Sejahtera"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Kontak Person (PIC)</label>
                      <input
                        type="text"
                        required
                        value={customerForm.contactPerson}
                        onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                        placeholder="Bambang Wijaya"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nomor Telepon</label>
                      <input
                        type="text"
                        required
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        placeholder="+62 812..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        placeholder="logistik@perusahaan.com"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">NPWP</label>
                      <input
                        type="text"
                        value={customerForm.npwp}
                        onChange={(e) => setCustomerForm({ ...customerForm, npwp: e.target.value })}
                        placeholder="01.234.567.8-000.000"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Alamat Kantor / Gudang</label>
                    <textarea
                      rows={2}
                      required
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md transition-colors"
                >
                  Simpan ke Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
