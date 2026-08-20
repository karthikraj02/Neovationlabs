import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";

const projectTypes = [
  "Generative AI",
  "Custom Software",
  "Computer Vision",
  "AI Agents",
  "Data Engineering",
  "MLOps",
  "Predictive Analytics",
  "Other",
];

const budgetRanges = [
  "Under $10k",
  "$10k – $25k",
  "$25k – $75k",
  "$75k – $150k",
  "$150k+",
  "Not sure yet",
];

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  projectType: z.string().min(1, "Select a project type"),
  budget: z.string().min(1, "Select a budget range"),
  message: z.string().trim().min(20, "Tell us a bit more — at least 20 characters").max(4000),
  // Honeypot — real visitors never see or fill this field. Bots that
  // auto-fill every input on a form will, which is enough to filter them
  // out server-side without a CAPTCHA.
  website: z.string().max(0, "").optional().or(z.literal("")),
});

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setStatus("submitting");
    setServerError("");
    try {
      const res = await axios.post(`${API_BASE}/api/contact`, data);
      if (res.data?.success) {
        setStatus("success");
        reset();
      } else {
        throw new Error(res.data?.message || "Something went wrong.");
      }
    } catch (err) {
      setStatus("error");
      setServerError(
        err?.response?.data?.message ||
          "We couldn't send that — please try again in a moment."
      );
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center rounded-2xl border border-signal-dim bg-surface p-10 text-center"
      >
        <CheckCircle2 size={36} className="text-signal" />
        <h3 className="mt-4 font-display text-xl font-medium text-ink">
          Your project request has been received.
        </h3>
        <p className="mt-2 max-w-sm text-sm text-ink-dim">
          We'll follow up at the email you provided, usually within one business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-signal hover:underline"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot field — hidden from real visitors, invisible to screen readers,
          but present in the DOM for bots that blindly fill every input. */}
      <div className="hidden" hidden aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex="-1"
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input {...register("name")} className={inputClass(errors.name)} autoComplete="name" />
        </Field>
        <Field label="Company" optional>
          <input {...register("company")} className={inputClass()} autoComplete="organization" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            {...register("email")}
            className={inputClass(errors.email)}
            autoComplete="email"
          />
        </Field>
        <Field label="Phone" optional>
          <input type="tel" {...register("phone")} className={inputClass()} autoComplete="tel" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Project type" error={errors.projectType?.message}>
          <select {...register("projectType")} className={inputClass(errors.projectType)} defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {projectTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget range" error={errors.budget?.message}>
          <select {...register("budget")} className={inputClass(errors.budget)} defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {budgetRanges.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Message" error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="What are you trying to build?"
          className={inputClass(errors.message)}
        />
      </Field>

      {status === "error" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-void transition-all duration-300 hover:shadow-[0_0_24px_rgba(94,234,212,0.35)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting...
          </>
        ) : (
          "Send project request"
        )}
      </button>
    </form>
  );
}

function Field({ label, error, optional, children }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.1em] text-ink-faint">
        {label}
        {optional && <span className="normal-case tracking-normal text-ink-faint/70">optional</span>}
      </span>
      <div className="mt-2">{children}</div>
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </label>
  );
}

function inputClass(error) {
  return [
    "w-full rounded-lg border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint",
    "transition-colors duration-300 focus:outline-none focus:ring-1",
    error
      ? "border-red-900/60 focus:border-red-700 focus:ring-red-700"
      : "border-line focus:border-signal-dim focus:ring-signal-dim",
  ].join(" ");
}
