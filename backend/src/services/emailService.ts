import { Resend } from 'resend';

const FROM_EMAIL = 'Eventos Córdoba <noreply@eventoscordoba.xyz>';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  RESEND_API_KEY no configurada. Los correos de verificación no se enviarán.');
      return null;
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export async function sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn(`⚠️  Verificación no enviada a ${to}: RESEND_API_KEY no configurada`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Verifica tu cuenta en Eventos Córdoba',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Bienvenido a Eventos Córdoba, tu plataforma de confianza!</h2>
        <p>Confirma tu dirección de email haciendo clic en el siguiente enlace y empieza a disfrutar de nuestros servicios:</p>
        <a href="${verificationUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Verificar mi email
        </a>
        <p style="color: #64748b; font-size: 14px;">
          Este enlace expira en 24 horas. Si no creaste una cuenta, ignora este correo.
        </p>
      </div>
    `,
  });
}
