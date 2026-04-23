import type { NextAuthConfig } from "next-auth";

const isTrustHostEnabled =
  process.env.AUTH_TRUST_HOST === "true" || process.env.NEXTAUTH_TRUST_HOST === "true";

export const authConfig = {
  trustHost: isTrustHostEnabled,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "user" | "admin" | undefined) ?? "user";
      }
      return session;
    }
  },
  providers: []
} satisfies NextAuthConfig;
