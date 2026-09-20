// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useState } from "react";
import { Mail, Phone, Search } from "lucide-react";
import { useApiResource } from "../../hooks/useApiResource";
import { adminApi, errorMessage } from "../api";
import { formatDateTime, formatNumber, useDebounced } from "../format";
import {
  Empty,
  ErrorNotice,
  Loading,
  PageHeader,
  Pagination,
  Segmented,
  StatusBadge,
  buttonClass,
  inputClass,
  labelClass,
} from "../ui";
import { cn } from "../../lib/utils";

const FILTERS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "archived", label: "Archived" },
];
const STATUSES = FILTERS.slice(1);

// What happened to one team alert (email or WhatsApp) for an enquiry.
const ALERT_LOOK = {
  sent: { label: "Sent", tone: "text-signal" },
  partial: { label: "Sent to some recipients only", tone: "text-amber-500" },
  skipped: { label: "Not sent", tone: "text-ink-faint" },
  failed: { label: "Failed", tone: "text-red-500" },
  "timed-out": { label: "Did not finish in time", tone: "text-amber-500" },
};

function AlertLine({ name, alert }) {
  if (!alert || !alert.status) return null;
  const look = ALERT_LOOK[alert.status] || { label: alert.status, tone: "text-ink-dim" };
  return (
    <li className="flex flex-wrap gap-x-2">
      <span className="w-20 shrink-0 text-ink-faint">{name}</span>
      <span className={look.tone}>{look.label}</span>
      {alert.detail && <span className="text-ink-faint">· {alert.detail}</span>}
    </li>
  );
}

export default function Enquiries() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [edits, setEdits] = useState({});
  const [notice, setNotice] = useState("");
  const q = useDebounced(search.trim());

  const { status: loadState, data, error, retry } = useApiResource(
    () => adminApi.enquiries({ status: status || undefined, q: q || undefined, page }),
    { deps: [status, q, page] }
  );

  async function changeStatus(item, next) {
    setNotice("");
    setEdits((e) => ({ ...e, [item._id]: { ...item, status: next } }));
    try {
      const saved = await adminApi.updateEnquiry(item._id, { status: next });
      setEdits((e) => ({ ...e, [item._id]: saved }));
    } catch (err) {
      setEdits((e) => ({ ...e, [item._id]: item }));
      setNotice(errorMessage(err, "Couldn't update that enquiry."));
    }
  }

  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project enquiries"
        description={data ? `${formatNumber(data.total)} matching enquiries from the contact form` : "From the contact form"}
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
            aria-label="Search enquiries"
            className={cn(inputClass, "py-2 pl-9")}
          />
        </div>
      </div>

      {notice && <ErrorNotice message={notice} />}
      {loadState === "error" && <ErrorNotice message={error} onRetry={retry} />}

      {!data && loadState === "loading" ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty>No enquiries match these filters.</Empty>
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
                  className="grid w-full grid-cols-1 gap-2 px-5 py-4 text-left transition-colors hover:bg-surface-raised md:grid-cols-[1.4fr_1.1fr_0.8fr_6.5rem] md:items-center md:gap-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-ink">
                      {item.name}
                      {item.company && <span className="text-ink-faint"> · {item.company}</span>}
                    </div>
                    <div className="truncate text-xs text-ink-faint">{item.email}</div>
                  </div>
                  <div className="truncate text-xs text-ink-dim">
                    {item.projectType}
                    {item.budget && <span className="text-ink-faint"> · {item.budget}</span>}
                  </div>
                  <div className="text-xs text-ink-faint">{formatDateTime(item.createdAt)}</div>
                  <div className="md:justify-self-end">
                    <StatusBadge status={item.status} />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-line bg-void/40 px-5 py-5">
                    <div className={labelClass}>Message</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-dim">{item.message}</p>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 text-signal hover:underline">
                        <Mail size={14} /> {item.email}
                      </a>
                      {item.phone && (
                        <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 text-ink-dim hover:text-ink">
                          <Phone size={14} /> {item.phone}
                        </a>
                      )}
                    </div>

                    {item.alerts && (item.alerts.email || item.alerts.whatsapp) && (
                      <div className="mt-4 text-xs">
                        <div className={labelClass}>Team alerts</div>
                        <ul className="mt-2 space-y-1">
                          <AlertLine name="Email" alert={item.alerts.email} />
                          <AlertLine name="WhatsApp" alert={item.alerts.whatsapp} />
                        </ul>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <span className={labelClass}>Mark as</span>
                      <Segmented
                        label="Enquiry status"
                        options={STATUSES}
                        value={item.status}
                        onChange={(next) => next !== item.status && changeStatus(item, next)}
                      />
                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent("Your project enquiry — NeovationLabs")}`}
                        className={buttonClass.secondary}
                      >
                        <Mail size={14} /> Reply by email
                      </a>
                    </div>
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
