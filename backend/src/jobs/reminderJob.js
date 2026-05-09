const { PrismaClient } = require('@prisma/client');
const { createNotificationForUsers } = require('../services/notificationService');

const prisma = new PrismaClient();

function startReminderJob() {
  const INTERVAL_MS = 60 * 60 * 1000;

  setTimeout(runReminders, 30_000);

  setInterval(runReminders, INTERVAL_MS);

  console.log('[ReminderJob] Job de recordatorios iniciado (cada 60 minutos)');
}

async function runReminders() {
  try {
    const now = new Date();

    const eventsIn24h = await prisma.event.findMany({
      where: {
        status: 'active',
        date: {
          gte: new Date(now.getTime() + 23 * 60 * 60 * 1000),
          lte: new Date(now.getTime() + 25 * 60 * 60 * 1000)
        }
      },
      select: { id: true, title: true, date: true }
    });

    const eventsIn2h = await prisma.event.findMany({
      where: {
        status: 'active',
        date: {
          gte: new Date(now.getTime() + 1.5 * 60 * 60 * 1000),
          lte: new Date(now.getTime() + 2.5 * 60 * 60 * 1000)
        }
      },
      select: { id: true, title: true, date: true }
    });

    let totalReminders = 0;

    for (const event of eventsIn24h) {
      const count = await createRemindersForEvent(event, '24h');
      totalReminders += count;
    }

    for (const event of eventsIn2h) {
      const count = await createRemindersForEvent(event, '2h');
      totalReminders += count;
    }

    console.log(`[ReminderJob] ${totalReminders} recordatorios enviados (${eventsIn24h.length} eventos 24h, ${eventsIn2h.length} eventos 2h)`);
  } catch (error) {
    console.error('[ReminderJob] Error:', error);
  }
}

async function createRemindersForEvent(event, timeframe) {
  const link = `/events/${event.id}?reminder=${timeframe}`;

  const existingReminders = await prisma.notification.findMany({
    where: { eventId: event.id, type: 'EVENT_REMINDER', link: link },
    select: { userId: true }
  });
  const alreadyNotifiedUserIds = new Set(existingReminders.map(n => n.userId));

  const bookings = await prisma.booking.findMany({
    where: {
      eventId: event.id,
      status: { not: 'cancelled' },
      userId: { notIn: [...alreadyNotifiedUserIds] }
    },
    select: { userId: true }
  });

  const userIds = [...new Set(bookings.map(b => b.userId))];
  if (userIds.length === 0) return 0;

  const formattedDate = event.date.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });

  const titles = { '24h': 'Recordatorio: evento ma\u00f1ana', '2h': 'Recordatorio: evento pronto' };
  const messages = {
    '24h': `El evento "${event.title}" es ma\u00f1ana (${formattedDate}).`,
    '2h': `El evento "${event.title}" comienza pronto (${formattedDate}).`
  };

  await createNotificationForUsers(userIds, {
    type: 'EVENT_REMINDER',
    title: titles[timeframe],
    message: messages[timeframe],
    eventId: event.id,
    link: link
  });

  return userIds.length;
}

module.exports = { startReminderJob };
