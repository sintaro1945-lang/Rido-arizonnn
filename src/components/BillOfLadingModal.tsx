import React from 'react';
import { X, Printer, Ship, FileText, CheckCircle2 } from 'lucide-react';
import { CargoBooking } from '../types';

interface BillOfLadingModalProps {
  booking: CargoBooking | null;
  onClose: () => void;
}

export const BillOfLadingModal: React.FC<BillOfLadingModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-xl max-w-3xl w-full p-8 shadow-2xl relative my-8 print:p-0 print:m-0 print:shadow-none">
        {/* Header action bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
          <div className="flex items-center space-x-2 text-slate-700">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-base">Dokumen Resmi Bill of Lading (B/L)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak Dokumen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE BILL OF LADING SHEET */}
        <div className="border-2 border-slate-900 p-6 rounded font-sans text-xs">
          {/* Top header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-slate-900 text-white rounded flex items-center justify-center">
                <Ship className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">MARITIMA SAMUDERA LINES</h1>
                <p className="text-[11px] text-slate-600 font-medium">
                  PT Maritima Nusantara Shipping & Logistics Tbk.
                </p>
                <p className="text-[10px] text-slate-500">
                  Head Office: Tanjung Priok Port Area Sector 4, Jakarta • NPWP: 01.992.812.3-042.000
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-wider rounded">
                BILL OF LADING
              </span>
              <div className="mt-1 font-mono font-bold text-slate-900 text-sm">{booking.blNumber}</div>
              <div className="text-[10px] text-slate-500">Booking No: {booking.bookingNumber}</div>
            </div>
          </div>

          {/* Shipper & Consignee Grid */}
          <div className="grid grid-cols-2 gap-4 border-b-2 border-slate-900 pb-4 mb-4">
            <div className="border border-slate-300 p-3 rounded">
              <div className="font-bold text-slate-500 text-[10px] uppercase mb-1">1. SHIPPER / PENGIRIM:</div>
              <div className="font-bold text-slate-900 text-sm">{booking.customer?.companyName}</div>
              <div className="text-slate-700 mt-0.5">{booking.customer?.address}</div>
              <div className="text-slate-600 mt-1">
                PIC: {booking.customer?.contactPerson} • {booking.customer?.phone}
              </div>
              <div className="text-slate-500 text-[10px]">NPWP: {booking.customer?.npwp || '-'}</div>
            </div>

            <div className="border border-slate-300 p-3 rounded">
              <div className="font-bold text-slate-500 text-[10px] uppercase mb-1">2. CONSIGNEE / PENERIMA:</div>
              <div className="font-bold text-slate-900 text-sm">{booking.consigneeName}</div>
              <div className="text-slate-700 mt-0.5">{booking.consigneeAddress || 'Sesuai pesanan Bill of Lading'}</div>
              <div className="text-slate-600 mt-1">Kontak: {booking.consigneeContact}</div>
              <div className="text-emerald-700 font-semibold text-[10px] flex items-center space-x-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Carrier Manifest</span>
              </div>
            </div>
          </div>

          {/* Vessel & Voyage details */}
          <div className="grid grid-cols-4 gap-2 border-b-2 border-slate-900 pb-4 mb-4 bg-slate-50 p-2.5 rounded">
            <div>
              <div className="text-slate-500 font-bold text-[9px] uppercase">Armada Kapal (Vessel)</div>
              <div className="font-bold text-slate-900">{booking.voyage?.vessel?.name || 'KM Samudera'}</div>
              <div className="text-[10px] font-mono text-slate-600">{booking.voyage?.vessel?.code}</div>
            </div>
            <div>
              <div className="text-slate-500 font-bold text-[9px] uppercase">Nomor Pelayaran (Voyage)</div>
              <div className="font-bold font-mono text-slate-900">{booking.voyage?.voyageNumber || '-'}</div>
              <div className="text-[10px] text-slate-600">Status: {booking.shippingStatus}</div>
            </div>
            <div>
              <div className="text-slate-500 font-bold text-[9px] uppercase">Pelabuhan Muat (Origin)</div>
              <div className="font-bold text-slate-900">
                {booking.voyage?.route?.originPort?.name || 'Tanjung Priok'}
              </div>
              <div className="text-[10px] text-slate-600">{booking.voyage?.route?.originPort?.city}</div>
            </div>
            <div>
              <div className="text-slate-500 font-bold text-[9px] uppercase">Pelabuhan Bongkar (Dest)</div>
              <div className="font-bold text-slate-900">
                {booking.voyage?.route?.destinationPort?.name || 'Tanjung Perak'}
              </div>
              <div className="text-[10px] text-slate-600">{booking.voyage?.route?.destinationPort?.city}</div>
            </div>
          </div>

          {/* Cargo specification table */}
          <table className="w-full text-left border border-slate-900 mb-4">
            <thead className="bg-slate-900 text-white text-[10px] uppercase">
              <tr>
                <th className="p-2 border-r border-slate-800">Nomor Kontainer & Seal</th>
                <th className="p-2 border-r border-slate-800">Jenis & Kategori Kargo</th>
                <th className="p-2 border-r border-slate-800">Volume</th>
                <th className="p-2 border-r border-slate-800">Gross Weight</th>
                <th className="p-2 text-right">Biaya Ekspedisi (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              <tr>
                <td className="p-2.5 font-mono border-r border-slate-300">
                  <div className="font-bold text-slate-900">{booking.containerNumber}</div>
                  <div className="text-slate-500 text-[10px]">Segel: {booking.sealNumber}</div>
                </td>
                <td className="p-2.5 border-r border-slate-300">
                  <div className="font-bold text-slate-900">{booking.cargoCategory?.name}</div>
                  <div className="text-slate-500 text-[10px]">{booking.notes || 'Kemasan standar maritime packaging'}</div>
                </td>
                <td className="p-2.5 border-r border-slate-300 font-medium text-slate-800">
                  {booking.quantityTeu} TEU (FCL)
                </td>
                <td className="p-2.5 border-r border-slate-300 font-medium text-slate-800">
                  {booking.weightTons} Metrik Ton
                </td>
                <td className="p-2.5 text-right font-bold text-slate-900">
                  Rp {booking.totalPrice.toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t border-slate-900">
              <tr>
                <td colSpan={4} className="p-2 text-right border-r border-slate-300">
                  Total Biaya Pengiriman (Status: {booking.paymentStatus})
                </td>
                <td className="p-2 text-right text-blue-700 text-sm">
                  Rp {booking.totalPrice.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Legal statement & signatures */}
          <div className="text-[9px] text-slate-500 leading-relaxed border-t border-slate-300 pt-2 mb-6">
            SHIPPED on board the vessel indicated in apparent good order and condition, unless otherwise stated
            herein, for carriage from the port of loading to the port of discharge according to the provisions of the
            Merchant Shipping Act & International Maritime Conventions.
          </div>

          <div className="grid grid-cols-3 gap-8 text-center pt-4 border-t border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold mb-12">Pihak Pengirim (Shipper)</div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">{booking.customer?.contactPerson}</div>
              <div className="text-[9px] text-slate-500">Tanda Tangan & Cap</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold mb-12">Otoritas Pelabuhan / Terminal</div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">Terminal Gate Officer</div>
              <div className="text-[9px] text-slate-500">Tercatat di Sistem Pelabuhan</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold mb-12">Nakhoda / Agen Pengangkut</div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">Capt. Master of Vessel</div>
              <div className="text-[9px] text-slate-500">PT Maritima Samudera Lines</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
