// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, CalendarCheck, AlertCircle, Video } from "lucide-react";
import axios from "axios";
import { demos } from "../data/demos";

// Must match server/src/validators/demoBookingValidator.js.
const timeWindows = [
  "09:00 – 11:00",
  "11:00 – 13:00",
  "13:00 – 15:00",
  "15:00 – 17:00",
  "17:00 – 19:00",
];

const demoSlugs = demos.map((d) => d.slug);

function today() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  demos: z
    .array(z.enum(demoSlugs))
    .min(1, "Pick at least one demo you'd like to see"),
  preferredDate: z
    .string()
    .min(1, "Choose a date")
    .refine((v) => v >= today(), "Choose a date that hasn't already passed"),
  preferredTime: z.string().min(1, "Select a time window"),
  timezone: z.string().trim().min(1, "Enter your timezone").max(60),
  attendees: z.coerce.number().int().min(1, "At least one attendee").max(50),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  // Honeypot — hidden from real visitors, filled only by bots.
  website: z.string().max(0, "").optional().or(z.literal("")),
});

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function BookDemoForm({ preselected }) {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      demos: demoSlugs.includes(preselected) ? [preselected] : [],
      timezone: detectTimezone(),
      attendees: 1,
    },
  });

  const onSubmit = async (data) => {
    setStatus("submitting");
    setServerError("");
    try {
      const res = await axios.post(`${API_BASE}/api/demo-bookings`, data);
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
        <CalendarCheck size={36} className="text-signal" />
        <h3 className="mt-4 font-display text-xl font-medium text-ink">
          Your demo request has been received.
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-dim">
          We'll confirm the slot by email, usually within one business day, and send a Google
          Meet link for the call. If your preferred time doesn't work on our side, we'll
          suggest the nearest one that does.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-signal hover:underline"
        >
          Request another demo
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot field — hidden from real visitors, invisible to screen readers,
          but present in the DOM for bots that blindly fill every input. */}
      <div className="hidden" hidden aria-hidden="true">
        <label htmlFor="booking-website">Website</label>
        <input
          id="booking-website"
          type="text"
          tabIndex="-1"
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <fieldset>
        <legend className="font-mono text-xs uppercase tracking-[0.1em] text-ink-faint">
          What would you like to see
        </legend>
        <div className="mt-3 grid gap-2.5">
          {demos.map((demo) => (
            <label
              key={demo.slug}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 transition-colors duration-300 hover:border-signal-dim has-[:checked]:border-signal-dim has-[:checked]:bg-surface-raised"
            >
              <input
                type="checkbox"
                value={demo.slug}
                {...register("demos")}
                className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-signal)]"
              />
              <span>
                <span className="block text-sm text-ink">{demo.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-dim">
                  {demo.tagline}
                </span>
              </span>
            </label>
          ))}
        </div>
        {errors.demos && (
          <span className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={12} /> {errors.demos.message}
          </span>
        )}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input {...register("name")} className={inputClass(errors.name)} autoComplete="name" />
        </Field>
        <Field label="Company" optional>
          <input {...register("company")} className={inputClass()} autoComplete="organization" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Work email" error={errors.email?.message}>
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
        <Field label="Preferred date" error={errors.preferredDate?.message}>
          <input
            type="date"
            min={today()}
            {...register("preferredDate")}
            className={inputClass(errors.preferredDate)}
          />
        </Field>
        <Field label="Preferred time" error={errors.preferredTime?.message}>
          <select
            {...register("preferredTime")}
            className={inputClass(errors.preferredTime)}
            defaultValue=""
          >
            <option value="" disabled>
              Select a window
            </option>
            {timeWindows.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your timezone" error={errors.timezone?.message}>
          <input
            {...register("timezone")}
            placeholder="e.g. Asia/Kolkata"
            className={inputClass(errors.timezone)}
          />
        </Field>
        <Field label="Attendees" error={errors.attendees?.message}>
          <input
            type="number"
            min={1}
            max={50}
            {...register("attendees")}
            className={inputClass(errors.attendees)}
          />
        </Field>
      </div>

      <Field label="Anything specific you want covered" optional>
        <textarea
          {...register("notes")}
          rows={4}
          placeholder="Your setup, the cameras or documents you'd want it run against, questions to answer on the call."
          className={inputClass(errors.notes)}
        />
      </Field>

      {status === "error" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-void transition-all duration-300 hover:shadow-[0_0_24px_rgb(var(--signal-rgb)/0.35)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending request...
            </>
          ) : (
            <>
              <Video size={16} />
              Request live demo
            </>
          )}
        </button>
        <p className="text-xs text-ink-faint">
          We'll email a Google Meet link once the slot is confirmed.
        </p>
      </div>
    </form>
  );
}

function Field({ label, error, optional, children }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.1em] text-ink-faint">
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
