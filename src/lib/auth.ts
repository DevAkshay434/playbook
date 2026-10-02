import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const isDevAuthEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_AUTH === "true";

export const authConfig: NextAuthConfig = {
  providers: [
    ...(isDevAuthEnabled ? [
      CredentialsProvider({
        name: "Stub",
        credentials: {
          email: { label: "Email", type: "email" },
        },
        async authorize(credentials) {
          // MOCK AUTHENTICATION for Phase 2 before provider selection
          // MUST NOT BE USED IN PRODUCTION
          if (credentials?.email === "admin@softprowatersystems.com") {
            return { id: "1", name: "Admin User", email: "admin@softprowatersystems.com", role: "ADMIN", active: true };
          }
          if (credentials?.email === "manager@softprowatersystems.com") {
            return { id: "2", name: "Manager User", email: "manager@softprowatersystems.com", role: "MANAGER", active: true };
          }
          if (credentials?.email === "agent@softprowatersystems.com") {
            return { id: "3", name: "Agent User", email: "agent@softprowatersystems.com", role: "AGENT", active: true };
          }
          return null;
        },
      })
    ] : []),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.active = (user as any).active;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).active = token.active;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isActive = (auth?.user as any)?.active === true;
      
      const isPublicPath = nextUrl.pathname === "/login" || nextUrl.pathname.startsWith("/api/auth");
      
      if (!isPublicPath) {
        if (!isLoggedIn) return false;
        if (!isActive) return false;
      }
      
      if (isPublicPath && isLoggedIn && isActive) {
        return Response.redirect(new URL("/", nextUrl));
      }
      
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Centralized Role Checkers
export function isAgent(role?: string) {
  return role === "AGENT" || role === "MANAGER" || role === "ADMIN";
}

export function isManager(role?: string) {
  return role === "MANAGER" || role === "ADMIN";
}

export function isAdmin(role?: string) {
  return role === "ADMIN";
}
