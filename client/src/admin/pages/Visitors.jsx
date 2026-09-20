// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { useApiResource } from "../../hooks/useApiResource";
import { adminApi, errorMessage } from "../api";
import { formatDateTime, formatLocation, formatNumber, timeAgo, useDebounced } from "../format";
import { Empty, ErrorNotice, Loading, PageHeader, Pagination, Segmented, buttonClass, inputClass, labelClass } from "../ui";
import { cn } from "../../lib/utils";

// Keep in step with RETENTION_DAYS in server/src/models/VisitLog.js.
const RETENTION_DAYS = 90;

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

const plural = (n, one, many) => `${formatNumber(n)} ${n === 1 ? one : many}`;

// One IP address's full history: every visit, when it started, and the pages opened.
function VisitorDetail({ ip, onDeleted }) {
  const { status, data, error, retry } = useApiResource(() => adminApi.visitor(ip), { deps: [ip] });
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function erase() {
    if (!window.confirm(`Delete every stored visit record for ${ip}? This cannot be undone.`)) return;
    setBusy(true);
    setDeleteError("");
    try {
      await adminApi.deleteVisitor(ip);
      onDeleted();
    } catch (err) {
      setDeleteError(errorMessage(err, "Could not delete these records."));
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-line bg-void/40 px-5 py-5">
      {status === "loading" && <Loading label="Loading visits" />}
      {status === "error" && <ErrorNotice message={error} onRetry={retry} />}

      {status === "success" && data && (
        <>
          <p className="text-sm text-ink-dim">
            {plural(data.totals.visits, "visit", "visits")} · {plural(data.totals.pageViews, "page view", "page views")} ·{" "}
            {plural(data.totals.devices, "device", "devices")}
          </p>
          {data.totals.devices > 1 && (
            <p className="mt-1 text-xs text-ink-faint">
              Several browsers or devices share this address (an office, a home, or a mobile network), so it may be more
              than one person.
            </p>
          )}

          <div className={cn(labelClass, "mt-5")}>Visits, newest first</div>
          <ol className="mt-2 space-y-4">
            {data.visits.map((visit) => (
              <li key={visit.sessionId} className="text-sm">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-ink">{formatDateTime(visit.startedAt)}</span>
                  <span className="text-xs text-ink-faint">
                    {[formatLocation(visit), visit.device].filter(Boolean).join(" · ")}
                    {visit.referrer ? ` · from ${visit.referrer}` : ""}
                  </span>
                </div>
                <ul className="mt-1.5 space-y-0.5 border-l border-line pl-3 text-xs text-ink-dim">
                  {visit.pages.map((p) => (
                    <li key={`${p.path}-${p.at}`} className="flex flex-wrap gap-x-2">
                      <span className="font-mono">{p.path}</span>
                      <span className="text-ink-faint">{formatDateTime(p.at)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          {data.truncated && (
            <p className="mt-3 text-xs text-ink-faint">Showing the most recent 500 page views for this address.</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={erase} disabled={busy} className={buttonClass.secondary}>
              <Trash2 size={14} /> Delete this visitor's records
            </button>
            {deleteError && <span className="text-xs text-red-500">{deleteError}</span>}
          </div>
        </>
      )}
    </div>
  );
}

export default function Visitors() {
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openIp, setOpenIp] = useState(null);
  const q = useDebounced(search.trim());

  const { status: loadState, data, error, retry } = useApiResource(
    () => adminApi.visitors({ days, q: q || undefined, page }),
    { deps: [days, q, page] }
  );
  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitors"
        description={`Everyone who has visited the site, by IP address: how many times they came back, and when. Records are kept for ${RETENTION_DAYS} days, then deleted automatically. Visits from before this page existed were not recorded with an address. Locations are approximate, worked out from the IP address, so a VPN or a mobile network can show the wrong city.`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Time range"
          options={RANGES}
          value={days}
          onChange={(next) => {
            setDays(next);
            setPage(1);
          }}
        />
        <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by IP address"
            aria-label="Search visitors by IP address"
            className={cn(inputClass, "py-2 pl-9")}
          />
        </div>
      </div>

      {loadState === "error" && <ErrorNotice message={error} onRetry={retry} />}

      {!data && loadState === "loading" ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty>No visitors recorded in this period.</Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_1fr_1fr] gap-4 border-b border-line px-5 py-3 md:grid">
            <span className={labelClass}>IP address</span>
            <span className={labelClass}>Visits</span>
            <span className={labelClass}>Page views</span>
            <span className={labelClass}>First visit</span>
            <span className={labelClass}>Last visit</span>
          </div>

          {items.map((item) => {
            const open = openIp === item.ip;
            return (
              <div key={item.ip} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-label={`${item.ip}, ${plural(item.visits, "visit", "visits")}`}
                  onClick={() => setOpenIp(open ? null : item.ip)}
                  className="grid w-full grid-cols-2 gap-x-4 gap-y-2 px-5 py-4 text-left transition-colors hover:bg-surface-raised md:grid-cols-[1.4fr_0.7fr_0.7fr_1fr_1fr] md:items-center"
                >
                  <div className="col-span-2 min-w-0 md:col-span-1">
                    <div className="truncate font-mono text-sm text-ink">{item.ip}</div>
                    <div className="truncate text-xs text-ink-faint">
                      {formatLocation(item) || "Location unknown"} · {item.device}
                      {item.devices > 1 ? ` · ${item.devices} devices` : ""}
                    </div>
                  </div>
                  <div className="text-sm text-ink">
                    <span className="md:hidden text-xs text-ink-faint">Visits · </span>
                    {formatNumber(item.visits)}
                    {item.visits > 1 && (
                      <span className="ml-2 rounded-full border border-signal-dim px-2 py-0.5 text-[10px] uppercase tracking-wide text-signal">
                        Returning
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-ink-dim">
                    <span className="md:hidden text-xs text-ink-faint">Page views · </span>
                    {formatNumber(item.pageViews)}
                  </div>
                  <div className="text-xs text-ink-dim">
                    <span className="md:hidden text-ink-faint">First · </span>
                    {formatDateTime(item.firstSeen)}
                  </div>
                  <div className="text-xs text-ink-dim">
                    <span className="md:hidden text-ink-faint">Last · </span>
                    {formatDateTime(item.lastSeen)}
                    <span className="block text-ink-faint">{timeAgo(item.lastSeen)}</span>
                  </div>
                </button>

                {open && (
                  <VisitorDetail
                    ip={item.ip}
                    onDeleted={() => {
                      setOpenIp(null);
                      retry();
                    }}
                  />
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
