import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email, isActive: true }).select("+password");
        if (!user) return null;
        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) return null;
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          employeeId: user.employeeId,
          district: user.district?.toString(),
          mandal: user.mandal?.toString(),
          venue: user.venue?.toString(),
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.employeeId = (user as any).employeeId;
        token.district = (user as any).district;
        token.mandal = (user as any).mandal;
        token.venue = (user as any).venue;
        token.avatar = (user as any).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        (session.user as any).role = token.role;
        (session.user as any).employeeId = token.employeeId;
        (session.user as any).district = token.district;
        (session.user as any).mandal = token.mandal;
        (session.user as any).venue = token.venue;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
