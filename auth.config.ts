import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CognitoProvider from "next-auth/providers/cognito";
import { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function CustomPrismaAdapter(p: PrismaClient): Adapter {
  const origin = PrismaAdapter(p);
  return {
    ...origin,
    deleteSession: async (sessionToken: string) => {
      try {
        return await p.session.delete({ where: { sessionToken } });
      } catch (e) {
        console.error("Failed to delete session", e);
        return null;
      }
    },
  } as Adapter;
}

export const OPTIONS: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 30000, // Set this value higher than 3500ms (e.g., 10000ms)
      },
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CognitoProvider({
      clientId: process.env.AUTH_COGNITO_ID as string,
      clientSecret: process.env.AUTH_COGNITO_SECRET as string,
      issuer: process.env.AUTH_COGNITO_ISSUER,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.emailVerified = user.emailVerified;
        token.name = user.name;
        token.role = user.role;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
        token.image = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      // Fetch the latest user data from the database using Prisma
      const user = await prisma.user.findUnique({
        where: { id: token.id },
      });

      // If the user exists in the database, update the session object
      if (user) {
        session.user.id = user.id; // Assume user.id is always a string
        session.user.email = user.email ?? ''; // Default to empty string if null
        session.user.emailVerified = user.emailVerified ?? null; // Handle null explicitly
        session.user.name = user.name ?? ''; // Default to empty string if null
        session.user.role = user.role ?? ''; // Default to empty string if null
        session.user.createdAt = user.createdAt; // Handle according to your needs
        session.user.updatedAt = user.updatedAt; // Handle according to your needs
        session.user.image = user.image ?? ''; // Default to empty string if null
      }

      return session;
    },
  },
};

export const authOptions = OPTIONS;