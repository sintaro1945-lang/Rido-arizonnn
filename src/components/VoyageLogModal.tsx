import React, { useState, useEffect } from 'react';
import { X, Navigation, Compass, Wind, Clock, Plus, ShieldCheck, Check } from 'lucide-react';
import { Voyage, VoyageLog } from '../types';

interface VoyageLogModalProps {
  voyage: Voyage | null;
  onClose: () => void;
}

export const VoyageLogModal: React.FC<VoyageLogModalProps> = ({ voyage, onClose }) => {
  const [logs, setLogs] = useState<VoyageLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New log form state
  const [coordinates, setCoordinates] = useState('-6.0241, 107.5421');
  const [speedKnots, setSpeedKnots] = useState(15);
  const [weatherCondition, setWeatherCondition] = useState('Cerah, Angin 10-12 knot');
  const [heading, setHeading] = useState('095° E');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [loggedBy, setLoggedBy] = useState('Mualim I (Chief Officer)');

  const fetchLogs = async () => {
    if (!voyage) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/voyages/${voyage.id}/logs`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [voyage]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voyage || !statusUpdate.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/voyages/${voyage.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates,
          speedKnots: Number(speedKnots),
          weatherCondition,
          heading,
          statusUpdate,
          loggedBy,
        }),
      });

      if (!res.ok) throw new Error('Gagal menyimpan log pelayaran');

      setStatusUpdate('');
      setShowAddForm(false);
      fetchLogs();
    } catch (err) {
      alert('Gagal menambahkan log tracking pelayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!voyage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-xl max-w-2xl w-full p-6 shadow-2xl relative my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Logbook & Tracking Pelayaran</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {voyage.voyageNumber} • Kapal {voyage.vessel?.name} ({voyage.route?.originPort?.name} ➔{' '}
              {voyage.route?.destinationPort?.name})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Riwayat Posisi & Status Navigasi ({logs.length} Entri)
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Tutup Form' : 'Update Posisi Terkini'}</span>
          </button>
        </div>

        {/* Add Log Form */}
        {showAddForm && (
          <form onSubmit={handleAddLog} className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-5 space-y-3">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Input Logbook Navigasi Baru
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Koordinat GPS (Lat, Long)</label>
                <input
                  type="text"
                  required
                  value={coordinates}
                  onChange={(e) => setCoordinates(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Kecepatan (Knot)</label>
                <input
                  type="number"
                  required
                  value={speedKnots}
                  onChange={(e) => setSpeedKnots(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Haluan (Heading)</label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="090° E"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Kondisi Cuaca & Gelombang</label>
                <input
                  type="text"
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  placeholder="Cerah, ombak 1 meter"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Petugas Pencatat</label>
                <input
                  type="text"
                  value={loggedBy}
                  onChange={(e) => setLoggedBy(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Laporan Aktivitas & Posisi Terkini</label>
              <textarea
                rows={2}
                required
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                placeholder="Deskripsi posisi kapal, checkpoint TSS, pergantian jaga navigasi..."
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Log Posisi</span>
              </button>
            </div>
          </form>
        )}

        {/* Timeline List */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Memuat log tracking...</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Belum ada catatan logbook posisi untuk jadwal pelayaran ini.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={log.id || idx} className="relative pl-6 pb-2 border-l-2 border-slate-700 last:border-l-0">
                {/* Node icon */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-400">{log.coordinates}</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {log.speedKnots} Knot
                      </span>
                      {log.heading && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium flex items-center space-x-1">
                          <Compass className="w-3 h-3 text-slate-400" />
                          <span>{log.heading}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{log.logTime ? new Date(log.logTime).toLocaleString('id-ID') : '-'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed mb-2">{log.statusUpdate}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                    <div className="flex items-center space-x-1">
                      <Wind className="w-3 h-3 text-cyan-400" />
                      <span>{log.weatherCondition}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Dicatat oleh: {log.loggedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
