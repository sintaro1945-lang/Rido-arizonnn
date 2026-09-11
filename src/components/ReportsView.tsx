import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Ship,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle2,
  Clock,
  Download,
  Building2,
} from 'lucide-react';
import { SummaryReport, Voyage } from '../types';

export const ReportsView: React.FC = () => {
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [selectedVoyageId, setSelectedVoyageId] = useState<number | null>(null);
  const [manifestData, setManifestData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manifestLoading, setManifestLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const [sumRes, voyRes] = await Promise.all([
        fetch('/api/reports/summary').then((r) => r.json()),
        fetch('/api/voyages').then((r) => r.json()),
      ]);

      setSummary(sumRes);
      if (Array.isArray(voyRes) && voyRes.length > 0) {
        setVoyages(voyRes);
        setSelectedVoyageId(voyRes[0].id);
        fetchManifest(voyRes[0].id);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManifest = async (voyageId: number) => {
    setManifestLoading(true);
    try {
      const res = await fetch(`/api/reports/manifest/${voyageId}`);
      const data = await res.json();
      setManifestData(data);
    } catch (err) {
      console.error('Error fetching manifest:', err);
    } finally {
      setManifestLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleSelectVoyage = (vId: number) => {
    setSelectedVoyageId(vId);
    fetchManifest(vId);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!manifestData || !manifestData.bookings) return;
    const headers = ['No. B/L', 'Shipper', 'Consignee', 'No. Kontainer', 'No. Segel', 'Kategori', 'TEU', 'Ton', 'Tarif IDR', 'Status Bayar'];
    const rows = manifestData.bookings.map((b: any) => [
      b.blNumber,
      `"${b.customer?.companyName || ''}"`,
      `"${b.consigneeName || ''}"`,
      b.containerNumber,
      b.sealNumber,
      `"${b.cargoCategory?.name || ''}"`,
      b.quantityTeu,
      b.weightTons,
      b.totalPrice,
      b.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Manifest_${manifestData.voyage?.voyageNumber || 'voyage'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Laporan & Manifest Pelayaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Rekapitulasi keuangan freight kargo, utilisasi armada, dan generator dokumen manifest resmi kapal
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            disabled={!manifestData}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Pendapatan */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Nilai Muatan</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              Rp {(summary.totalRevenue || 0).toLocaleString('id-ID')}
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
              <span className="text-emerald-400">
                Lunas: Rp {(summary.paidRevenue || 0).toLocaleString('id-ID')}
              </span>
              <span className="text-amber-400">
                Piutang: Rp {(summary.pendingRevenue || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Card 2: Muatan TEU & Tonase */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Volume Kargo</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {summary.totalTeu} <span className="text-sm font-normal text-slate-400">TEU</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
              <span>Gross Weight:</span>
              <span className="font-semibold text-slate-200">{summary.totalTons} Metrik Ton</span>
            </div>
          </div>

          {/* Card 3: Armada Kapal */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Kesiapan Armada</span>
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Ship className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {summary.activeVessels} / {summary.totalVessels}{' '}
              <span className="text-sm font-normal text-slate-400">Kapal Siap</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
              <span>Status Berlayar:</span>
              <span className="font-semibold text-blue-400">{summary.ongoingVoyages} Pelayaran Aktif</span>
            </div>
          </div>

          {/* Card 4: Shipper & Bookings */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Mitra & Booking</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {summary.totalBookings}{' '}
              <span className="text-sm font-normal text-slate-400">B/L Manifest</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
              <span>Shipper Terdaftar:</span>
              <span className="font-semibold text-slate-200">{summary.totalCustomers} Perusahaan</span>
            </div>
          </div>
        </div>
      )}

      {/* MANIFEST CARGO SELECTOR & PREVIEW */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Manifest Muatan Kapal (Cargo Cargo Manifest)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih jadwal pelayaran untuk melihat dokumen manifest resmi muatan kapal
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Pilih Voyage:</span>
            <select
              value={selectedVoyageId || ''}
              onChange={(e) => handleSelectVoyage(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-blue-500"
            >
              {voyages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.voyageNumber} ({v.vessel?.name} • {v.route?.originPort?.city} ➔ {v.route?.destinationPort?.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL MANIFEST SHEET */}
        {manifestLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Memuat dokumen manifest muatan...</div>
        ) : !manifestData || !manifestData.voyage ? (
          <div className="py-12 text-center text-slate-500 text-sm">Pilih voyage untuk menampilkan manifest.</div>
        ) : (
          <div className="bg-white text-slate-900 p-6 rounded-lg border border-slate-300 font-sans text-xs">
            {/* Manifest Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
              <div className="font-black text-base uppercase tracking-wider">
                CARGO MANIFEST / MANIFEST MUATAN KAPAL
              </div>
              <div className="font-semibold text-xs text-slate-700">PT MARITIMA SAMUDERA LINES</div>
              <div className="text-[10px] text-slate-500">
                Dokumen Resmi Pemuatan Barang Antar Pulau Republik Indonesia
              </div>
            </div>

            {/* Voyage Details Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-3 rounded mb-4 border border-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Nama Kapal:</span>
                <span className="font-bold text-slate-900">{manifestData.voyage.vessel?.name}</span>
                <span className="block text-[10px] font-mono text-slate-600">
                  {manifestData.voyage.vessel?.code}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Nomor Pelayaran:</span>
                <span className="font-bold font-mono text-slate-900">{manifestData.voyage.voyageNumber}</span>
                <span className="block text-[10px] text-slate-600">Status: {manifestData.voyage.status}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Pelabuhan Muat:</span>
                <span className="font-bold text-slate-900">
                  {manifestData.voyage.route?.originPort?.name} ({manifestData.voyage.route?.originPort?.code})
                </span>
                <span className="block text-[10px] text-slate-600">
                  ETD: {new Date(manifestData.voyage.departureDate).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Pelabuhan Bongkar:</span>
                <span className="font-bold text-slate-900">
                  {manifestData.voyage.route?.destinationPort?.name} ({manifestData.voyage.route?.destinationPort?.code})
                </span>
                <span className="block text-[10px] text-slate-600">
                  ETA: {new Date(manifestData.voyage.arrivalDate).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>

            {/* Manifest Cargo Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-400 mb-4">
                <thead className="bg-slate-900 text-white text-[10px] uppercase">
                  <tr>
                    <th className="p-2 border-r border-slate-700">No. B/L</th>
                    <th className="p-2 border-r border-slate-700">Shipper / Pengirim</th>
                    <th className="p-2 border-r border-slate-700">Consignee / Penerima</th>
                    <th className="p-2 border-r border-slate-700">No. Kontainer & Seal</th>
                    <th className="p-2 border-r border-slate-700">Kategori Muatan</th>
                    <th className="p-2 border-r border-slate-700">TEU</th>
                    <th className="p-2 border-r border-slate-700">Berat (Ton)</th>
                    <th className="p-2 text-right">Tarif (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {manifestData.bookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-500">
                        Tidak ada muatan kargo pada voyage ini.
                      </td>
                    </tr>
                  ) : (
                    manifestData.bookings.map((b: any, index: number) => (
                      <tr key={b.id || index} className={index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-300">
                          {b.blNumber}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-medium">
                          {b.customer?.companyName}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-medium">
                          {b.consigneeName}
                        </td>
                        <td className="p-2 font-mono border-r border-slate-300">
                          <div className="font-semibold text-slate-900">{b.containerNumber}</div>
                          <div className="text-[10px] text-slate-500">Seal: {b.sealNumber}</div>
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          {b.cargoCategory?.name}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold">
                          {b.quantityTeu}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold">
                          {b.weightTons}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          Rp {b.totalPrice.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-200 font-bold border-t-2 border-slate-900">
                  <tr>
                    <td colSpan={5} className="p-2 text-right border-r border-slate-300">
                      TOTAL REKAPITULASI MUATAN:
                    </td>
                    <td className="p-2 text-center border-r border-slate-300 text-sm">
                      {manifestData.manifestSummary?.totalTeu || 0} TEU
                    </td>
                    <td className="p-2 text-center border-r border-slate-300 text-sm">
                      {manifestData.manifestSummary?.totalWeight || 0} Ton
                    </td>
                    <td className="p-2 text-right text-sm text-blue-900">
                      Rp {(manifestData.manifestSummary?.totalFreightValue || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-12 pt-6 text-center">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold mb-12">
                  Petugas Administrasi Kargo Pelabuhan
                </div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                  Superintendent of Cargo
                </div>
                <div className="text-[9px] text-slate-500">Divisi Operasional & Terminal</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold mb-12">
                  Nakhoda Kapal (Master of Vessel)
                </div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                  Capt. {manifestData.voyage.vessel?.name}
                </div>
                <div className="text-[9px] text-slate-500">Tanda Tangan & Cap Nakhoda</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
