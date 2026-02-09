/**
 * Next.js middleware: export auth as middleware to protect routes and keep session alive.
 * For Next.js 15 we use middleware.ts (proxy.ts is for Next.js 16+).
 */
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
