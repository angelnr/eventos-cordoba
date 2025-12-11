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
      role: 'admin',
    },
  });

  const organizerUser = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      email: 'organizer@example.com',
      password: await bcrypt.hash('organizer123', 10),
      name: 'Event Organizer',
      role: 'organizer',
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Regular User',
      role: 'user',
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
        capacity: 50000,
        price: 150.00,
        categoryId: categories[0].id, // Música
        organizerId: organizerUser.id,
        status: 'active',
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
        capacity: 10000,
        price: 50.00,
        categoryId: categories[1].id, // Deportes
        organizerId: organizerUser.id,
        status: 'active',
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
        capacity: 800,
        price: 80.00,
        categoryId: categories[2].id, // Tecnología
        organizerId: organizerUser.id,
        status: 'active',
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
        capacity: 2000,
        price: 0.00, // Gratuito
        categoryId: categories[3].id, // Arte y Cultura
        organizerId: organizerUser.id,
        status: 'active',
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
        capacity: 3000,
        price: 25.00,
        categoryId: categories[4].id, // Gastronomía
        organizerId: organizerUser.id,
        status: 'active',
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
