import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const RESTRITAS = [
  '/empresas',
  '/usuarios',
  '/dashboards',
  '/relatorios',
  '/api/empresas',
  '/api/usuarios',
  '/api/dashboards',
  '/api/relatorios',
  '/api/filtros'
];

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    const restrita = RESTRITAS.some(p => path === p || path.startsWith(p + '/'));

    if (restrita && role === 'cliente') {
      if (path.startsWith('/api')) {
        return NextResponse.json({ message: 'Sem permissão' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: [
    '/chamados/:path*',
    '/empresas/:path*',
    '/usuarios/:path*',
    '/dashboards/:path*',
    '/relatorios/:path*',
    '/api/empresas/:path*',
    '/api/usuarios/:path*',
    '/api/dashboards/:path*',
    '/api/relatorios/:path*',
    '/api/filtros/:path*'
  ],
};