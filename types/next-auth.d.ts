import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    institucion: string;
  }

  interface Session {
    user: {
      institucion: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    institucion?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    institucion?: string;
  }
}
