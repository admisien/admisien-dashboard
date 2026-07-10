import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { fetchUsuarios } from "@/lib/data/fetchUsuarios";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        // Fase 3: valida el email contra la pestaña "Usuarios" (email -> institución).
        // La pestaña todavía no tiene columna de contraseña, así que cualquier
        // password no vacío pasa mientras el email exista — pendiente definir
        // si el hash de password vive en el Sheet o se migra a otro proveedor.
        const usuarios = await fetchUsuarios();
        const match = usuarios.find((u) => u.email === String(email).trim().toLowerCase());
        if (!match) return null;

        return {
          id: match.email,
          email: match.email,
          institucion: match.institucion,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.institucion = user.institucion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.institucion) {
        session.user.institucion = token.institucion;
      }
      return session;
    },
  },
});
