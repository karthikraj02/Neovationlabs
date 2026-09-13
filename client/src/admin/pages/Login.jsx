import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, LockKeyhole } from "lucide-react";
import { useAuth } from "../AuthContext";
import { ADMIN_BASE } from "../config";
import { errorMessage } from "../api";
import { ErrorNotice, Field, buttonClass, inputClass } from "../ui";
import { cn } from "../../lib/utils";

export default function Login() {
  const { status, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.startsWith(ADMIN_BASE) ? location.state.from : ADMIN_BASE;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't reach the server. Please try again."));
      setSubmitting(false);
    }
  }

  if (status === "signed-in") return <Navigate to={from} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-signal">
            <LockKeyhole size={18} />
          </span>
          <div>
            <div className="font-display text-base font-medium text-ink">NeovationLabs</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">Admin console</div>
          </div>
        </div>

        <h1 className="mt-8 font-display text-2xl font-medium tracking-tight text-ink">Sign in</h1>
        <p className="mt-1.5 text-sm text-ink-dim">Team access only.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Email">
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>

          {error && <ErrorNotice message={error} />}

          <button type="submit" disabled={submitting} className={cn(buttonClass.primary, "w-full py-2.5")}>
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
