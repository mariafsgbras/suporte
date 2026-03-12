import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      role: "admin" | "atendente" | "cliente";
      empresa_id: number;
      empresa_nome?: string;
    };
  }

  interface User {
    phone?: string | null;
    empresa_nome?: string;
    role: "admin" | "atendente" | "cliente";
    empresa_id: number;
  }
}