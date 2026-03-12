import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("CREDENTIALS:", credentials);
        if (!credentials?.email || !credentials?.password){
          console.log("❌ Email ou senha não vieram");
          return null;
        }

        const [rows]: any = await db.query(`
          SELECT u.*, e.nome AS empresa_nome
          FROM usuarios u
          JOIN empresas e ON e.id = u.empresa_id
          WHERE u.email = ?
          LIMIT 1
        `, [credentials.email]);

        console.log("USUÁRIO DO BANCO:", rows);

        const usuario = rows[0];
        if (!usuario) {
          console.log("❌ Usuário não encontrado");
          return null;
        }

        const senhaValida = await bcrypt.compare(
          credentials.password,
          usuario.senha_hash
        );

        console.log("SENHA VÁLIDA?", senhaValida);

        if (!senhaValida){
          console.log("❌ Senha inválida");
          return null;
        } 

        if (usuario.ativo !== 1) {
          console.log("❌ Usuário inativo");
          return null;
        }

        return {
          id: usuario.id.toString(),
          name: usuario.nome,
          email: usuario.email,
          phone: usuario.telefone,
          role: usuario.role as "admin" | "atendente" | "cliente",
          empresa_id: usuario.empresa_id,
          empresa_nome: usuario.empresa_nome,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.empresa_id = (user as any).empresa_id;
        token.empresa_nome = (user as any).empresa_nome;
        token.name = user.name;
        token.email = user.email;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as any;
      session.user.empresa_id = token.empresa_id as number;
      session.user.empresa_nome = token.empresa_nome as string;
      session.user.name && (session.user.name = token.name as string);
      session.user.email = token.email as string;
      session.user.phone = token.phone as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };