import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function startCleanupJob(): void {
  const INTERVAL_MS = 24 * 60 * 60 * 1000;

  setTimeout(runCleanup, 5 * 60 * 1000);

  setInterval(runCleanup, INTERVAL_MS);

  console.log('[CleanupJob] Job de limpieza iniciado (cada 24 horas)');
}

async function runCleanup(): Promise<void> {
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

    console.log(`[CleanupJob] Eliminadas: ${deletedRead.count} leídas (>90d), ${deletedUnread.count} no leídas (>180d)`);
  } catch (error) {
    console.error('[CleanupJob] Error:', error);
  }
}
