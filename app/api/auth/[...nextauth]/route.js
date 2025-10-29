import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    // ✅ Google Sign-In
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ✅ Manual Email/Password Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found with this email");

        if (!user.password) {
          throw new Error("Please sign in using Google.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],

  callbacks: {
    // ✅ Handle JWT
    async jwt({ token, user, account, profile }) {
      // When logging in with Google
      if (account?.provider === "google") {
        await connectToDatabase();

        // Check if user exists
        let existingUser = await User.findOne({ email: profile.email });

        // If not, create one
        if (!existingUser) {
          existingUser = await User.create({
            name: profile.name || "Unnamed User",
            email: profile.email,
            password: null, // Google users don't have passwords
          });
          console.log("🟢 New Google user created:", existingUser.email);
        }

        token.id = existingUser._id.toString();
        token.name = existingUser.name;
        token.email = existingUser.email;
      }

      // When using credentials login
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },

    // ✅ Handle Session
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
