// app/api/auth/esqueci-senha/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();

  // 1. buscar usuário
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // resposta genérica (segurança)
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await db.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: expires,
    },
  });

  // enviar email aqui
  // link: /redefinir-senha?token=${token}

  return NextResponse.json({ ok: true });
}
