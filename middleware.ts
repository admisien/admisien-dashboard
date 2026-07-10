import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Usa la config edge-safe (sin Credentials provider ni googleapis), no lib/auth.ts.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
