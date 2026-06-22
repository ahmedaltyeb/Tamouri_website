import type { NextAuthConfig, DefaultSession } from "next-auth";

// ── Type augmentation (shared) ────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: { role: string } & DefaultSession["user"];
  }
  interface User {
    role?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
  }
}

// ── Edge-compatible config (no Node.js imports) ───────────────────────────────
// Used by middleware. Providers are intentionally empty here — they are added
// in auth.ts which runs only in the Node.js runtime.

const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    session({ session, token }) {
      session.user.role = (token.role as string) ?? "";
      return session;
    },
  },
  providers: [],
  session: { strategy: "jwt" },
};

export default authConfig;
