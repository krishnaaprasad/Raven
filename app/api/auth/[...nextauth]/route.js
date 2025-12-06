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
    // JWT CALLBACK (Token building)
    async jwt({ token, user, account, trigger, profile }) {
      await connectToDatabase();

      /* -----------------------
         🔵 GOOGLE SIGN-IN
      ------------------------ */
      if (trigger === "signIn" && account?.provider === "google") {
        const email = profile.email.toLowerCase();

        let existingUser = await User.findOne({ email });

        if (existingUser) {
          // If existing guest → upgrade to registered
          if (existingUser.isGuest === true) {
            existingUser.isGuest = false;
            existingUser.name = profile.name || existingUser.name;
            existingUser.lastLogin = new Date();
            await existingUser.save();
          }

          token.id = existingUser._id.toString();
          token.email = existingUser.email;
          token.name = existingUser.name;
          token.role = existingUser.role;
          return token;
        }

        // If no user exists → create full Google user
        const newUser = await User.create({
          name: profile.name,
          email,
          password: null,
          isGuest: false,
          role: "USER",
          lastLogin: new Date(),
        });

        token.id = newUser._id.toString();
        token.email = newUser.email;
        token.name = newUser.name;
        token.role = newUser.role;
        return token;
      }

      // NORMAL CREDENTIALS LOGIN
      if (user) {
        const dbUser = await User.findById(user.id);

        token.id = dbUser._id.toString();
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.role = dbUser.role;

        // Track login timestamp
        await User.findByIdAndUpdate(dbUser._id, { lastLogin: new Date() });

        return token;
      }

      return token;
    },

    // SESSION CALLBACK (set session variables)
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
