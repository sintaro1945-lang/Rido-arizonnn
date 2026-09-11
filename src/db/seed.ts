import bcrypt from 'bcryptjs';
import { db } from './index.ts';
import {
  users,
  vessels,
  ports,
  routes,
  cargoCategories,
  customers,
  voyages,
  cargoBookings,
  voyageLogs,
} from './schema.ts';
import { sql } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    // Check if users already seeded
    const existingUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    if (Number(existingUsers[0]?.count) > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding initial shipping company management data...');

    // 1. Seed Users (Admin & Operator)
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('admin123', salt);

    const [adminUser] = await db
      .insert(users)
      .values([
        {
          username: 'admin',
          email: 'admin@pelayaran.co.id',
          passwordHash,
          fullName: 'Capt. Hendra Pratama, M.Mar',
          role: 'Admin',
        },
        {
          username: 'operator',
          email: 'operator@pelayaran.co.id',
          passwordHash,
          fullName: 'Budi Santoso (Ops Officer)',
          role: 'Operator',
        },
        {
          username: 'manager',
          email: 'manager@pelayaran.co.id',
          passwordHash,
          fullName: 'Siti Rahmawati, S.T.',
          role: 'Manager',
        },
      ])
      .returning();

    // 2. Seed Ports
    const [portPriok, portPerak, portMakassar, portBelawan, portBalikpapan, portBatam] = await db
      .insert(ports)
      .values([
        {
          code: 'IDTPP',
          name: 'Pelabuhan Tanjung Priok',
          city: 'Jakarta Utara',
          province: 'DKI Jakarta',
          country: 'Indonesia',
        },
        {
          code: 'IDPER',
          name: 'Pelabuhan Tanjung Perak',
          city: 'Surabaya',
          province: 'Jawa Timur',
          country: 'Indonesia',
        },
        {
          code: 'IDMAK',
          name: 'Pelabuhan Soekarno-Hatta Makassar',
          city: 'Makassar',
          province: 'Sulawesi Selatan',
          country: 'Indonesia',
        },
        {
          code: 'IDBLW',
          name: 'Pelabuhan Belawan',
          city: 'Medan',
          province: 'Sumatera Utara',
          country: 'Indonesia',
        },
        {
          code: 'IDBPN',
          name: 'Pelabuhan Semayang Balikpapan',
          city: 'Balikpapan',
          province: 'Kalimantan Timur',
          country: 'Indonesia',
        },
        {
          code: 'IDBTM',
          name: 'Pelabuhan Batu Ampar',
          city: 'Batam',
          province: 'Kepulauan Riau',
          country: 'Indonesia',
        },
      ])
      .returning();

    // 3. Seed Vessels
    const [vessel1, vessel2, vessel3, vessel4] = await db
      .insert(vessels)
      .values([
        {
          name: 'KM Samudera Nusantara 01',
          code: 'IMO-9412081',
          type: 'Kapal Kontainer',
          capacity: 1200,
          capacityUnit: 'TEU',
          buildYear: 2018,
          flag: 'Indonesia',
          status: 'Berlayar',
          currentLocation: 'Laut Jawa (Menuju Makassar)',
          notes: 'Spesifikasi kontainer berpendingin 150 plugs',
        },
        {
          name: 'MV Bahari Mandiri',
          code: 'IMO-9582910',
          type: 'Kapal Kontainer',
          capacity: 850,
          capacityUnit: 'TEU',
          buildYear: 2020,
          flag: 'Indonesia',
          status: 'Aktif',
          currentLocation: 'Pelabuhan Tanjung Priok',
          notes: 'Siap muat voyage berikutnya',
        },
        {
          name: 'KM Maritim Perkasa',
          code: 'IMO-9331824',
          type: 'Bulk Carrier',
          capacity: 25000,
          capacityUnit: 'DWT',
          buildYear: 2015,
          flag: 'Indonesia',
          status: 'Docking / Maintenance',
          currentLocation: 'Galangan Dok Surabaya',
          notes: 'Jadwal inspeksi berkala BKI',
        },
        {
          name: 'KM Selat Sunda Express',
          type: 'Kapal Ro-Ro',
          code: 'IMO-9721102',
          capacity: 450,
          capacityUnit: 'TEU',
          buildYear: 2021,
          flag: 'Indonesia',
          status: 'Aktif',
          currentLocation: 'Pelabuhan Tanjung Perak',
          notes: 'Armada logistik ekspres inter-insular',
        },
      ])
      .returning();

    // 4. Seed Routes
    const [route1, route2, route3, route4] = await db
      .insert(routes)
      .values([
        {
          originPortId: portPriok.id,
          destinationPortId: portPerak.id,
          distanceNm: 395,
          estDurationHours: 24,
          baseRatePerTeu: 4500000, // Rp 4.500.000
        },
        {
          originPortId: portPerak.id,
          destinationPortId: portMakassar.id,
          distanceNm: 480,
          estDurationHours: 36,
          baseRatePerTeu: 6800000, // Rp 6.800.000
        },
        {
          originPortId: portPriok.id,
          destinationPortId: portBelawan.id,
          distanceNm: 810,
          estDurationHours: 54,
          baseRatePerTeu: 8200000, // Rp 8.200.000
        },
        {
          originPortId: portPerak.id,
          destinationPortId: portBalikpapan.id,
          distanceNm: 520,
          estDurationHours: 40,
          baseRatePerTeu: 7500000, // Rp 7.500.000
        },
      ])
      .returning();

    // 5. Seed Cargo Categories
    const [catDry20, catDry40, catReefer, catHaz, catGeneral] = await db
      .insert(cargoCategories)
      .values([
        {
          code: 'DRY-20',
          name: 'Dry Container 20 Feet (Standar)',
          categoryType: 'General Cargo',
          handlingFee: 450000,
          description: 'Kargo kering barang umum manufaktur dan konsumsi',
        },
        {
          code: 'DRY-40',
          name: 'Dry Container 40 Feet High Cube',
          categoryType: 'General Cargo',
          handlingFee: 750000,
          description: 'Kargo kering volume besar',
        },
        {
          code: 'REEFER-40',
          name: 'Refrigerated Container (Reefer 40ft)',
          categoryType: 'Reefer / Berpendingin',
          handlingFee: 1400000,
          description: 'Hasil laut, daging beku, buah, produk farmasi',
        },
        {
          code: 'DG-IMO',
          name: 'Dangerous Goods (DG / IMO Class 3-8)',
          categoryType: 'Dangerous Goods',
          handlingFee: 2200000,
          description: 'Bahan kimia industri dengan protokol keselamatan khusus',
        },
        {
          code: 'GEN-BREAK',
          name: 'Break Bulk / Mesin & Alat Berat',
          categoryType: 'Alat Berat / Curah',
          handlingFee: 1800000,
          description: 'Mesin pabrik dan alat konstruksi tanpa kontainer',
        },
      ])
      .returning();

    // 6. Seed Customers (Shippers)
    const [cust1, cust2, cust3] = await db
      .insert(customers)
      .values([
        {
          companyName: 'PT Indo Pangan Sejahtera',
          contactPerson: 'Agus Setiawan',
          phone: '+62 811-2345-6789',
          email: 'logistik@indopangan.co.id',
          address: 'Kawasan Industri Pulogadung Blok C-12, Jakarta Timur',
          npwp: '01.345.678.9-001.000',
        },
        {
          companyName: 'PT Samudra Agro Makmur',
          contactPerson: 'Dewi Lestari',
          phone: '+62 812-9876-5432',
          email: 'dewi@samudra-agro.com',
          address: 'Jl. Perak Barat No. 88, Pabean Cantian, Surabaya',
          npwp: '02.456.789.1-002.000',
        },
        {
          companyName: 'CV Borneo Karya Logistik',
          contactPerson: 'Rizal Fahmi',
          phone: '+62 813-7766-5544',
          email: 'rizal@borneologistics.id',
          address: 'Jl. Yos Sudarso No. 15, Balikpapan',
          npwp: '03.567.890.2-003.000',
        },
      ])
      .returning();

    // 7. Seed Voyages
    const now = new Date();
    const departure1 = new Date(now.getTime() - 24 * 3600 * 1000); // 1 day ago
    const arrival1 = new Date(now.getTime() + 12 * 3600 * 1000); // in 12 hours
    const departure2 = new Date(now.getTime() + 48 * 3600 * 1000); // in 2 days
    const arrival2 = new Date(now.getTime() + 72 * 3600 * 1000);

    const [voy1, voy2] = await db
      .insert(voyages)
      .values([
        {
          voyageNumber: 'VOY/2025/JKT-SBY/042',
          vesselId: vessel1.id,
          routeId: route1.id,
          departureDate: departure1,
          arrivalDate: arrival1,
          status: 'Berlayar',
          currentNotes: 'Posisi mendekati Karang Jamuang, cuaca kondusif ombak 1.2m',
        },
        {
          voyageNumber: 'VOY/2025/SBY-MKS/019',
          vesselId: vessel2.id,
          routeId: route2.id,
          departureDate: departure2,
          arrivalDate: arrival2,
          status: 'Terjadwal',
          currentNotes: 'Proses penerimaan kargo di CFS Surabaya',
        },
      ])
      .returning();

    // 8. Seed Cargo Bookings (B/L)
    await db.insert(cargoBookings).values([
      {
        bookingNumber: 'BKG-2025-0101',
        blNumber: 'BL-SMD-7821901',
        voyageId: voy1.id,
        customerId: cust1.id,
        cargoCategoryId: catDry20.id,
        containerNumber: 'SPNU-209182-3',
        sealNumber: 'SL-JKT-8812',
        quantityTeu: 2,
        weightTons: 28,
        totalPrice: 9900000,
        paymentStatus: 'Lunas',
        shippingStatus: 'Di Atas Kapal',
        consigneeName: 'Toko Makmur Sejahtera Jawa Timur',
        consigneeContact: '+62 821-4455-6677',
        consigneeAddress: 'Jl. Margomulyo Indah Kav 5, Surabaya',
        notes: 'Kargo mie instan & minyak goreng',
      },
      {
        bookingNumber: 'BKG-2025-0102',
        blNumber: 'BL-SMD-7821902',
        voyageId: voy1.id,
        customerId: cust2.id,
        cargoCategoryId: catReefer.id,
        containerNumber: 'RFKU-440192-8',
        sealNumber: 'SL-JKT-8813',
        quantityTeu: 1,
        weightTons: 18,
        totalPrice: 11800000,
        paymentStatus: 'DP 50%',
        shippingStatus: 'Di Atas Kapal',
        consigneeName: 'PT Cold Storage Nusantara',
        consigneeContact: '+62 811-9988-7766',
        consigneeAddress: 'Kawasan Pergudangan Kalianak Barat No 12, Surabaya',
        notes: 'Set suhu reefer container -18°C',
      },
      {
        bookingNumber: 'BKG-2025-0103',
        blNumber: 'BL-SMD-7821903',
        voyageId: voy2.id,
        customerId: cust3.id,
        cargoCategoryId: catDry40.id,
        containerNumber: 'BRNU-881920-5',
        sealNumber: 'SL-SBY-3301',
        quantityTeu: 2,
        weightTons: 32,
        totalPrice: 16000000,
        paymentStatus: 'Pending',
        shippingStatus: 'Pemesanan Diterima',
        consigneeName: 'PT Celebes Mineral Utama',
        consigneeContact: '+62 852-1122-3344',
        consigneeAddress: 'Jl. Nusantara Pelabuhan No 40, Makassar',
        notes: 'Suku cadang peralatan pertambangan',
      },
    ]);

    // 9. Seed Voyage Logs
    await db.insert(voyageLogs).values([
      {
        voyageId: voy1.id,
        coordinates: '-5.9812, 106.8711',
        speedKnots: 15,
        weatherCondition: 'Cerah, Angin 10 knot',
        heading: '085° E',
        statusUpdate: 'Lepas tali dari Dermaga 102 Pelabuhan Tanjung Priok menuju Alur Pelayaran Barat Surabaya.',
        loggedBy: 'Capt. Hendra Pratama',
      },
      {
        voyageId: voy1.id,
        coordinates: '-6.3421, 109.1124',
        speedKnots: 16,
        weatherCondition: 'Berawan, Gelombang 1.0 m',
        heading: '090° E',
        statusUpdate: 'Melintasi perairan utara Cirebon/Tegal dengan kecepatan rata-rata 16 knot.',
        loggedBy: 'Mualim I Bambang',
      },
    ]);

    console.log('Database seeding finished successfully!');
  } catch (error) {
    console.error('Error during database seed:', error);
  }
}
