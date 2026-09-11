import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// 1. Users / Admin accounts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 30 }).notNull().default('Admin'), // Admin, Operator, Manager
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Master: Armada Kapal (Vessels)
export const vessels = pgTable('vessels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(), // IMO or Call Sign
  type: varchar('type', { length: 50 }).notNull(), // Kapal Kontainer, Bulk Carrier, Kapal Tanker, Kapal Ro-Ro, General Cargo
  capacity: integer('capacity').notNull(), // e.g. 1500
  capacityUnit: varchar('capacity_unit', { length: 20 }).notNull().default('TEU'), // TEU, Ton, DWT
  buildYear: integer('build_year').notNull(),
  flag: varchar('flag', { length: 50 }).notNull().default('Indonesia'),
  status: varchar('status', { length: 30 }).notNull().default('Aktif'), // Aktif, Berlayar, Docking / Maintenance, Siaga
  currentLocation: varchar('current_location', { length: 100 }).default('Pelabuhan Tanjung Priok'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Master: Pelabuhan (Ports)
export const ports = pgTable('ports', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(), // e.g. IDTPP
  name: varchar('name', { length: 100 }).notNull(), // Pelabuhan Tanjung Priok
  city: varchar('city', { length: 100 }).notNull(), // Jakarta
  province: varchar('province', { length: 100 }).notNull(), // DKI Jakarta
  country: varchar('country', { length: 50 }).notNull().default('Indonesia'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Master: Rute Pelayaran (Routes)
export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  originPortId: integer('origin_port_id')
    .references(() => ports.id)
    .notNull(),
  destinationPortId: integer('destination_port_id')
    .references(() => ports.id)
    .notNull(),
  distanceNm: integer('distance_nm').notNull(), // Jarak Nautical Miles
  estDurationHours: integer('est_duration_hours').notNull(), // Estimasi Jam Perjalanan
  baseRatePerTeu: integer('base_rate_per_teu').notNull(), // Tarif Dasar dalam IDR
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Master: Kategori Kargo & Kontainer
export const cargoCategories = pgTable('cargo_categories', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 30 }).notNull().unique(), // DRY-20, REEFER-40, DG-HAZ, BULK-LIQ
  name: varchar('name', { length: 100 }).notNull(), // Dry Container 20ft
  categoryType: varchar('category_type', { length: 50 }).notNull(), // General, Reefer, Dangerous Goods, Liquid Bulk
  handlingFee: integer('handling_fee').notNull().default(0), // Biaya Bongkar Muat Tambahan
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Master: Pelanggan / Shippers
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  companyName: varchar('company_name', { length: 150 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  address: text('address').notNull(),
  npwp: varchar('npwp', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Transaksi: Jadwal Pelayaran (Voyages / Schedules)
export const voyages = pgTable('voyages', {
  id: serial('id').primaryKey(),
  voyageNumber: varchar('voyage_number', { length: 50 }).notNull().unique(), // e.g. VOY/2025/JKT-SBY/001
  vesselId: integer('vessel_id')
    .references(() => vessels.id)
    .notNull(),
  routeId: integer('route_id')
    .references(() => routes.id)
    .notNull(),
  departureDate: timestamp('departure_date').notNull(),
  arrivalDate: timestamp('arrival_date').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('Terjadwal'), // Terjadwal, Proses Muat, Berlayar, Sandar, Selesai, Dibatalkan
  currentNotes: text('current_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Transaksi: Pemesanan Kargo & Bill of Lading (Cargo Bookings)
export const cargoBookings = pgTable('cargo_bookings', {
  id: serial('id').primaryKey(),
  bookingNumber: varchar('booking_number', { length: 50 }).notNull().unique(), // BKG-2025-001
  blNumber: varchar('bl_number', { length: 50 }).notNull().unique(), // BL-SMD-88219
  voyageId: integer('voyage_id')
    .references(() => voyages.id)
    .notNull(),
  customerId: integer('customer_id')
    .references(() => customers.id)
    .notNull(),
  cargoCategoryId: integer('cargo_category_id')
    .references(() => cargoCategories.id)
    .notNull(),
  containerNumber: varchar('container_number', { length: 50 }).notNull(), // e.g. TGHU-918231-2
  sealNumber: varchar('seal_number', { length: 50 }).notNull(), // SL-8821
  quantityTeu: integer('quantity_teu').notNull().default(1),
  weightTons: integer('weight_tons').notNull(),
  totalPrice: integer('total_price').notNull(), // IDR
  paymentStatus: varchar('payment_status', { length: 30 }).notNull().default('Pending'), // Pending, DP 50%, Lunas
  shippingStatus: varchar('shipping_status', { length: 40 }).notNull().default('Pemesanan Diterima'), // Pemesanan Diterima, Di Pelabuhan Asal, Di Atas Kapal, Sandar di Tujuan, Selesai Terkirim
  consigneeName: varchar('consignee_name', { length: 150 }).notNull(),
  consigneeContact: varchar('consignee_contact', { length: 50 }).notNull(),
  consigneeAddress: text('consignee_address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Transaksi: Tracking & Log Pelayaran
export const voyageLogs = pgTable('voyage_logs', {
  id: serial('id').primaryKey(),
  voyageId: integer('voyage_id')
    .references(() => voyages.id)
    .notNull(),
  logTime: timestamp('log_time').defaultNow(),
  coordinates: varchar('coordinates', { length: 50 }).notNull(), // e.g. -5.9812, 106.8711
  speedKnots: integer('speed_knots').notNull().default(14),
  weatherCondition: varchar('weather_condition', { length: 50 }).notNull().default('Cerah'),
  heading: varchar('heading', { length: 20 }).default('095° E'),
  statusUpdate: text('status_update').notNull(),
  loggedBy: varchar('logged_by', { length: 100 }).default('Mualim I'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const routesRelations = relations(routes, ({ one }) => ({
  originPort: one(ports, {
    fields: [routes.originPortId],
    references: [ports.id],
    relationName: 'originPort',
  }),
  destinationPort: one(ports, {
    fields: [routes.destinationPortId],
    references: [ports.id],
    relationName: 'destinationPort',
  }),
}));

export const voyagesRelations = relations(voyages, ({ one, many }) => ({
  vessel: one(vessels, {
    fields: [voyages.vesselId],
    references: [vessels.id],
  }),
  route: one(routes, {
    fields: [voyages.routeId],
    references: [routes.id],
  }),
  bookings: many(cargoBookings),
  logs: many(voyageLogs),
}));

export const cargoBookingsRelations = relations(cargoBookings, ({ one }) => ({
  voyage: one(voyages, {
    fields: [cargoBookings.voyageId],
    references: [voyages.id],
  }),
  customer: one(customers, {
    fields: [cargoBookings.customerId],
    references: [customers.id],
  }),
  cargoCategory: one(cargoCategories, {
    fields: [cargoBookings.cargoCategoryId],
    references: [cargoCategories.id],
  }),
}));

export const voyageLogsRelations = relations(voyageLogs, ({ one }) => ({
  voyage: one(voyages, {
    fields: [voyageLogs.voyageId],
    references: [voyages.id],
  }),
}));
