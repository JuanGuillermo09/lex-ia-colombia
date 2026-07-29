import nodemailer from 'nodemailer';
import { config } from '../../config';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(to: string, code: string): Promise<boolean> {
  if (config.smtp.host) {
    const t = getTransporter();
    await t.sendMail({
      from: config.smtp.from,
      to,
      subject: 'LexIA Colombia - Código de restablecimiento de contraseña',
      html: `
        <h2>Restablecimiento de contraseña</h2>
        <p>Has solicitado restablecer tu contraseña en LexIA Colombia.</p>
        <p>Tu código de verificación es:</p>
        <h1 style="font-size:32px;letter-spacing:4px;background:#f5f5f5;padding:16px;text-align:center;border-radius:8px;">${code}</h1>
        <p>Este código expira en 5 minutos.</p>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      `,
    });
    return true;
  }
  console.log(`\n[EMAIL] Código de restablecimiento para ${to}: ${code}\n`);
  return false;
}
