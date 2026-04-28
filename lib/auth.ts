import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  pages: {
    signIn: "/ka/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials.email?.toString().trim().toLowerCase();
        const password = credentials.password?.toString();

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
          isActive: user.isActive,
          companyId: user.companyId,
          companyName: user.company.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role ?? "USER";
        token.isActive = (user as { isActive?: boolean }).isActive ?? true;
        token.companyId = (user as { companyId?: number }).companyId;
        token.companyName = (user as { companyName?: string }).companyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as UserRole | undefined) ?? "USER";
        session.user.isActive = (token.isActive as boolean | undefined) ?? true;
        session.user.companyId = Number(token.companyId ?? 0);
        session.user.companyName = String(token.companyName ?? "");
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
