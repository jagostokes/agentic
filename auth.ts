/**
 * Auth.js (NextAuth v5) configuration.
 * - Google provider when GOOGLE_CLIENT_ID/SECRET are set.
 * - Demo (Credentials) provider when ALLOW_DEMO=true; no Google required.
 * User records stored in Supabase. JWT sessions.
 */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

const DEMO_EMAIL = "demo@demo.local";
const allowDemo = process.env.ALLOW_DEMO === "true";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providers: any[] = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}
if (allowDemo) {
  providers.push(
    Credentials({
      id: "credentials",
      name: "Demo",
      credentials: {
        demo: { label: "Demo", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.demo !== "true") return null;
        return {
          id: "demo",
          email: DEMO_EMAIL,
          name: "Demo User",
          image: null,
        };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", user.email)
        .single();

      if (existing) {
        await supabase
          .from("users")
          .update({
            name: user.name ?? null,
            image: user.image ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("users").insert({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        });
      }
      return true;
    },
    async jwt({ token, user: authUser }) {
      if (authUser?.email) {
        let { data: dbUser } = await supabase
          .from("users")
          .select("id, email")
          .eq("email", authUser.email)
          .single();
        // Ensure demo user row exists and we have a real UUID (token.sub must not be "demo")
        if (!dbUser && authUser.email === DEMO_EMAIL) {
          const { data: upserted } = await supabase
            .from("users")
            .upsert(
              {
                email: DEMO_EMAIL,
                name: authUser.name ?? null,
                image: authUser.image ?? null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "email" }
            )
            .select("id, email")
            .single();
          dbUser = upserted ?? undefined;
        }
        if (dbUser) {
          token.sub = dbUser.id;
          token.email = dbUser.email;
        }
      }
      // Fix existing sessions where token.sub stayed "demo" (must be real UUID for DB)
      if (token.email === DEMO_EMAIL && token.sub === "demo") {
        const { data: dbUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", DEMO_EMAIL)
          .single();
        if (dbUser) token.sub = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  trustHost: true,
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
