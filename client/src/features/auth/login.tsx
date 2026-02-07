import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import { Lock, Mail, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { easings, durations } from "@/lib/animations";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && formRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        duration: durations.fast,
        easing: easings.smooth,
      });

      anime({
        targets: formRef.current,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: durations.normal,
        delay: 200,
        easing: easings.smooth,
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-[hsl(var(--primary))]/5 p-4"
      style={{ opacity: 0 }}
    >
      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[hsl(var(--primary))]/10"
            style={{
              width: Math.random() * 100 + 50 + "px",
              height: Math.random() * 100 + 50 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}
      </div>

      <div ref={formRef} className="w-full max-w-md relative z-10" style={{ opacity: 0 }}>
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 mb-4">
            <Shield className="h-8 w-8 text-[hsl(var(--primary))]" strokeWidth={2} />
          </div>
          <h1
            className="mono text-[28px] font-bold text-foreground mb-2"
            style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
          >
            CLAWDBOT
          </h1>
          <p className="text-[14px] text-muted-foreground">
            Sign in to your agent dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-border bg-card shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={cn(
                    "w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-[14px]",
                    "focus:border-[hsl(var(--primary))]/50 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20",
                    "transition-all duration-200"
                  )}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block caps-label text-[10px] text-muted-foreground mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-lg border border-border bg-background pl-10 pr-12 py-3 text-[14px]",
                    "focus:border-[hsl(var(--primary))]/50 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20",
                    "transition-all duration-200"
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-[12px] text-destructive text-center">{error}</p>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-[hsl(var(--primary))]"
                  disabled={isLoading}
                />
                <span className="text-[12px] text-muted-foreground">Remember me</span>
              </label>
              <button
                type="button"
                className="text-[12px] text-[hsl(var(--primary))] hover:underline"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full rounded-lg border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] px-4 py-3",
                "text-white font-medium text-[14px]",
                "hover:bg-[hsl(var(--primary))]/90 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 rounded-lg bg-[hsl(var(--muted))]/50 border border-border">
            <p className="text-[11px] text-muted-foreground text-center mb-2">
              Demo Mode: Use any email and password to sign in
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                DEMO ENVIRONMENT
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[12px] text-muted-foreground">
            Don't have an account?{" "}
            <button className="text-[hsl(var(--primary))] hover:underline font-medium">
              Sign up
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
      `}</style>
    </div>
  );
}
