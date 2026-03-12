import { UserRole } from "@/types/role";

export const ROLE_PERMISSIONS = {
  admin: {
    chamados: true,
    chamadosTodos: true,
    novoChamado: true,
    wiki: true,
    usuarios: true,
    empresas: true,
    dashboard: true,
    relatorios: true,
  },
  atendente: {
    chamados: true,
    chamadosTodos: true,
    novoChamado: true,
    wiki: true,
    usuarios: true,
    empresas: true,
    dashboard: true,
    relatorios: false,
  },
  cliente: {
    chamados: true,
    chamadosTodos: false,
    novoChamado: true,
    wiki: true,
    usuarios: false,
    empresas: false,
    dashboard: false,
    relatorios: false,
  },
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS.admin;

export function hasPermission(role: UserRole, permission: Permission) {
  return ROLE_PERMISSIONS[role][permission];
}