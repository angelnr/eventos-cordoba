const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Crear usuarios de ejemplo
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Administrador de la plataforma Eventos Córdoba. Apasionado por conectar personas a través de experiencias inolvidables en la ciudad de la Mezquita.',
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
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      bio: 'Organizadora de eventos culturales y musicales en Córdoba. Creo experiencias que unen comunidades en la ciudad califal.',
      location: 'Córdoba, España',
      interests: ['Música', 'Arte', 'Eventos', 'Gastronomía'],
      role: 'organizer',
      isVerified: true,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Carlos Rodríguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Amante de la música y los eventos culturales. Siempre buscando nuevas experiencias en Córdoba, la ciudad de las tres culturas.',
      location: 'Córdoba, España',
      interests: ['Música', 'Deportes', 'Tecnología', 'Arte'],
      role: 'user',
      isVerified: false,
    },
  });

  // Crear usuarios adicionales para diversidad
  const user2 = await prisma.user.upsert({
    where: { email: 'ana@example.com' },
    update: {},
    create: {
      email: 'ana@example.com',
      password: await bcrypt.hash('user123', 10),
      name: 'Ana López',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Fotógrafa y amante del arte. Me encanta asistir a exposiciones y eventos culturales en la ciudad de la Mezquita.',
      location: 'Córdoba, España',
      interests: ['Arte', 'Fotografía', 'Cultura', 'Gastronomía'],
      role: 'user',
      isVerified: true,
    },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: 'juan@example.com' },
    update: {},
    create: {
      email: 'juan@example.com',
      password: await bcrypt.hash('organizer123', 10),
      name: 'Juan Martínez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      bio: 'Organizador de eventos deportivos y tecnológicos. Creo comunidades activas en Córdoba.',
      location: 'Córdoba, España',
      interests: ['Deportes', 'Tecnología', 'Innovación'],
      role: 'organizer',
      isVerified: true,
    },
  });

  // Crear categorías de ejemplo
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Música' },
      update: {},
      create: {
        name: 'Música',
        description: 'Conciertos, festivales y eventos musicales',
        color: '#8B5CF6',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Deportes' },
      update: {},
      create: {
        name: 'Deportes',
        description: 'Eventos deportivos y competiciones',
        color: '#10B981',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Tecnología' },
      update: {},
      create: {
        name: 'Tecnología',
        description: 'Conferencias tech, meetups y workshops',
        color: '#3B82F6',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Arte y Cultura' },
      update: {},
      create: {
        name: 'Arte y Cultura',
        description: 'Exposiciones, teatro y eventos culturales',
        color: '#F59E0B',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Gastronomía' },
      update: {},
      create: {
        name: 'Gastronomía',
        description: 'Ferias gastronómicas y eventos culinarios',
        color: '#EF4444',
      },
    }),
  ]);

  // Crear eventos de ejemplo
  const events = await Promise.all([
    prisma.event.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: 'Festival Flamenco Córdoba',
        description: 'Festival internacional de flamenco con artistas de renombre en el corazón de la ciudad califal',
        date: new Date('2026-07-15T21:00:00Z'),
        location: 'Patio de los Naranjos, Mezquita-Catedral',
        latitude: 37.8786,
        longitude: -4.7794,
        capacity: 2000,
        price: 45.00,
        categoryId: categories[0].id, // Música
        organizerId: organizerUser.id,
        status: 'active',
        tags: ['flamenco', 'música', 'cultura', 'español', 'internacional'],
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
      },
    }),
    prisma.event.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: 'Media Maratón Córdoba Patrimonio',
        description: 'Media maratón por el centro histórico de Córdoba, pasando por la Mezquita y la Alcazaba',
        date: new Date('2026-04-20T08:00:00Z'),
        location: 'Puente Romano, Córdoba',
        latitude: 37.8746,
        longitude: -4.7778,
        capacity: 3000,
        price: 25.00,
        categoryId: categories[1].id, // Deportes
        organizerId: organizer2.id,
        status: 'active',
        tags: ['maratón', 'running', 'deporte', 'patrimonio', 'ciudad'],
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
      },
    }),
    prisma.event.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: 'Congreso de Innovación Digital Córdoba',
        description: 'Conferencia sobre transformación digital con expertos españoles y europeos',
        date: new Date('2026-11-10T09:00:00Z'),
        location: 'Palacio de Congresos, Córdoba',
        latitude: 37.8916,
        longitude: -4.7778,
        capacity: 600,
        price: 120.00,
        categoryId: categories[2].id, // Tecnología
        organizerId: organizer2.id,
        status: 'active',
        tags: ['tecnología', 'innovación', 'digital', 'conferencia', 'startups'],
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
      },
    }),
    prisma.event.upsert({
      where: { id: 4 },
      update: {},
      create: {
        title: 'Festival de las Tres Culturas',
        description: 'Celebración de la convivencia histórica de cristianos, judíos y musulmanes en Córdoba',
        date: new Date('2026-06-20T18:00:00Z'),
        location: 'Sinagoga, Judería de Córdoba',
        latitude: 37.8792,
        longitude: -4.7828,
        capacity: 500,
        price: 15.00,
        categoryId: categories[3].id, // Arte y Cultura
        organizerId: organizerUser.id,
        status: 'active',
        tags: ['cultura', 'historia', 'tres culturas', 'judería', 'patrimonio'],
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop',
      },
    }),
    prisma.event.upsert({
      where: { id: 5 },
      update: {},
      create: {
        title: 'Feria Gastronómica Andalusí',
        description: 'Degustación de la gastronomía andalusí tradicional y fusión contemporánea',
        date: new Date('2026-09-15T12:00:00Z'),
        location: 'Plaza de la Corredera, Córdoba',
        latitude: 37.8804,
        longitude: -4.7778,
        capacity: 2000,
        price: 35.00,
        categoryId: categories[4].id, // Gastronomía
        organizerId: organizerUser.id,
        status: 'active',
        tags: ['gastronomía', 'andalusí', 'degustación', 'tradicional', 'fusiones'],
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop',
      },
    }),
    // Eventos adicionales para más diversidad
    prisma.event.upsert({
      where: { id: 6 },
      update: {},
      create: {
        title: 'Taller de Fotografía en la Judería',
        description: 'Aprende técnicas de fotografía nocturna en el barrio judío más antiguo de Europa',
        date: new Date('2026-05-15T20:00:00Z'),
        location: 'Barrio de la Judería, Córdoba',
        latitude: 37.8792,
        longitude: -4.7828,
        capacity: 15,
        price: 40.00,
        categoryId: categories[3].id, // Arte y Cultura
        organizerId: organizerUser.id,
        status: 'active',
        tags: ['fotografía', 'judería', 'nocturna', 'histórica', 'taller'],
      },
    }),
    prisma.event.upsert({
      where: { id: 7 },
      update: {},
      create: {
        title: 'Hackathon Córdoba Startup',
        description: 'Evento de 48 horas para desarrollar soluciones innovadoras en el ecosistema andaluz',
        date: new Date('2026-10-08T09:00:00Z'),
        location: 'Centro de Innovación, Córdoba',
        latitude: 37.8882,
        longitude: -4.7794,
        capacity: 100,
        price: 0.00,
        categoryId: categories[2].id, // Tecnología
        organizerId: organizer2.id,
        status: 'active',
        tags: ['hackathon', 'startups', 'innovación', 'desarrollo', 'andalucía'],
      },
    }),
  ]);

  console.log('✅ Database seeded successfully');
  console.log('Users created:');
  console.log('- Admin: admin@example.com / admin123 (role: admin)');
  console.log('- Organizer: organizer@example.com / organizer123 (role: organizer)');
  console.log('- User: user@example.com / user123 (role: user)');
  console.log('');
  console.log('Categories created:');
  categories.forEach(cat => console.log(`- ${cat.name}: ${cat.description}`));
  console.log('');
  console.log('Events created:');
  events.forEach(event => console.log(`- ${event.title} (${event.date.toDateString()})`));
  console.log('');
  console.log('Use these credentials to test the API');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
