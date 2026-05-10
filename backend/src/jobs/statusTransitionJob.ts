import { autoFinishPastEvents } from '../services/eventStatusService';

export function startStatusTransitionJob(): void {
  const INTERVAL_MS = 5 * 60 * 1000;

  setTimeout(async () => {
    try {
      const result = await autoFinishPastEvents();
      if (result.count > 0) {
        console.log(`[StatusJob] ${result.count} eventos transicionados a FINISHED`);
      }
    } catch (error) {
      console.error('[StatusJob] Error en ejecución inicial:', error);
    }
  }, 60_000);

  setInterval(async () => {
    try {
      const result = await autoFinishPastEvents();
      if (result.count > 0) {
        console.log(`[StatusJob] ${result.count} eventos transicionados a FINISHED`);
      }
    } catch (error) {
      console.error('[StatusJob] Error:', error);
    }
  }, INTERVAL_MS);

  console.log('[StatusJob] Job de transición de estados iniciado (cada 5 minutos)');
}
