import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // CREDENTIAL LOGIN (Now handling our OTP flow)
    CredentialsProvider({
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        await connectToDatabase();

        const phone = credentials.phone;
        let user = await User.findOne({ phone });

        if (!user) {
          // If no user exists, create one silently on successful OTP verify
          user = await User.create({
            phone,
            phoneVerified: true,
            isGuest: false,
            role: "USER"
          });
        }

        return {
          id: user._id.toString(),
          phone: user.phone,
          name: user.name || "User",
          role: user.role || "USER",
        };
      },
    }),
  ],

  callbacks: {
    // SIGNIN CALLBACK (Google Auth Checks)
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        // Enforce that only users with the ADMIN role can login via Google
        const dbUser = await User.findOne({ email: user.email, role: "ADMIN" });
        if (!dbUser) {
          return "/admin/login?error=AccessDenied"; // Bounce unauthorized google logins
        }
        return true;
      }
      return true; // Pass through OTP
    },

    // JWT CALLBACK (Token building)
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: user.email, role: "ADMIN" });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.phone = dbUser.phone || "";
          token.name = dbUser.name || user.name;
          token.role = dbUser.role;
        }
      } else if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },

    // SESSION CALLBACK (set session variables)
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.phone = token.phone;
      session.user.name = token.name;
      session.user.role = token.role;
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
