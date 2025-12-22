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
      bio: 'Administrador de la plataforma Eventos Córdoba. Apasionado por conectar personas a través de experiencias inolvidables.',
      location: 'Córdoba, Argentina',
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
      bio: 'Organizadora de eventos culturales y musicales en Córdoba. Creo experiencias que unen comunidades.',
      location: 'Córdoba, Argentina',
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
      bio: 'Amante de la música y los eventos culturales. Siempre buscando nuevas experiencias en Córdoba.',
      location: 'Córdoba, Argentina',
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
      bio: 'Fotógrafa y amante del arte. Me encanta asistir a exposiciones y eventos culturales.',
      location: 'Villa Carlos Paz, Argentina',
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
      bio: 'Organizador de eventos deportivos y tecnológicos. Creo comunidades activas.',
      location: 'Córdoba, Argentina',
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
        title: 'Festival de Música Córdoba 2025',
        description: 'El festival de música más importante de Córdoba con artistas nacionales e internacionales',
        date: new Date('2025-07-15T21:00:00Z'),
        location: 'Estadio Mario Alberto Kempes, Córdoba',
        latitude: -31.3696,
        longitude: -64.2414,
        capacity: 50000,
        price: 150.00,
        categoryId: categories[0].id, // Música
        organizerId: organizerUser.id,
        status: 'active',
        tags: ['festival', 'concierto', 'rock', 'pop', 'internacional'],
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
      },
    }),
    prisma.event.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: 'Maratón Córdoba Ciudad',
        description: 'Maratón anual de Córdoba con recorridos por los puntos más emblemáticos de la ciudad',
        date: new Date('2025-09-20T07:00:00Z'),
        location: 'Plaza San Martín, Córdoba',
        latitude: -31.4167,
        longitude: -64.1833,
        capacity: 10000,
        price: 50.00,
        categoryId: categories[1].id, // Deportes
        organizerId: organizer2.id,
        status: 'active',
        tags: ['maratón', 'running', 'deporte', 'salud', 'ciudad'],
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
      },
    }),
    prisma.event.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: 'Tech Conference Córdoba',
        description: 'Conferencia de tecnología con speakers internacionales y workshops prácticos',
        date: new Date('2025-11-10T09:00:00Z'),
        location: 'Centro Cultural Córdoba, Córdoba',
        latitude: -31.4201,
        longitude: -64.1888,
        capacity: 800,
        price: 80.00,
        categoryId: categories[2].id, // Tecnología
        organizerId: organizer2.id,
        status: 'active',
        tags: ['tecnología', 'conferencia', 'innovation', 'startup', 'programación'],
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
      },
    }),
    prisma.event.upsert({
      where: { id: 4 },
      update: {},
      create: {
        title: 'Feria del Libro Córdoba',
        description: 'Encuentro literario con autores locales e internacionales, presentaciones y talleres',
        date: new Date('2025-05-01T10:00:00Z'),
        location: 'Teatro del Libertador, Córdoba',
        latitude: -31.4135,
        longitude: -64.1811,
        capacity: 2000,
        price: 0.00, // Gratuito
        categoryId: categories[3].id, // Arte y Cultura
        organizerId: organizerUser.id,
        status: 'active',
        tags: ['libros', 'literatura', 'autores', 'cultura', 'gratuito'],
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop',
      },
    }),
    prisma.event.upsert({
      where: { id: 5 },
      update: {},
      create: {
        title: 'Festival Gastronómico Córdoba',
        description: 'Degustación de platos típicos cordobeses y food trucks con propuestas innovadoras',
        date: new Date('2025-12-15T12:00:00Z'),
        location: 'Parque Sarmiento, Córdoba',
        latitude: -31.4278,
        longitude: -64.1931,
        capacity: 3000,
        price: 25.00,
        categoryId: categories[4].id, // Gastronomía
        organizerId: organizerUser.id,
        status: 'active',
        tags: ['gastronomía', 'comida', 'food trucks', 'degustación', 'cordobés'],
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop',
      },
    }),
    // Eventos adicionales para más diversidad
    prisma.event.upsert({
      where: { id: 6 },
      update: {},
      create: {
        title: 'Taller de Fotografía Urbana',
        description: 'Aprende técnicas de fotografía callejera con un fotógrafo profesional',
        date: new Date('2026-03-15T14:00:00Z'),
        location: 'Centro Histórico, Córdoba',
        latitude: -31.4135,
        longitude: -64.1811,
        capacity: 20,
        price: 30.00,
        categoryId: categories[3].id, // Arte y Cultura
        organizerId: organizerUser.id,
        status: 'active',
        tags: ['fotografía', 'taller', 'urbano', 'aprendizaje', 'creativo'],
      },
    }),
    prisma.event.upsert({
      where: { id: 7 },
      update: {},
      create: {
        title: 'Meetup React Córdoba',
        description: 'Encuentro mensual de desarrolladores React. Networking y charlas técnicas.',
        date: new Date('2026-04-10T18:30:00Z'),
        location: 'Coworking Córdoba, Córdoba',
        latitude: -31.4194,
        longitude: -64.1889,
        capacity: 50,
        price: 0.00,
        categoryId: categories[2].id, // Tecnología
        organizerId: organizer2.id,
        status: 'active',
        tags: ['react', 'javascript', 'meetup', 'networking', 'desarrollo'],
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
