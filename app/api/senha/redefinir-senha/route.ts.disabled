// app/api/auth/redefinir-senha/route.ts
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { token, senha } = await req.json();

  const reset = await db.passwordReset.findUnique({ where: { token } });

  if (!reset || reset.expiresAt < new Date()) {
    return new Response('Token inválido', { status: 400 });
  }

  const hash = await bcrypt.hash(senha, 10);

  await db.user.update({
    where: { id: reset.userId },
    data: { password: hash },
  });

  await db.passwordReset.delete({ where: { token } });

  return Response.json({ ok: true });
}