/**
 * Landing page: product copy, "Try demo" (when ALLOW_DEMO), and optional "Continue with Google".
 * Redirects to /dashboard if already signed in.
 */
import Link from "next/link";
import { auth } from "@/auth";
import { SignInCtas } from "./sign-in-ctas";

export default async function HomePage() {
  const session = await auth();
  const hasGoogle =
    !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  const allowDemo = process.env.ALLOW_DEMO === "true";

  if (session?.user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-lg text-gray-600 mb-4">You are signed in.</p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-lg text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Your own 24/7 OpenClaw assistant
        </h1>
        <p className="text-xl text-gray-600">
          {allowDemo
            ? "Try the demo or sign in with Google to get your own OpenClaw (Moltbot / Clawdbot) agent in under 1 minute."
            : "Sign in with Google to get your own OpenClaw (Moltbot / Clawdbot) agent in under 1 minute."}
        </p>
        <SignInCtas hasGoogle={hasGoogle} allowDemo={allowDemo} />
      </div>
    </main>
  );
}
