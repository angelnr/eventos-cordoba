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
    prisma.category.upsert({
      where: { name: 'Gastronomía' },
      update: {},
      create: { name: 'Gastronomía', description: 'Eventos gastronómicos y de vinos' },
    }),
    prisma.category.upsert({
      where: { name: 'Arte y Artesanía' },
      update: {},
      create: { name: 'Arte y Artesanía', description: 'Talleres, exposiciones y artesanía' },
    }),
    prisma.category.upsert({
      where: { name: 'Turismo' },
      update: {},
      create: { name: 'Turismo', description: 'Visitas guiadas y rutas turísticas' },
    }),
    prisma.category.upsert({
      where: { name: 'Folclore' },
      update: {},
      create: { name: 'Folclore', description: 'Romerías, ferias y costumbres populares' },
    }),
  ]);

  const eventsData = [
    {
      id: 1,
      title: 'Festival Flamenco Córdoba',
      description: 'Festival internacional de flamenco con actuaciones en el corazón del casco histórico. Artistas locales e internacionales en un marco incomparable.',
      date: new Date('2026-08-15T21:00:00Z'),
      location: 'Mezquita-Catedral',
      latitude: 37.8786,
      longitude: -4.7794,
      capacity: 2000,
      categoryId: categories[0].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://plus.unsplash.com/premium_photo-1685094987286-fa4ce5edd55c?q=80&w=2084&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      price: 0,
    },
    {
      id: 2,
      title: 'Media Maratón Córdoba',
      description: 'Carrera popular por el centro histórico de Córdoba, cruzando el Puente Romano y recorriendo las calles del casco antiguo.',
      date: new Date('2026-09-20T08:00:00Z'),
      location: 'Puente Romano',
      latitude: 37.8746,
      longitude: -4.7778,
      capacity: 3000,
      categoryId: categories[1].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5',
      price: 12,
    },
    {
      id: 3,
      title: 'Congreso Innovación Digital',
      description: 'Conferencia tecnológica sobre innovación digital, IA y emprendimiento en el Palacio de Congresos de Córdoba.',
      date: new Date('2026-11-10T09:00:00Z'),
      location: 'Palacio de Congresos',
      latitude: 37.8916,
      longitude: -4.7778,
      capacity: 600,
      categoryId: categories[2].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998',
      price: 0,
    },
    {
      id: 4,
      title: 'Festival de los Patios de Córdoba',
      description: 'Concurso y exposición de los emblemáticos patios cordobeses, declarados Patrimonio Inmaterial de la Humanidad por la UNESCO. Recorre los patios más bonitos de la ciudad adornados con flores y plantas.',
      date: new Date('2027-05-08T10:00:00Z'),
      location: 'Barrio de San Basilio',
      latitude: 37.8810,
      longitude: -4.7820,
      capacity: 1500,
      categoryId: categories[7].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1732799208796-0545ef9955f3?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      price: 0,
    },
    {
      id: 5,
      title: 'Noche Blanca del Flamenco',
      description: 'Una noche mágica donde las calles del casco histórico se llenan de actuaciones flamencas simultáneas. Más de 30 escenarios repartidos por la Judería y el entorno de la Mezquita.',
      date: new Date('2026-08-20T21:00:00Z'),
      location: 'Casco Histórico de Córdoba',
      latitude: 37.8790,
      longitude: -4.7800,
      capacity: 5000,
      categoryId: categories[0].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1722461079337-1775b8f61137?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      price: 0,
    },
    {
      id: 6,
      title: 'Feria de Córdoba',
      description: 'La gran feria anual de Nuestra Señora de la Salud. Casetas, baile, gastronomía y diversión en el recinto ferial del Arenal.',
      date: new Date('2027-05-24T12:00:00Z'),
      location: 'Recinto Ferial El Arenal',
      latitude: 37.8850,
      longitude: -4.7720,
      capacity: 10000,
      categoryId: categories[7].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
      price: 0,
    },
    {
      id: 7,
      title: 'Visita Nocturna a la Mezquita-Catedral',
      description: 'Experiencia única de visita nocturna al monumento más emblemático de Córdoba. Iluminación especial y audioguía para descubrir la historia del edificio.',
      date: new Date('2026-08-14T22:00:00Z'),
      location: 'Mezquita-Catedral de Córdoba',
      latitude: 37.8786,
      longitude: -4.7794,
      capacity: 300,
      categoryId: categories[6].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1632904080322-e71e16a5987f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      price: 18,
    },
    {
      id: 8,
      title: 'Ruta Gastronómica por la Judería',
      description: 'Paseo culinario por la Judería cordobesa con degustación de salmorejo, flamenquín, rabo de toro y postres andaluces en restaurantes tradicionales.',
      date: new Date('2026-09-12T13:00:00Z'),
      location: 'Judería de Córdoba',
      latitude: 37.8800,
      longitude: -4.7810,
      capacity: 40,
      categoryId: categories[4].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
      price: 35,
    },
    {
      id: 9,
      title: 'Festival de la Guitarra de Córdoba',
      description: 'Festival internacional que reúne a los mejores guitarristas del mundo. Conciertos, masterclasses y exposiciones en los jardines del Alcázar.',
      date: new Date('2026-08-05T20:00:00Z'),
      location: 'Alcázar de los Reyes Cristianos',
      latitude: 37.8765,
      longitude: -4.7805,
      capacity: 800,
      categoryId: categories[0].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1',
      price: 25,
    },
    {
      id: 10,
      title: 'Carreras de Medina Azahara',
      description: 'Carrera popular en el entorno del yacimiento arqueológico de Medina Azahara, la ciudad palatina del califato de Córdoba. Recorridos de 5K y 10K.',
      date: new Date('2026-10-18T09:00:00Z'),
      location: 'Medina Azahara',
      latitude: 37.8868,
      longitude: -4.8330,
      capacity: 500,
      categoryId: categories[1].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5',
      price: 12,
    },
    {
      id: 11,
      title: 'Taller de Cerámica Andaluza',
      description: 'Aprende las técnicas tradicionales de la cerámica andalusí en un taller práctico. Incluye materiales y tu propia pieza para llevar a casa.',
      date: new Date('2026-11-08T11:00:00Z'),
      location: 'Centro de Artesanía de Córdoba',
      latitude: 37.8820,
      longitude: -4.7760,
      capacity: 20,
      categoryId: categories[5].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
      price: 30,
    },
    {
      id: 12,
      title: 'Romería de la Fuensanta',
      description: 'Tradicional romería en honor a la Virgen de la Fuensanta, patrona de Córdoba. Procesión, carros engalanados y jornada de convivencia en el santuario.',
      date: new Date('2027-09-07T08:00:00Z'),
      location: 'Santuario de la Fuensanta',
      latitude: 37.9010,
      longitude: -4.7520,
      capacity: 3000,
      categoryId: categories[7].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1551176808-bb328dac763a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      price: 0,
    },
    {
      id: 13,
      title: 'Cata de Vinos de Montilla-Moriles',
      description: 'Descubre los vinos de la Denominación de Origen Montilla-Moriles. Cata guiada con maridaje de quesos y embutidos locales en una bodega centenaria.',
      date: new Date('2026-10-18T18:00:00Z'),
      location: 'Bodega Guzmán, Córdoba',
      latitude: 37.8870,
      longitude: -4.7790,
      capacity: 60,
      categoryId: categories[4].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
      price: 22,
    },
    {
      id: 14,
      title: 'Concierto de Música Andalusí',
      description: 'Recital de música andalusí y árabe-oriental en el incomparable marco de las Termas Romanas. Un viaje sonoro al Córdoba califal.',
      date: new Date('2026-08-22T21:30:00Z'),
      location: 'Termas Romanas de Santa María',
      latitude: 37.8795,
      longitude: -4.7785,
      capacity: 200,
      categoryId: categories[0].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76',
      price: 15,
    },
    {
      id: 15,
      title: 'Hackathon Córdoba Smart City',
      description: 'Maratón de programación de 48 horas para desarrollar soluciones tecnológicas que mejoren la vida en Córdoba. Premios para los mejores proyectos.',
      date: new Date('2026-10-03T09:00:00Z'),
      location: 'Parque Científico de Córdoba',
      latitude: 37.9150,
      longitude: -4.7200,
      capacity: 150,
      categoryId: categories[2].id,
      organizerId: organizerUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998',
      price: 0,
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