const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      bio: 'Administrador de la plataforma.',
      location: 'Córdoba, España',
      interests: ['Tecnología', 'Eventos', 'Administración'],
      role: 'admin',
      isVerified: true,
    },
  });

  const organizerUser = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      email: 'organizer@example.com',
      password: await bcrypt.hash('organizer123', 10),
      name: 'María González',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
      bio: 'Organizadora de eventos culturales.',
      location: 'Córdoba, España',
      interests: ['Música', 'Arte', 'Eventos'],
      role: 'organizer',
      isVerified: true,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: await bcrypt.hash('user123', 10),
      name: 'Carlos López',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      bio: 'Amante de los eventos y la cultura.',
      location: 'Córdoba, España',
      interests: ['Música', 'Deportes'],
      role: 'user',
      isVerified: true,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      password: await bcrypt.hash('staff123', 10),
      name: 'Ana Staff',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      bio: 'Staff de validación de entrada.',
      location: 'Córdoba, España',
      interests: ['Eventos', 'Atención al público'],
      role: 'staff',
      isVerified: true,
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Música' },
      update: {},
      create: { name: 'Música', description: 'Eventos musicales' },
    }),
    prisma.category.upsert({
      where: { name: 'Deportes' },
      update: {},
      create: { name: 'Deportes', description: 'Eventos deportivos' },
    }),
    prisma.category.upsert({
      where: { name: 'Tecnología' },
      update: {},
      create: { name: 'Tecnología', description: 'Eventos tech' },
    }),
    prisma.category.upsert({
      where: { name: 'Cultura' },
      update: {},
      create: { name: 'Cultura', description: 'Eventos culturales' },
    }),
  ]);

  const eventsData = [
    {
      id: 1,
      title: 'Festival Flamenco Córdoba',
      description: 'Festival internacional de flamenco',
      date: new Date('2026-07-15T21:00:00Z'),
      location: 'Mezquita-Catedral',
      latitude: 37.8786,
      longitude: -4.7794,
      capacity: 2000,
      categoryId: categories[0].id,
      organizerId: organizerUser.id,
    },
    {
      id: 2,
      title: 'Media Maratón Córdoba',
      description: 'Carrera por el centro histórico',
      date: new Date('2026-04-20T08:00:00Z'),
      location: 'Puente Romano',
      latitude: 37.8746,
      longitude: -4.7778,
      capacity: 3000,
      categoryId: categories[1].id,
      organizerId: organizerUser.id,
    },
    {
      id: 3,
      title: 'Congreso Innovación Digital',
      description: 'Conferencia tecnológica',
      date: new Date('2026-11-10T09:00:00Z'),
      location: 'Palacio de Congresos',
      latitude: 37.8916,
      longitude: -4.7778,
      capacity: 600,
      categoryId: categories[2].id,
      organizerId: organizerUser.id,
    },
  ];

  const events = [];

  for (const e of eventsData) {
    const place = await prisma.place.upsert({
      where: { id: e.id },
      update: {},
      create: {
        latitude: e.latitude,
        longitude: e.longitude,
        formattedAddress: e.location,
      },
    });

    const { latitude, longitude, ...eventRest } = e;
    const event = await prisma.event.upsert({
      where: { id: e.id },
      update: {},
      create: {
        ...eventRest,
        slug: slugify(e.title),
        status: 'SCHEDULED',
        locationId: place.id,
      },
    });

    events.push(event);
  }

  // Crear favoritos de prueba
  const favoritePairs = [
    { userId: regularUser.id, eventId: events[0].id },
    { userId: regularUser.id, eventId: events[1].id },
  ];

  for (const pair of favoritePairs) {
    await prisma.favorite.upsert({
      where: { userId_eventId: { userId: pair.userId, eventId: pair.eventId } },
      update: {},
      create: { userId: pair.userId, eventId: pair.eventId },
    });
  }

  console.log('✅ Favoritos de prueba creados');

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });