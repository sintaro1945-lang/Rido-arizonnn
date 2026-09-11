export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Operator' | 'Manager';
  avatarUrl?: string;
}

export interface Vessel {
  id: number;
  name: string;
  code: string;
  type: string;
  capacity: number;
  capacityUnit: string;
  buildYear: number;
  flag: string;
  status: 'Aktif' | 'Berlayar' | 'Docking / Maintenance' | 'Siaga';
  currentLocation: string;
  notes?: string;
  createdAt?: string;
}

export interface Port {
  id: number;
  code: string;
  name: string;
  city: string;
  province: string;
  country: string;
  createdAt?: string;
}

export interface SeaRoute {
  id: number;
  originPortId: number;
  destinationPortId: number;
  distanceNm: number;
  estDurationHours: number;
  baseRatePerTeu: number;
  originPort?: Port;
  destinationPort?: Port;
  createdAt?: string;
}

export interface CargoCategory {
  id: number;
  code: string;
  name: string;
  categoryType: string;
  handlingFee: number;
  description?: string;
  createdAt?: string;
}

export interface Customer {
  id: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  npwp?: string;
  createdAt?: string;
}

export interface Voyage {
  id: number;
  voyageNumber: string;
  vesselId: number;
  routeId: number;
  departureDate: string;
  arrivalDate: string;
  status: 'Terjadwal' | 'Proses Muat' | 'Berlayar' | 'Sandar' | 'Selesai' | 'Dibatalkan';
  currentNotes?: string;
  createdAt?: string;
  vessel?: Vessel;
  route?: SeaRoute;
  stats?: {
    totalBookings: number;
    bookedTeu: number;
    bookedWeight: number;
    bookedRevenue: number;
  };
}

export interface CargoBooking {
  id: number;
  bookingNumber: string;
  blNumber: string;
  voyageId: number;
  customerId: number;
  cargoCategoryId: number;
  containerNumber: string;
  sealNumber: string;
  quantityTeu: number;
  weightTons: number;
  totalPrice: number;
  paymentStatus: 'Pending' | 'DP 50%' | 'Lunas';
  shippingStatus: 'Pemesanan Diterima' | 'Di Pelabuhan Asal' | 'Di Atas Kapal' | 'Sandar di Tujuan' | 'Selesai Terkirim';
  consigneeName: string;
  consigneeContact: string;
  consigneeAddress?: string;
  notes?: string;
  createdAt?: string;
  voyage?: Voyage;
  customer?: Customer;
  cargoCategory?: CargoCategory;
}

export interface VoyageLog {
  id: number;
  voyageId: number;
  logTime: string;
  coordinates: string;
  speedKnots: number;
  weatherCondition: string;
  heading?: string;
  statusUpdate: string;
  loggedBy?: string;
}

export interface SummaryReport {
  totalVessels: number;
  activeVessels: number;
  totalVoyages: number;
  ongoingVoyages: number;
  totalBookings: number;
  totalCustomers: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  totalTeu: number;
  totalTons: number;
}
