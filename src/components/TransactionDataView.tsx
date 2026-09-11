import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
  Navigation,
  DollarSign,
  Ship,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Voyage, CargoBooking, Vessel, SeaRoute, Customer, CargoCategory } from '../types';
import { BillOfLadingModal } from './BillOfLadingModal';
import { VoyageLogModal } from './VoyageLogModal';

export const TransactionDataView: React.FC = () => {
  const [subTab, setSubTab] = useState<'voyages' | 'bookings'>('voyages');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data lists
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [bookings, setBookings] = useState<CargoBooking[]>([]);

  // Master references for selection
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [routes, setRoutes] = useState<SeaRoute[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cargoCategories, setCargoCategories] = useState<CargoCategory[]>([]);

  // Modals state
  const [isVoyageModalOpen, setIsVoyageModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingVoyage, setEditingVoyage] = useState<Voyage | null>(null);
  const [editingBooking, setEditingBooking] = useState<CargoBooking | null>(null);

  // Sub-modal viewers
  const [selectedBookingForBL, setSelectedBookingForBL] = useState<CargoBooking | null>(null);
  const [selectedVoyageForTracking, setSelectedVoyageForTracking] = useState<Voyage | null>(null);

  // Voyage form state
  const [voyageForm, setVoyageForm] = useState({
    voyageNumber: '',
    vesselId: 0,
    routeId: 0,
    departureDate: '',
    arrivalDate: '',
    status: 'Terjadwal',
    currentNotes: '',
  });

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    bookingNumber: '',
    blNumber: '',
    voyageId: 0,
    customerId: 0,
    cargoCategoryId: 0,
    containerNumber: '',
    sealNumber: '',
    quantityTeu: 1,
    weightTons: 15,
    totalPrice: 6500000,
    paymentStatus: 'Pending',
    shippingStatus: 'Pemesanan Diterima',
    consigneeName: '',
    consigneeContact: '+62 ',
    consigneeAddress: '',
    notes: '',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const safeFetch = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    } catch {
      return null;
    }
  };

  const fetchAll = async (retryCount = 0) => {
    setLoading(true);
    try {
      const [resVoy, resBook, resVes, resRou, resCust, resCat] = await Promise.all([
        safeFetch('/api/voyages'),
        safeFetch('/api/bookings'),
        safeFetch('/api/vessels'),
        safeFetch('/api/routes'),
        safeFetch('/api/customers'),
        safeFetch('/api/cargo-categories'),
      ]);

      if (resVoy) setVoyages(resVoy);
      if (resBook) setBookings(resBook);
      if (resVes) setVessels(resVes);
      if (resRou) setRoutes(resRou);
      if (resCust) setCustomers(resCust);
      if (resCat) setCargoCategories(resCat);

      // Auto-retry once if initial cold-start returned empty
      if ((!resVoy || resVoy.length === 0) && retryCount < 2) {
        setTimeout(() => fetchAll(retryCount + 1), 1000);
      }
    } catch (err) {
      console.warn('Silent transaction data fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Open Voyage modal
  const handleOpenVoyageAdd = () => {
    setEditingVoyage(null);
    const now = new Date();
    const depStr = new Date(now.getTime() + 24 * 3600 * 1000).toISOString().slice(0, 16);
    const arrStr = new Date(now.getTime() + 72 * 3600 * 1000).toISOString().slice(0, 16);

    setVoyageForm({
      voyageNumber: `VOY/${new Date().getFullYear()}/EXP/${Math.floor(100 + Math.random() * 900)}`,
      vesselId: vessels[0]?.id || 0,
      routeId: routes[0]?.id || 0,
      departureDate: depStr,
      arrivalDate: arrStr,
      status: 'Terjadwal',
      currentNotes: 'Rencana keberangkatan terjadwal tepat waktu',
    });
    setIsVoyageModalOpen(true);
  };

  const handleOpenVoyageEdit = (v: Voyage) => {
    setEditingVoyage(v);
    setVoyageForm({
      voyageNumber: v.voyageNumber,
      vesselId: v.vesselId,
      routeId: v.routeId,
      departureDate: v.departureDate ? new Date(v.departureDate).toISOString().slice(0, 16) : '',
      arrivalDate: v.arrivalDate ? new Date(v.arrivalDate).toISOString().slice(0, 16) : '',
      status: v.status,
      currentNotes: v.currentNotes || '',
    });
    setIsVoyageModalOpen(true);
  };

  const handleSaveVoyage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingVoyage ? `/api/voyages/${editingVoyage.id}` : '/api/voyages';
      const method = editingVoyage ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voyageForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan jadwal pelayaran');

      showToast(
        editingVoyage ? 'Jadwal pelayaran berhasil diperbarui!' : 'Jadwal pelayaran baru berhasil dibuat!'
      );
      setIsVoyageModalOpen(false);
      fetchAll();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan jadwal pelayaran', 'error');
    }
  };

  const handleDeleteVoyage = async (id: number, voyNum: string) => {
    if (!window.confirm(`Konfirmasi hapus jadwal pelayaran "${voyNum}"?`)) return;
    try {
      const res = await fetch(`/api/voyages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus jadwal pelayaran');

      showToast('Jadwal pelayaran berhasil dihapus.');
      fetchAll();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Open Booking modal
  const handleOpenBookingAdd = () => {
    setEditingBooking(null);
    const randomCont = `TGHU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`;
    const randomSeal = `SL-${Math.floor(1000 + Math.random() * 9000)}`;

    const selectedVoyage = voyages[0];
    const routeRate = selectedVoyage?.route?.baseRatePerTeu || 5000000;
    const catHandling = cargoCategories[0]?.handlingFee || 500000;

    setBookingForm({
      bookingNumber: `BKG-${Date.now().toString().slice(-6)}`,
      blNumber: `BL-SMD-${Math.floor(1000000 + Math.random() * 9000000)}`,
      voyageId: selectedVoyage?.id || 0,
      customerId: customers[0]?.id || 0,
      cargoCategoryId: cargoCategories[0]?.id || 0,
      containerNumber: randomCont,
      sealNumber: randomSeal,
      quantityTeu: 1,
      weightTons: 18,
      totalPrice: routeRate + catHandling,
      paymentStatus: 'Pending',
      shippingStatus: 'Pemesanan Diterima',
      consigneeName: 'PT Penerima Logistik Sejahtera',
      consigneeContact: '+62 821-9988-1122',
      consigneeAddress: 'Kawasan Pergudangan Pelabuhan Blok D-5',
      notes: 'Penanganan kargo standar',
    });
    setIsBookingModalOpen(true);
  };

  const handleOpenBookingEdit = (b: CargoBooking) => {
    setEditingBooking(b);
    setBookingForm({
      bookingNumber: b.bookingNumber,
      blNumber: b.blNumber,
      voyageId: b.voyageId,
      customerId: b.customerId,
      cargoCategoryId: b.cargoCategoryId,
      containerNumber: b.containerNumber,
      sealNumber: b.sealNumber,
      quantityTeu: b.quantityTeu,
      weightTons: b.weightTons,
      totalPrice: b.totalPrice,
      paymentStatus: b.paymentStatus,
      shippingStatus: b.shippingStatus,
      consigneeName: b.consigneeName,
      consigneeContact: b.consigneeContact,
      consigneeAddress: b.consigneeAddress || '',
      notes: b.notes || '',
    });
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingBooking ? `/api/bookings/${editingBooking.id}` : '/api/bookings';
      const method = editingBooking ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pemesanan kargo');

      showToast(
        editingBooking
          ? 'Data pemesanan kargo / Bill of Lading berhasil diperbarui!'
          : 'Pemesanan kargo baru berhasil didaftarkan!'
      );
      setIsBookingModalOpen(false);
      fetchAll();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan booking', 'error');
    }
  };

  const handleDeleteBooking = async (id: number, blNum: string) => {
    if (!window.confirm(`Konfirmasi hapus manifest Bill of Lading "${blNum}"?`)) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus pemesanan');

      showToast('Pemesanan kargo berhasil dihapus.');
      fetchAll();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Recalculate estimated price based on voyage route & category
  const handleRecalculatePrice = (voyageId: number, catId: number, qty: number) => {
    const voy = voyages.find((v) => v.id === voyageId);
    const cat = cargoCategories.find((c) => c.id === catId);
    const base = voy?.route?.baseRatePerTeu || 5000000;
    const handling = cat?.handlingFee || 500000;
    return (base + handling) * qty;
  };

  // Filtered queries
  const filteredVoyages = voyages.filter(
    (v) =>
      v.voyageNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vessel?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.route?.originPort?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.route?.destinationPort?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(
    (b) =>
      b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.blNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.containerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer?.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.consigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shippingStatus.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Transaksi Data Operasional Pelayaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Penjadwalan pelayaran armada, pemesanan kargo kontainer (B/L), dan logbook tracking posisi kapal
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {subTab === 'voyages' ? (
            <button
              id="add-voyage-btn"
              onClick={handleOpenVoyageAdd}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center space-x-1.5 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Jadwal Pelayaran</span>
            </button>
          ) : (
            <button
              id="add-booking-btn"
              onClick={handleOpenBookingAdd}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center space-x-1.5 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Input Pemesanan (B/L)</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub tabs pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setSubTab('voyages');
            setSearchQuery('');
          }}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 border transition-colors ${
            subTab === 'voyages'
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Pelayaran ({voyages.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab('bookings');
            setSearchQuery('');
          }}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 border transition-colors ${
            subTab === 'bookings'
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Pemesanan Kargo & B/L ({bookings.length})</span>
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
            subTab === 'voyages' ? 'nomor pelayaran, kapal, status, pelabuhan...' : 'no BKG, BL, kontainer, shipper...'
          }`}
          className="bg-transparent border-none text-white focus:outline-none w-full text-xs sm:text-sm placeholder-slate-500"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* TABLE 1: VOYAGES */}
      {subTab === 'voyages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">No. Voyage</th>
                  <th className="px-4 py-3">Armada Kapal</th>
                  <th className="px-4 py-3">Rute Pelabuhan</th>
                  <th className="px-4 py-3">Jadwal Berangkat & Tiba</th>
                  <th className="px-4 py-3">Muatan (TEU / Ton)</th>
                  <th className="px-4 py-3">Status Pelayaran</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredVoyages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Belum ada jadwal pelayaran yang tercatat.
                    </td>
                  </tr>
                ) : (
                  filteredVoyages.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-blue-300 whitespace-nowrap">
                        {v.voyageNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        <div className="flex items-center space-x-1.5">
                          <Ship className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span>{v.vessel?.name || 'Kapal'}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {v.vessel?.code} ({v.vessel?.type})
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1 text-slate-200">
                          <span className="font-medium">{v.route?.originPort?.city || 'Asal'}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="font-medium">{v.route?.destinationPort?.city || 'Tujuan'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {v.route?.distanceNm} NM (~{v.route?.estDurationHours} Jam)
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-slate-200">
                          <span className="text-slate-400">ETD:</span>{' '}
                          {v.departureDate ? new Date(v.departureDate).toLocaleDateString('id-ID') : '-'}
                        </div>
                        <div className="text-slate-200">
                          <span className="text-slate-400">ETA:</span>{' '}
                          {v.arrivalDate ? new Date(v.arrivalDate).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-semibold text-emerald-400">
                          {v.stats?.bookedTeu || 0} TEU / {v.stats?.bookedWeight || 0} Ton
                        </div>
                        <div className="text-slate-400">
                          {v.stats?.totalBookings || 0} Kontainer terdaftar
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            v.status === 'Berlayar'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : v.status === 'Proses Muat'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : v.status === 'Selesai'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {v.status}
                        </span>
                        {v.currentNotes && (
                          <div className="text-[11px] text-slate-400 mt-0.5 max-w-[160px] truncate">
                            {v.currentNotes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedVoyageForTracking(v)}
                          title="Lihat Logbook Tracking"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenVoyageEdit(v)}
                          title="Edit Jadwal"
                          className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVoyage(v.id, v.voyageNumber)}
                          title="Hapus Jadwal"
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
        </div>
      )}

      {/* TABLE 2: CARGO BOOKINGS / BILL OF LADING */}
      {subTab === 'bookings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">No. B/L & Booking</th>
                  <th className="px-4 py-3">Shipper (Pengirim)</th>
                  <th className="px-4 py-3">Kontainer & Kargo</th>
                  <th className="px-4 py-3">Voyage Pelayaran</th>
                  <th className="px-4 py-3">Tarif & Pembayaran</th>
                  <th className="px-4 py-3">Status Pengiriman</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Belum ada pesanan kargo terdaftar.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-xs text-blue-300">{b.blNumber}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{b.bookingNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{b.customer?.companyName || 'Shipper'}</div>
                        <div className="text-[11px] text-slate-400">
                          Penerima: {b.consigneeName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono font-semibold text-slate-200 flex items-center space-x-1">
                          <Package className="w-3.5 h-3.5 text-blue-400" />
                          <span>{b.containerNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.cargoCategory?.name} • {b.quantityTeu} TEU ({b.weightTons} Ton)
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-medium text-slate-200">{b.voyage?.voyageNumber}</div>
                        <div className="text-slate-400">
                          {b.voyage?.vessel?.name} ({b.voyage?.route?.originPort?.city} ➔{' '}
                          {b.voyage?.route?.destinationPort?.city})
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">
                          Rp {b.totalPrice.toLocaleString('id-ID')}
                        </div>
                        <span
                          className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            b.paymentStatus === 'Lunas'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : b.paymentStatus === 'DP 50%'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700">
                          {b.shippingStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBookingForBL(b)}
                          title="Cetak Bill of Lading"
                          className="p-1.5 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenBookingEdit(b)}
                          title="Edit Booking"
                          className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(b.id, b.blNumber)}
                          title="Hapus Booking"
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
        </div>
      )}

      {/* VOYAGE MODAL */}
      {isVoyageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingVoyage ? 'Edit Jadwal Pelayaran' : 'Buat Jadwal Pelayaran Baru'}
              </h2>
              <button
                onClick={() => setIsVoyageModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoyage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Nomor Pelayaran (Voyage Number)
                </label>
                <input
                  type="text"
                  required
                  value={voyageForm.voyageNumber}
                  onChange={(e) => setVoyageForm({ ...voyageForm, voyageNumber: e.target.value })}
                  placeholder="VOY/2025/JKT-SBY/01"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Armada Kapal
                  </label>
                  <select
                    required
                    value={voyageForm.vesselId}
                    onChange={(e) => setVoyageForm({ ...voyageForm, vesselId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.capacity} {v.capacityUnit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Rute Pelayaran
                  </label>
                  <select
                    required
                    value={voyageForm.routeId}
                    onChange={(e) => setVoyageForm({ ...voyageForm, routeId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.originPort?.name} ➔ {r.destinationPort?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Tanggal & Waktu Keberangkatan (ETD)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={voyageForm.departureDate}
                    onChange={(e) => setVoyageForm({ ...voyageForm, departureDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Estimasi Waktu Tiba (ETA)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={voyageForm.arrivalDate}
                    onChange={(e) => setVoyageForm({ ...voyageForm, arrivalDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Status Pelayaran
                </label>
                <select
                  value={voyageForm.status}
                  onChange={(e) => setVoyageForm({ ...voyageForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Terjadwal">Terjadwal</option>
                  <option value="Proses Muat">Proses Muat</option>
                  <option value="Berlayar">Berlayar</option>
                  <option value="Sandar">Sandar</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Catatan Operasional Pelayaran
                </label>
                <textarea
                  rows={2}
                  value={voyageForm.currentNotes}
                  onChange={(e) => setVoyageForm({ ...voyageForm, currentNotes: e.target.value })}
                  placeholder="Informasi dermaga, alur pelayaran, instruksi bongkar muat..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVoyageModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingBooking ? 'Edit Pemesanan Kargo (B/L)' : 'Pemesanan Kargo & Bill of Lading Baru'}
              </h2>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Nomor Booking
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.bookingNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, bookingNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Nomor Bill of Lading (B/L)
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.blNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, blNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Pilih Jadwal Pelayaran
                  </label>
                  <select
                    required
                    value={bookingForm.voyageId}
                    onChange={(e) => {
                      const vId = Number(e.target.value);
                      const newPrice = handleRecalculatePrice(vId, bookingForm.cargoCategoryId, bookingForm.quantityTeu);
                      setBookingForm({ ...bookingForm, voyageId: vId, totalPrice: newPrice });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                  >
                    {voyages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.voyageNumber} ({v.vessel?.name} • {v.route?.originPort?.city} ➔ {v.route?.destinationPort?.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Shipper (Perusahaan Pengirim)
                  </label>
                  <select
                    required
                    value={bookingForm.customerId}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.contactPerson})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Kategori & Tipe Kargo
                  </label>
                  <select
                    required
                    value={bookingForm.cargoCategoryId}
                    onChange={(e) => {
                      const catId = Number(e.target.value);
                      const newPrice = handleRecalculatePrice(bookingForm.voyageId, catId, bookingForm.quantityTeu);
                      setBookingForm({ ...bookingForm, cargoCategoryId: catId, totalPrice: newPrice });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                  >
                    {cargoCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Nomor Kontainer
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.containerNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, containerNumber: e.target.value })}
                    placeholder="TGHU-123456-7"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Nomor Segel (Seal No)
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.sealNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, sealNumber: e.target.value })}
                    placeholder="SL-9988"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Jumlah (TEU)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookingForm.quantityTeu}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      const newPrice = handleRecalculatePrice(bookingForm.voyageId, bookingForm.cargoCategoryId, qty);
                      setBookingForm({ ...bookingForm, quantityTeu: qty, totalPrice: newPrice });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Berat Total (Ton)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookingForm.weightTons}
                    onChange={(e) => setBookingForm({ ...bookingForm, weightTons: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Total Biaya Pengiriman (IDR)
                  </label>
                  <input
                    type="number"
                    required
                    value={bookingForm.totalPrice}
                    onChange={(e) => setBookingForm({ ...bookingForm, totalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Status Pembayaran
                  </label>
                  <select
                    value={bookingForm.paymentStatus}
                    onChange={(e) => setBookingForm({ ...bookingForm, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                  >
                    <option value="Pending">Pending (Belum Dibayar)</option>
                    <option value="DP 50%">DP 50% Diterima</option>
                    <option value="Lunas">Lunas (100% Paid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Status Pengiriman / Kargo
                  </label>
                  <select
                    value={bookingForm.shippingStatus}
                    onChange={(e) => setBookingForm({ ...bookingForm, shippingStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                  >
                    <option value="Pemesanan Diterima">Pemesanan Diterima</option>
                    <option value="Di Pelabuhan Asal">Di Pelabuhan Asal</option>
                    <option value="Di Atas Kapal">Di Atas Kapal</option>
                    <option value="Sandar di Tujuan">Sandar di Tujuan</option>
                    <option value="Selesai Terkirim">Selesai Terkirim</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Nama Penerima (Consignee)
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.consigneeName}
                    onChange={(e) => setBookingForm({ ...bookingForm, consigneeName: e.target.value })}
                    placeholder="PT Sumber Rejeki Abadi"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Kontak Penerima
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.consigneeContact}
                    onChange={(e) => setBookingForm({ ...bookingForm, consigneeContact: e.target.value })}
                    placeholder="+62 811..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Alamat Pengiriman Tujuan
                </label>
                <textarea
                  rows={2}
                  value={bookingForm.consigneeAddress}
                  onChange={(e) => setBookingForm({ ...bookingForm, consigneeAddress: e.target.value })}
                  placeholder="Alamat gudang / depot penerima di kota tujuan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md"
                >
                  Simpan Booking (B/L)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRINT BILL OF LADING */}
      {selectedBookingForBL && (
        <BillOfLadingModal
          booking={selectedBookingForBL}
          onClose={() => setSelectedBookingForBL(null)}
        />
      )}

      {/* MODAL TRACKING LOGBOOK */}
      {selectedVoyageForTracking && (
        <VoyageLogModal
          voyage={selectedVoyageForTracking}
          onClose={() => setSelectedVoyageForTracking(null)}
        />
      )}
    </div>
  );
};
