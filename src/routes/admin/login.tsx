import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Eyebrow } from "@/components/page-elements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, api } from "@/lib/api";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — Cadarcq Technologies" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Already signed in? Go straight to the dashboard.
  useEffect(() => {
    if (me) void navigate({ to: "/admin" });
  }, [me, navigate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { user } = await api.login(id.trim(), password);
      queryClient.setQueryData(["me"], user);
      setPassword("");
      await navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid-bg ambient-bg flex min-h-screen items-center justify-center px-5 pt-28 pb-16">
      <div className="w-full max-w-md border bg-card/80 p-8 shadow-2xl backdrop-blur sm:p-10">
        <div className="flex items-center gap-3">
          <Lock className="h-6 w-6 text-primary" />
          <Eyebrow>Team access</Eyebrow>
        </div>
        <h1 className="mt-5 font-display text-3xl font-black">Admin login</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Sign in with the ID and password assigned to you to view company updates.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5" autoComplete="on">
          <div className="space-y-2">
            <Label htmlFor="admin-id">Admin ID</Label>
            <Input
              id="admin-id"
              name="username"
              autoComplete="username"
              value={id}
              onChange={(e) => setId(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={200}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={busy || !id || !password}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </section>
  );
}
