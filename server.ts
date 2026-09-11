import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './src/db/index.ts';
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
} from './src/db/schema.ts';
import { eq, desc, sql } from 'drizzle-orm';
import { seedDatabase } from './src/db/seed.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'pelayaran-rahasia-token-super-secure-key';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Run initial seed asynchronously
  seedDatabase().catch((err) => console.error('Database seed error:', err));

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { usernameOrEmail, password } = req.body;
      if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: 'Username/email dan password wajib diisi.' });
      }

      // Find user by username or email
      const userList = await db
        .select()
        .from(users)
        .where(
          sql`${users.username} = ${usernameOrEmail} OR ${users.email} = ${usernameOrEmail}`
        )
        .limit(1);

      if (userList.length === 0) {
        return res.status(401).json({ error: 'Username atau password tidak ditemukan.' });
      }

      const user = userList[0];
      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Password yang dimasukkan salah.' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Terjadi kesalahan sistem saat proses login.' });
    }
  });

  app.get('/api/auth/me', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Belum login' });
    }
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userList = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
      if (userList.length === 0) {
        return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
      }
      const user = userList[0];
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(401).json({ error: 'Sesi login telah berakhir atau tidak sah.' });
    }
  });

  // ==========================================
  // MASTER DATA: ARMADA KAPAL (VESSELS)
  // ==========================================
  app.get('/api/vessels', async (req: Request, res: Response) => {
    try {
      const list = await db.select().from(vessels).orderBy(desc(vessels.createdAt));
      res.json(list);
    } catch (err: any) {
      console.error('Fetch vessels error:', err);
      res.status(500).json({ error: 'Gagal mengambil data kapal' });
    }
  });

  app.post('/api/vessels', async (req: Request, res: Response) => {
    try {
      const { name, code, type, capacity, capacityUnit, buildYear, flag, status, currentLocation, notes } = req.body;
      if (!name || !code || !type || !capacity) {
        return res.status(400).json({ error: 'Nama, kode/IMO, tipe, dan kapasitas wajib diisi.' });
      }
      const [inserted] = await db
        .insert(vessels)
        .values({
          name,
          code,
          type,
          capacity: Number(capacity),
          capacityUnit: capacityUnit || 'TEU',
          buildYear: Number(buildYear || new Date().getFullYear()),
          flag: flag || 'Indonesia',
          status: status || 'Aktif',
          currentLocation: currentLocation || 'Pelabuhan Tanjung Priok',
          notes: notes || '',
        })
        .returning();
      res.status(201).json(inserted);
    } catch (err: any) {
      console.error('Create vessel error:', err);
      res.status(500).json({ error: err.message || 'Gagal menambahkan data armada kapal' });
    }
  });

  app.put('/api/vessels/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { name, code, type, capacity, capacityUnit, buildYear, flag, status, currentLocation, notes } = req.body;
      const [updated] = await db
        .update(vessels)
        .set({
          name,
          code,
          type,
          capacity: Number(capacity),
          capacityUnit,
          buildYear: Number(buildYear),
          flag,
          status,
          currentLocation,
          notes,
        })
        .where(eq(vessels.id, id))
        .returning();
      if (!updated) return res.status(404).json({ error: 'Data kapal tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      console.error('Update vessel error:', err);
      res.status(500).json({ error: 'Gagal memperbarui data kapal' });
    }
  });

  app.delete('/api/vessels/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await db.delete(vessels).where(eq(vessels.id, id));
      res.json({ message: 'Kapal berhasil dihapus' });
    } catch (err: any) {
      console.error('Delete vessel error:', err);
      res.status(500).json({ error: 'Gagal menghapus kapal. Mungkin sedang terikat jadwal pelayaran aktif.' });
    }
  });

  // ==========================================
  // MASTER DATA: PELABUHAN (PORTS)
  // ==========================================
  app.get('/api/ports', async (req: Request, res: Response) => {
    try {
      const list = await db.select().from(ports).orderBy(ports.name);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil data pelabuhan' });
    }
  });

  app.post('/api/ports', async (req: Request, res: Response) => {
    try {
      const { code, name, city, province, country } = req.body;
      if (!code || !name || !city || !province) {
        return res.status(400).json({ error: 'Kode, nama, kota, dan provinsi wajib diisi.' });
      }
      const [inserted] = await db
        .insert(ports)
        .values({
          code,
          name,
          city,
          province,
          country: country || 'Indonesia',
        })
        .returning();
      res.status(201).json(inserted);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Gagal menambahkan pelabuhan' });
    }
  });

  app.put('/api/ports/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { code, name, city, province, country } = req.body;
      const [updated] = await db
        .update(ports)
        .set({ code, name, city, province, country })
        .where(eq(ports.id, id))
        .returning();
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal memperbarui data pelabuhan' });
    }
  });

  app.delete('/api/ports/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await db.delete(ports).where(eq(ports.id, id));
      res.json({ message: 'Pelabuhan berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus pelabuhan' });
    }
  });

  // ==========================================
  // MASTER DATA: RUTE PELAYARAN (ROUTES)
  // ==========================================
  app.get('/api/routes', async (req: Request, res: Response) => {
    try {
      const originPortAlias = ports;
      // Fetch with joined port details
      const allRoutes = await db
        .select({
          id: routes.id,
          originPortId: routes.originPortId,
          destinationPortId: routes.destinationPortId,
          distanceNm: routes.distanceNm,
          estDurationHours: routes.estDurationHours,
          baseRatePerTeu: routes.baseRatePerTeu,
          createdAt: routes.createdAt,
        })
        .from(routes)
        .orderBy(desc(routes.createdAt));

      const allPorts = await db.select().from(ports);
      const portMap = new Map(allPorts.map((p) => [p.id, p]));

      const enriched = allRoutes.map((r) => ({
        ...r,
        originPort: portMap.get(r.originPortId),
        destinationPort: portMap.get(r.destinationPortId),
      }));

      res.json(enriched);
    } catch (err: any) {
      console.error('Fetch routes error:', err);
      res.status(500).json({ error: 'Gagal mengambil data rute pelayaran' });
    }
  });

  app.post('/api/routes', async (req: Request, res: Response) => {
    try {
      const { originPortId, destinationPortId, distanceNm, estDurationHours, baseRatePerTeu } = req.body;
      if (!originPortId || !destinationPortId || !distanceNm || !estDurationHours || !baseRatePerTeu) {
        return res.status(400).json({ error: 'Semua field rute wajib diisi.' });
      }
      const [inserted] = await db
        .insert(routes)
        .values({
          originPortId: Number(originPortId),
          destinationPortId: Number(destinationPortId),
          distanceNm: Number(distanceNm),
          estDurationHours: Number(estDurationHours),
          baseRatePerTeu: Number(baseRatePerTeu),
        })
        .returning();
      res.status(201).json(inserted);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Gagal menambahkan rute' });
    }
  });

  app.put('/api/routes/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { originPortId, destinationPortId, distanceNm, estDurationHours, baseRatePerTeu } = req.body;
      const [updated] = await db
        .update(routes)
        .set({
          originPortId: Number(originPortId),
          destinationPortId: Number(destinationPortId),
          distanceNm: Number(distanceNm),
          estDurationHours: Number(estDurationHours),
          baseRatePerTeu: Number(baseRatePerTeu),
        })
        .where(eq(routes.id, id))
        .returning();
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal memperbarui rute' });
    }
  });

  app.delete('/api/routes/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await db.delete(routes).where(eq(routes.id, id));
      res.json({ message: 'Rute berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus rute' });
    }
  });

  // ==========================================
  // MASTER DATA: KATEGORI KARGO (CARGO CATEGORIES)
  // ==========================================
  app.get('/api/cargo-categories', async (req: Request, res: Response) => {
    try {
      const list = await db.select().from(cargoCategories).orderBy(cargoCategories.name);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil data kategori kargo' });
    }
  });

  app.post('/api/cargo-categories', async (req: Request, res: Response) => {
    try {
      const { code, name, categoryType, handlingFee, description } = req.body;
      const [inserted] = await db
        .insert(cargoCategories)
        .values({
          code,
          name,
          categoryType: categoryType || 'General Cargo',
          handlingFee: Number(handlingFee || 0),
          description: description || '',
        })
        .returning();
      res.status(201).json(inserted);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Gagal menambahkan kategori kargo' });
    }
  });

  app.put('/api/cargo-categories/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { code, name, categoryType, handlingFee, description } = req.body;
      const [updated] = await db
        .update(cargoCategories)
        .set({
          code,
          name,
          categoryType,
          handlingFee: Number(handlingFee),
          description,
        })
        .where(eq(cargoCategories.id, id))
        .returning();
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal memperbarui kategori kargo' });
    }
  });

  app.delete('/api/cargo-categories/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await db.delete(cargoCategories).where(eq(cargoCategories.id, id));
      res.json({ message: 'Kategori kargo berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus kategori kargo' });
    }
  });

  // ==========================================
  // MASTER DATA: PELANGGAN / SHIPPERS
  // ==========================================
  app.get('/api/customers', async (req: Request, res: Response) => {
    try {
      const list = await db.select().from(customers).orderBy(customers.companyName);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil data pelanggan' });
    }
  });

  app.post('/api/customers', async (req: Request, res: Response) => {
    try {
      const { companyName, contactPerson, phone, email, address, npwp } = req.body;
      if (!companyName || !contactPerson || !phone || !email || !address) {
        return res.status(400).json({ error: 'Nama perusahaan, kontak, telepon, email, dan alamat wajib diisi.' });
      }
      const [inserted] = await db
        .insert(customers)
        .values({
          companyName,
          contactPerson,
          phone,
          email,
          address,
          npwp: npwp || '',
        })
        .returning();
      res.status(201).json(inserted);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Gagal menambahkan pelanggan' });
    }
  });

  app.put('/api/customers/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { companyName, contactPerson, phone, email, address, npwp } = req.body;
      const [updated] = await db
        .update(customers)
        .set({ companyName, contactPerson, phone, email, address, npwp })
        .where(eq(customers.id, id))
        .returning();
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal memperbarui data pelanggan' });
    }
  });

  app.delete('/api/customers/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await db.delete(customers).where(eq(customers.id, id));
      res.json({ message: 'Pelanggan berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus pelanggan' });
    }
  });

  // ==========================================
  // TRANSAKSI: JADWAL PELAYARAN (VOYAGES)
  // ==========================================
  app.get('/api/voyages', async (req: Request, res: Response) => {
    try {
      const allVoyages = await db.select().from(voyages).orderBy(desc(voyages.departureDate));
      const allVessels = await db.select().from(vessels);
      const allRoutes = await db.select().from(routes);
      const allPorts = await db.select().from(ports);
      const allBookings = await db.select().from(cargoBookings);

      const vesselMap = new Map(allVessels.map((v) => [v.id, v]));
      const portMap = new Map(allPorts.map((p) => [p.id, p]));
      const routeMap = new Map(
        allRoutes.map((r) => [
          r.id,
          {
            ...r,
            originPort: portMap.get(r.originPortId),
            destinationPort: portMap.get(r.destinationPortId),
          },
        ])
      );

      const enriched = allVoyages.map((v) => {
        const bookingsForVoyage = allBookings.filter((b) => b.voyageId === v.id);
        const bookedTeu = bookingsForVoyage.reduce((sum, b) => sum + (b.quantityTeu || 1), 0);
        const bookedWeight = bookingsForVoyage.reduce((sum, b) => sum + (b.weightTons || 0), 0);
        const bookedRevenue = bookingsForVoyage.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        return {
          ...v,
          vessel: vesselMap.get(v.vesselId),
          route: routeMap.get(v.routeId),
          stats: {
            totalBookings: bookingsForVoyage.length,
            bookedTeu,
            bookedWeight,
            bookedRevenue,
          },
        };
      });

      res.json(enriched);
    } catch (err: any) {
      console.error('Fetch voyages error:', err);
      res.status(500).json({ error: 'Gagal mengambil data jadwal pelayaran' });
    }
  });

  app.post('/api/voyages', async (req: Request, res: Response) => {
    try {
      const { voyageNumber, vesselId, routeId, departureDate, arrivalDate, status, currentNotes } = req.body;
      if (!voyageNumber || !vesselId || !routeId || !departureDate || !arrivalDate) {
        return res.status(400).json({ error: 'Nomor voyage, kapal, rute, tanggal berangkat dan tiba wajib diisi.' });
      }
      const [inserted] = await db
        .insert(voyages)
        .values({
          voyageNumber,
          vesselId: Number(vesselId),
          routeId: Number(routeId),
          departureDate: new Date(departureDate),
          arrivalDate: new Date(arrivalDate),
          status: status || 'Terjadwal',
          currentNotes: currentNotes || '',
        })
        .returning();

      // If status is Berlayar, also update vessel status
      if (status === 'Berlayar') {
        await db.update(vessels).set({ status: 'Berlayar' }).where(eq(vessels.id, Number(vesselId)));
      }

      res.status(201).json(inserted);
    } catch (err: any) {
      console.error('Create voyage error:', err);
      res.status(500).json({ error: err.message || 'Gagal membuat jadwal pelayaran' });
    }
  });

  app.put('/api/voyages/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { voyageNumber, vesselId, routeId, departureDate, arrivalDate, status, currentNotes } = req.body;
      const [updated] = await db
        .update(voyages)
        .set({
          voyageNumber,
          vesselId: Number(vesselId),
          routeId: Number(routeId),
          departureDate: new Date(departureDate),
          arrivalDate: new Date(arrivalDate),
          status,
          currentNotes,
        })
        .where(eq(voyages.id, id))
        .returning();

      // Auto sync vessel status if status changes
      if (status === 'Berlayar') {
        await db.update(vessels).set({ status: 'Berlayar' }).where(eq(vessels.id, Number(vesselId)));
      } else if (status === 'Selesai' || status === 'Sandar') {
        await db.update(vessels).set({ status: 'Aktif' }).where(eq(vessels.id, Number(vesselId)));
      }

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal memperbarui jadwal pelayaran' });
    }
  });

  app.delete('/api/voyages/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      // delete logs first
      await db.delete(voyageLogs).where(eq(voyageLogs.voyageId, id));
      await db.delete(voyages).where(eq(voyages.id, id));
      res.json({ message: 'Jadwal pelayaran berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus jadwal pelayaran. Ada muatan kargo terdaftar.' });
    }
  });

  // ==========================================
  // TRANSAKSI: PEMESANAN KARGO & B/L (BOOKINGS)
  // ==========================================
  app.get('/api/bookings', async (req: Request, res: Response) => {
    try {
      const allBookings = await db.select().from(cargoBookings).orderBy(desc(cargoBookings.createdAt));
      const allVoyages = await db.select().from(voyages);
      const allCustomers = await db.select().from(customers);
      const allCategories = await db.select().from(cargoCategories);
      const allVessels = await db.select().from(vessels);
      const allRoutes = await db.select().from(routes);
      const allPorts = await db.select().from(ports);

      const customerMap = new Map(allCustomers.map((c) => [c.id, c]));
      const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));
      const vesselMap = new Map(allVessels.map((v) => [v.id, v]));
      const portMap = new Map(allPorts.map((p) => [p.id, p]));
      const routeMap = new Map(
        allRoutes.map((r) => [
          r.id,
          {
            ...r,
            originPort: portMap.get(r.originPortId),
            destinationPort: portMap.get(r.destinationPortId),
          },
        ])
      );
      const voyageMap = new Map(
        allVoyages.map((v) => [
          v.id,
          {
            ...v,
            vessel: vesselMap.get(v.vesselId),
            route: routeMap.get(v.routeId),
          },
        ])
      );

      const enriched = allBookings.map((b) => ({
        ...b,
        voyage: voyageMap.get(b.voyageId),
        customer: customerMap.get(b.customerId),
        cargoCategory: categoryMap.get(b.cargoCategoryId),
      }));

      res.json(enriched);
    } catch (err: any) {
      console.error('Fetch bookings error:', err);
      res.status(500).json({ error: 'Gagal mengambil data pemesanan kargo' });
    }
  });

  app.post('/api/bookings', async (req: Request, res: Response) => {
    try {
      const {
        bookingNumber,
        blNumber,
        voyageId,
        customerId,
        cargoCategoryId,
        containerNumber,
        sealNumber,
        quantityTeu,
        weightTons,
        totalPrice,
        paymentStatus,
        shippingStatus,
        consigneeName,
        consigneeContact,
        consigneeAddress,
        notes,
      } = req.body;

      if (!voyageId || !customerId || !cargoCategoryId || !containerNumber || !consigneeName) {
        return res.status(400).json({ error: 'Pelayaran, shipper, jenis kargo, nomor kontainer, dan consignee wajib diisi.' });
      }

      // Generate BKG & BL if not provided
      const autoBkg = bookingNumber || `BKG-${Date.now().toString().slice(-6)}`;
      const autoBl = blNumber || `BL-SMD-${Math.floor(100000 + Math.random() * 900000)}`;

      const [inserted] = await db
        .insert(cargoBookings)
        .values({
          bookingNumber: autoBkg,
          blNumber: autoBl,
          voyageId: Number(voyageId),
          customerId: Number(customerId),
          cargoCategoryId: Number(cargoCategoryId),
          containerNumber,
          sealNumber: sealNumber || `SL-${Math.floor(1000 + Math.random() * 9000)}`,
          quantityTeu: Number(quantityTeu || 1),
          weightTons: Number(weightTons || 10),
          totalPrice: Number(totalPrice || 5000000),
          paymentStatus: paymentStatus || 'Pending',
          shippingStatus: shippingStatus || 'Pemesanan Diterima',
          consigneeName,
          consigneeContact: consigneeContact || '',
          consigneeAddress: consigneeAddress || '',
          notes: notes || '',
        })
        .returning();

      res.status(201).json(inserted);
    } catch (err: any) {
      console.error('Create booking error:', err);
      res.status(500).json({ error: err.message || 'Gagal membuat pemesanan kargo' });
    }
  });

  app.put('/api/bookings/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const {
        bookingNumber,
        blNumber,
        voyageId,
        customerId,
        cargoCategoryId,
        containerNumber,
        sealNumber,
        quantityTeu,
        weightTons,
        totalPrice,
        paymentStatus,
        shippingStatus,
        consigneeName,
        consigneeContact,
        consigneeAddress,
        notes,
      } = req.body;

      const [updated] = await db
        .update(cargoBookings)
        .set({
          bookingNumber,
          blNumber,
          voyageId: Number(voyageId),
          customerId: Number(customerId),
          cargoCategoryId: Number(cargoCategoryId),
          containerNumber,
          sealNumber,
          quantityTeu: Number(quantityTeu),
          weightTons: Number(weightTons),
          totalPrice: Number(totalPrice),
          paymentStatus,
          shippingStatus,
          consigneeName,
          consigneeContact,
          consigneeAddress,
          notes,
        })
        .where(eq(cargoBookings.id, id))
        .returning();

      res.json(updated);
    } catch (err: any) {
      console.error('Update booking error:', err);
      res.status(500).json({ error: 'Gagal memperbarui pemesanan kargo' });
    }
  });

  app.delete('/api/bookings/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await db.delete(cargoBookings).where(eq(cargoBookings.id, id));
      res.json({ message: 'Pemesanan kargo / Bill of Lading berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus pemesanan kargo' });
    }
  });

  // ==========================================
  // TRANSAKSI: LOG PELAYARAN & TRACKING
  // ==========================================
  app.get('/api/voyages/:id/logs', async (req: Request, res: Response) => {
    try {
      const voyageId = Number(req.params.id);
      const logs = await db
        .select()
        .from(voyageLogs)
        .where(eq(voyageLogs.voyageId, voyageId))
        .orderBy(desc(voyageLogs.logTime));
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil log pelayaran' });
    }
  });

  app.post('/api/voyages/:id/logs', async (req: Request, res: Response) => {
    try {
      const voyageId = Number(req.params.id);
      const { coordinates, speedKnots, weatherCondition, heading, statusUpdate, loggedBy } = req.body;
      const [inserted] = await db
        .insert(voyageLogs)
        .values({
          voyageId,
          coordinates: coordinates || '-6.1020, 107.0120',
          speedKnots: Number(speedKnots || 14),
          weatherCondition: weatherCondition || 'Cerah',
          heading: heading || '090° E',
          statusUpdate: statusUpdate || 'Update posisi kapal rutin',
          loggedBy: loggedBy || 'Petugas Navigasi',
        })
        .returning();
      res.status(201).json(inserted);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menambahkan log tracking' });
    }
  });

  // ==========================================
  // LAPORAN & RINGKASAN STATISTIK BISNIS
  // ==========================================
  app.get('/api/reports/summary', async (req: Request, res: Response) => {
    try {
      const allVessels = await db.select().from(vessels);
      const allVoyages = await db.select().from(voyages);
      const allBookings = await db.select().from(cargoBookings);
      const allCustomers = await db.select().from(customers);

      const activeVessels = allVessels.filter((v) => v.status === 'Berlayar' || v.status === 'Aktif').length;
      const ongoingVoyages = allVoyages.filter((v) => v.status === 'Berlayar' || v.status === 'Proses Muat').length;
      const totalRevenue = allBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
      const paidRevenue = allBookings
        .filter((b) => b.paymentStatus === 'Lunas')
        .reduce((acc, b) => acc + (b.totalPrice || 0), 0);
      const totalTeu = allBookings.reduce((acc, b) => acc + (b.quantityTeu || 1), 0);
      const totalTons = allBookings.reduce((acc, b) => acc + (b.weightTons || 0), 0);

      res.json({
        totalVessels: allVessels.length,
        activeVessels,
        totalVoyages: allVoyages.length,
        ongoingVoyages,
        totalBookings: allBookings.length,
        totalCustomers: allCustomers.length,
        totalRevenue,
        paidRevenue,
        pendingRevenue: totalRevenue - paidRevenue,
        totalTeu,
        totalTons,
      });
    } catch (err: any) {
      console.error('Summary report error:', err);
      res.status(500).json({ error: 'Gagal mengambil rekap laporan' });
    }
  });

  app.get('/api/reports/manifest/:voyageId', async (req: Request, res: Response) => {
    try {
      const voyageId = Number(req.params.voyageId);
      const [voyage] = await db.select().from(voyages).where(eq(voyages.id, voyageId));
      if (!voyage) return res.status(404).json({ error: 'Voyage tidak ditemukan' });

      const [vessel] = await db.select().from(vessels).where(eq(vessels.id, voyage.vesselId));
      const [route] = await db.select().from(routes).where(eq(routes.id, voyage.routeId));
      const [originPort] = await db.select().from(ports).where(eq(ports.id, route.originPortId));
      const [destPort] = await db.select().from(ports).where(eq(ports.id, route.destinationPortId));

      const bookings = await db.select().from(cargoBookings).where(eq(cargoBookings.voyageId, voyageId));
      const allCustomers = await db.select().from(customers);
      const allCategories = await db.select().from(cargoCategories);

      const custMap = new Map(allCustomers.map((c) => [c.id, c]));
      const catMap = new Map(allCategories.map((c) => [c.id, c]));

      const manifestItems = bookings.map((b) => ({
        ...b,
        shipper: custMap.get(b.customerId)?.companyName || 'Unknown',
        cargoType: catMap.get(b.cargoCategoryId)?.name || 'General Cargo',
      }));

      res.json({
        voyage,
        vessel,
        route: {
          ...route,
          originPort,
          destinationPort: destPort,
        },
        manifestItems,
        totalTeu: manifestItems.reduce((sum, item) => sum + (item.quantityTeu || 1), 0),
        totalWeight: manifestItems.reduce((sum, item) => sum + (item.weightTons || 0), 0),
        totalRevenue: manifestItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil manifest pelayaran' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server shipping management running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
