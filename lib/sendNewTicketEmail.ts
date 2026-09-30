// lib/sendNewTicketEmail.ts

import { transporter } from "./email";
import { newTicketTemplate } from "./emailTemplates";

async function sendWithRetry(mailOptions: any, maxRetries = 3) {
  let lastError;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`E-mail enviado na tentativa ${i}`);
      return;
    } catch (err) {
      lastError = err;
      console.error(`Tentativa ${i} falhou`, err);

      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  console.error("Não foi possível enviar o e-mail.", lastError);
}

export async function sendNewTicketEmail(data: {
  emails: string[];
  chamadoId: number;
  empresa: string;
  solicitante: string;
  telefone: string;
  email: string;
  produto: string;
  descricao: string;
  prioridade: boolean;
  data: Date | string;
}) {
    await sendWithRetry({
        from: 'no-reply@sgbras.com',
        to: data.emails.join(','),
        subject: `🔴 HOT-LINE | Chamado #${data.chamadoId}`,
        html: newTicketTemplate({
            id: data.chamadoId,
            empresa: data.empresa,
            solicitante: data.solicitante,
            telefone: data.telefone,
            email: data.email,
            produto: data.produto,
            descricao: data.descricao,
            prioridade: data.prioridade,
            data: data.data,
            url: `${process.env.APP_URL}/chamados/${data.chamadoId}`
        }),
    });
}