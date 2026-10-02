import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import EntraIdProvider from "next-auth/providers/microsoft-entra-id";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const isDevAuthEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_AUTH === "true";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      id: "production-credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.active || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            active: user.active
          };
        } catch (e) {
          console.error("Credentials error", e);
          return null;
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET && process.env.MICROSOFT_TENANT_ID ? [
      EntraIdProvider({
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0`,
      })
    ] : []),
    ...(isDevAuthEnabled ? [
      CredentialsProvider({
        name: "Stub",
        credentials: {
          email: { label: "Email", type: "email" },
        },
        async authorize(credentials) {
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials" || account?.provider === "production-credentials") {
        return true;
      }
      // For Google/Entra ID, verify against database
      if (!user.email) return false;
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        if (dbUser && dbUser.active) {
          (user as any).role = dbUser.role;
          (user as any).active = dbUser.active;
          return true;
        }
      } catch (e) {
        console.error("Auth DB Error", e);
      }
      // If user doesn't exist or is not active, deny access
      return "/login?error=AccessDenied";
    },
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
      
      const isPublicPath = 
        nextUrl.pathname === "/login" || 
        nextUrl.pathname === "/set-password" ||
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname.startsWith("/api/health") ||
        nextUrl.pathname.startsWith("/api/cron");
      
      if (!isPublicPath) {
        if (!isLoggedIn) return false;
        if (!isActive) return false;
      }
      
      if (nextUrl.pathname === "/login" && isLoggedIn && isActive) {
        return Response.redirect(new URL("/", nextUrl));
      }
      
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
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
