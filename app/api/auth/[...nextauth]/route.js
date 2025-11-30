import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    // GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    // CREDENTIAL LOGIN
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();

        const email = credentials.email.toLowerCase();
        const user = await User.findOne({ email });

        if (!user) throw new Error("User not found");
        if (!user.password) throw new Error("Use Google login");

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          email,
          name: user.name,
        };
      },
    }),
  ],

  callbacks: {
    // 🔥 JWT CALLBACK (App Router correct signature)
    async jwt({ token, user, account, trigger, profile }) {
      await connectToDatabase();

      /* -----------------------
         🔵 GOOGLE SIGN-IN
      ------------------------ */
      if (trigger === "signIn" && account?.provider === "google") {
        const email = profile.email.toLowerCase();

        let existingUser = await User.findOne({ email });

        if (!existingUser) {
          existingUser = await User.create({
            name: profile.name,
            email,
            password: null,
            role: "USER",
          });
        }

        token.id = existingUser._id.toString();
        token.email = existingUser.email;
        token.name = existingUser.name;
        token.role = existingUser.role;

        console.log("GOOGLE LOGIN ROLE:", token.role);
        return token;
      }

      // Track login timestamp
      if (trigger === "signIn") {
        await User.findByIdAndUpdate(token.id, { lastLogin: new Date() });
      }


      /* ------------------------------
         🔵 CREDENTIALS LOGIN (normal)
      ------------------------------ */
      if (user) {
        const dbUser = await User.findById(user.id);

        token.id = dbUser._id.toString();
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.role = dbUser.role;

        return token;
      }

      return token;
    },

    // SESSION CALLBACK
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.role = token.role;
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
