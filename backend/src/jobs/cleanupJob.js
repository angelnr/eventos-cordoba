const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function startCleanupJob() {
  const INTERVAL_MS = 24 * 60 * 60 * 1000;

  setTimeout(runCleanup, 5 * 60 * 1000);

  setInterval(runCleanup, INTERVAL_MS);

  console.log('[CleanupJob] Job de limpieza iniciado (cada 24 horas)');
}

async function runCleanup() {
  try {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const deletedRead = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: ninetyDaysAgo }
      }
    });

    const deletedUnread = await prisma.notification.deleteMany({
      where: {
        isRead: false,
        createdAt: { lt: oneEightyDaysAgo }
      }
    });

    console.log(`[CleanupJob] Eliminadas: ${deletedRead.count} le\u00eddas (>90d), ${deletedUnread.count} no le\u00eddas (>180d)`);
  } catch (error) {
    console.error('[CleanupJob] Error:', error);
  }
}

module.exports = { startCleanupJob };
