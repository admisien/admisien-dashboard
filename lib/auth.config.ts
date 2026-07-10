import type { NextAuthConfig } from "next-auth";

// Config "edge-safe": sin providers ni nada que dependa de googleapis (Node-only).
// El middleware corre en el Edge runtime, así que solo puede importar esto —
// no lib/auth.ts, que sí trae el Credentials provider con fetchUsuarios().
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard) return isLoggedIn;
      return true;
    },
  },
  providers: [],
};
