// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useState } from "react";
import { CheckCircle2, Loader2, Mail, Phone, Search } from "lucide-react";
import { useApiResource } from "../../hooks/useApiResource";
import { adminApi, errorMessage } from "../api";
import { formatDate, formatDateTime, formatNumber, toDateTimeLocal, useDebounced } from "../format";
import {
  Empty,
  ErrorNotice,
  Field,
  Loading,
  PageHeader,
  Pagination,
  Segmented,
  StatusBadge,
  buttonClass,
  inputClass,
  labelClass,
  statusLabel,
} from "../ui";
import { demos } from "../../data/demos";
import { cn } from "../../lib/utils";

const STATUSES = ["requested", "scheduled", "completed", "cancelled"];
const FILTERS = [{ value: "", label: "All" }, ...STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))];
const demoTitle = Object.fromEntries(demos.map((d) => [d.slug, d.title]));

function BookingActions({ item, onSaved }) {
  const [form, setForm] = useState({
    status: item.status,
    meetingLink: item.meetingLink || "",
    scheduledFor: toDateTimeLocal(item.scheduledFor),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const set = (key) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await adminApi.updateDemoBooking(item._id, {
        status: form.status,
        meetingLink: form.meetingLink.trim(),
        scheduledFor: form.scheduledFor ? new Date(form.scheduledFor).toISOString() : "",
      });
      onSaved(result);
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err, "Couldn't save the booking."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-line pt-5">
      <div className="grid gap-4 sm:grid-cols-[10rem_14rem_1fr]">
        <Field label="Status">
          <select value={form.status} onChange={set("status")} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Scheduled for">
          <input type="datetime-local" value={form.scheduledFor} onChange={set("scheduledFor")} className={inputClass} />
        </Field>
        <Field label="Google Meet link">
          <input
            type="url"
            value={form.meetingLink}
            onChange={set("meetingLink")}
            placeholder="https://meet.google.com/…"
            className={inputClass}
          />
        </Field>
      </div>

      {error && <ErrorNotice message={error} />}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className={buttonClass.primary}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save booking
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-xs text-signal">
            <CheckCircle2 size={14} /> Saved
          </span>
        )}
      </div>
    </form>
  );
}

export default function DemoBookings() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [edits, setEdits] = useState({});
  const q = useDebounced(search.trim());

  const { status: loadState, data, error, retry } = useApiResource(
    () => adminApi.demoBookings({ status: status || undefined, q: q || undefined, page }),
    { deps: [status, q, page] }
  );

  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo requests"
        description={data ? `${formatNumber(data.total)} matching live demo requests` : "Live demo bookings"}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Filter by status"
          options={FILTERS}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <div className="relative w-full sm:w-72">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, company or email"
            aria-label="Search demo requests"
            className={cn(inputClass, "py-2 pl-9")}
          />
        </div>
      </div>

      {loadState === "error" && <ErrorNotice message={error} onRetry={retry} />}

      {!data && loadState === "loading" ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty>No demo requests match these filters.</Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          {items.map((raw) => {
            const item = edits[raw._id] || raw;
            const open = openId === item._id;
            return (
              <div key={item._id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item._id)}
                  className="grid w-full grid-cols-1 gap-2 px-5 py-4 text-left transition-colors hover:bg-surface-raised md:grid-cols-[1.3fr_1.3fr_0.9fr_6.5rem] md:items-center md:gap-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-ink">
                      {item.name}
                      {item.company && <span className="text-ink-faint"> · {item.company}</span>}
                    </div>
                    <div className="truncate text-xs text-ink-faint">{item.email}</div>
                  </div>
                  <div className="truncate text-xs text-ink-dim">{item.demos.map((s) => demoTitle[s] || s).join(", ")}</div>
                  <div className="text-xs text-ink-faint">
                    {item.scheduledFor ? (
                      <span className="text-ink-dim">Booked {formatDateTime(item.scheduledFor)}</span>
                    ) : (
                      <>
                        Wants {formatDate(item.preferredDate, { dateOnly: true })}, {item.preferredTime}
                      </>
                    )}
                  </div>
                  <div className="md:justify-self-end">
                    <StatusBadge status={item.status} />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-line bg-void/40 px-5 py-5">
                    <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <dt className={labelClass}>Preferred slot</dt>
                        <dd className="mt-1 text-ink-dim">
                          {formatDate(item.preferredDate, { dateOnly: true })}, {item.preferredTime}
                          <div className="text-xs text-ink-faint">{item.timezone}</div>
                        </dd>
                      </div>
                      <div>
                        <dt className={labelClass}>Attendees</dt>
                        <dd className="mt-1 text-ink-dim">{item.attendees}</dd>
                      </div>
                      <div>
                        <dt className={labelClass}>Requested</dt>
                        <dd className="mt-1 text-ink-dim">{formatDateTime(item.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className={labelClass}>Contact</dt>
                        <dd className="mt-1 space-y-1">
                          <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 truncate text-signal hover:underline">
                            <Mail size={13} /> {item.email}
                          </a>
                          {item.phone && (
                            <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 text-ink-dim hover:text-ink">
                              <Phone size={13} /> {item.phone}
                            </a>
                          )}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4">
                      <div className={labelClass}>Demos</div>
                      <ul className="mt-1 text-sm text-ink-dim">
                        {item.demos.map((s) => (
                          <li key={s}>{demoTitle[s] || s}</li>
                        ))}
                      </ul>
                    </div>

                    {item.notes && (
                      <div className="mt-4">
                        <div className={labelClass}>Notes</div>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-dim">{item.notes}</p>
                      </div>
                    )}

                    <BookingActions item={item} onSaved={(saved) => setEdits((e) => ({ ...e, [saved._id]: saved }))} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data && <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />}
    </div>
  );
}
