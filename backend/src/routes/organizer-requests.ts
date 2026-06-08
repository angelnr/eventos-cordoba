import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { sendOrganizerRequestEmail } from '../services/emailService';
import rateLimit from 'express-rate-limit';

const router = Router();
const prisma = new PrismaClient();

const organizerRequestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Solo puedes enviar una solicitud cada minuto.' }
});

router.post('/', requireAuth, organizerRequestLimiter, async (req, res) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, organizerRequestSent: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    if (user.role !== 'user') {
      return res.status(400).json({ success: false, error: 'Ya tienes permisos de organizador o de administrador.' });
    }

    if (user.organizerRequestSent) {
      return res.status(400).json({ success: false, error: 'Ya has enviado una solicitud anteriormente.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { organizerRequestSent: true },
    });

    await sendOrganizerRequestEmail(user.name, user.email, user.id);

    return res.status(200).json({ success: true, message: 'Solicitud enviada correctamente.' });
  } catch (error: any) {
    console.error('Error en POST /api/organizer-requests:', error);
    return res.status(500).json({ success: false, error: 'Error al procesar la solicitud.' });
  }
});

export default router;
