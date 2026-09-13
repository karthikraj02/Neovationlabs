import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, FolderKanban, Inbox, RefreshCw, Video } from "lucide-react";
import { useApiResource } from "../../hooks/useApiResource";
import { adminApi } from "../api";
import { ADMIN_BASE } from "../config";
import { formatDate, formatNumber, timeAgo } from "../format";
import {
  Empty,
  ErrorNotice,
  Loading,
  PageHeader,
  Panel,
  ProgressBar,
  Segmented,
  StatTile,
  StatusBadge,
  buttonClass,
  labelClass,
} from "../ui";
import VisitorsChart from "../VisitorsChart";
import { cn } from "../../lib/utils";

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

function ViewAll({ to }) {
  return (
    <Link to={to} className="text-xs text-signal hover:underline">
      View all
    </Link>
  );
}

function TrafficSources({ traffic }) {
  // Only a session's first page view carries a referrer, so sessions without
  // one arrived directly (typed URL, bookmark, or a referrer the browser hid).
  const external = traffic.referrers.reduce((sum, r) => sum + r.views, 0);
  const rows = [{ source: "Direct or unknown", views: Math.max(0, traffic.sessions - external) }, ...traffic.referrers]
    .filter((r) => r.views > 0)
    .sort((a, b) => b.views - a.views);
  const max = Math.max(1, ...rows.map((r) => r.views));
  const deviceTotal = Object.values(traffic.devices).reduce((a, b) => a + b, 0);

  return (
    <>
      <div className={labelClass}>Sessions by source</div>
      {rows.length ? (
        <ul className="mt-3 space-y-3">
          {rows.map((r) => (
            <li key={r.source}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-ink-dim">{r.source}</span>
                <span className="tabular-nums text-ink">{formatNumber(r.views)}</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-line">
                <div className="h-full rounded-full bg-signal/70" style={{ width: `${(r.views / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No sessions yet.</Empty>
      )}

      {deviceTotal > 0 && (
        <div className="mt-6 border-t border-line pt-4">
          <div className={labelClass}>Page views by device</div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-dim">
            {["desktop", "mobile", "tablet"].map((d) => (
              <span key={d}>
                <span className="capitalize">{d}</span>{" "}
                <span className="tabular-nums text-ink">{Math.round(((traffic.devices[d] || 0) / deviceTotal) * 100)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function Overview() {
  const [days, setDays] = useState(30);
  const { status, data, error, retry } = useApiResource(() => adminApi.stats(days), { deps: [days] });

  const header = (
    <PageHeader
      title="Overview"
      description={`Last ${days} days${data ? ` · days counted in ${data.range.timezone}` : ""}`}
      actions={
        <>
          <Segmented label="Date range" options={RANGES} value={days} onChange={setDays} />
          <button type="button" onClick={retry} aria-label="Refresh" className={cn(buttonClass.secondary, "px-2.5")}>
            <RefreshCw size={14} className={status === "loading" ? "animate-spin" : ""} />
          </button>
        </>
      }
    />
  );

  if (!data) {
    return (
      <div className="space-y-6">
        {header}
        {status === "error" ? <ErrorNotice message={error} onRetry={retry} /> : <Loading />}
      </div>
    );
  }

  const { traffic, enquiries, demoBookings, projects } = data;
  const leads = enquiries.inRange + demoBookings.inRange;
  const leadRate = traffic.visitors ? ((leads / traffic.visitors) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {header}
      {status === "error" && <ErrorNotice message={error} onRetry={retry} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Unique visitors"
          icon={Eye}
          value={formatNumber(traffic.visitors)}
          sub={`${formatNumber(traffic.today)} today · ${formatNumber(traffic.pageViews)} page views`}
        />
        <StatTile
          label="Project enquiries"
          icon={Inbox}
          value={formatNumber(enquiries.inRange)}
          sub={`${formatNumber(enquiries.byStatus.new || 0)} new · ${formatNumber(enquiries.total)} all time`}
        />
        <StatTile
          label="Demo requests"
          icon={Video}
          value={formatNumber(demoBookings.inRange)}
          sub={`${formatNumber(demoBookings.byStatus.requested || 0)} to schedule · ${formatNumber(demoBookings.total)} all time`}
        />
        <StatTile
          label="Active projects"
          icon={FolderKanban}
          value={formatNumber(projects.active)}
          sub={`${formatNumber(projects.byStatus.completed || 0)} completed · ${formatNumber(projects.total)} total`}
        />
      </div>

      <Panel
        title="Unique visitors per day"
        action={
          <span className="text-xs text-ink-dim">
            <span className="tabular-nums text-ink">{leadRate}%</span> of visitors sent an enquiry or demo request
          </span>
        }
      >
        <VisitorsChart data={traffic.daily} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top pages">
          {traffic.topPages.length ? (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className={cn(labelClass, "text-left")}>
                  <th className="pb-2 font-normal">Page</th>
                  <th className="w-20 pb-2 text-right font-normal">Views</th>
                  <th className="w-20 pb-2 text-right font-normal">Visitors</th>
                </tr>
              </thead>
              <tbody>
                {traffic.topPages.map((p) => (
                  <tr key={p.path} className="border-t border-line">
                    <td className="truncate py-2 pr-3 font-mono text-xs text-ink-dim">{p.path}</td>
                    <td className="py-2 text-right tabular-nums text-ink">{formatNumber(p.views)}</td>
                    <td className="py-2 text-right tabular-nums text-ink-dim">{formatNumber(p.visitors)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty>No page views recorded in this period.</Empty>
          )}
        </Panel>

        <Panel title="Where visitors come from">
          <TrafficSources traffic={traffic} />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Latest project enquiries" action={<ViewAll to={`${ADMIN_BASE}/enquiries`} />}>
          {enquiries.recent.length ? (
            <ul className="-my-2 divide-y divide-line">
              {enquiries.recent.map((e) => (
                <li key={e._id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm text-ink">
                      {e.name}
                      {e.company && <span className="text-ink-faint"> · {e.company}</span>}
                    </div>
                    <div className="truncate text-xs text-ink-faint">
                      {e.projectType} · {timeAgo(e.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No enquiries yet.</Empty>
          )}
        </Panel>

        <Panel title="Latest demo requests" action={<ViewAll to={`${ADMIN_BASE}/demo-bookings`} />}>
          {demoBookings.recent.length ? (
            <ul className="-my-2 divide-y divide-line">
              {demoBookings.recent.map((b) => (
                <li key={b._id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm text-ink">
                      {b.name}
                      {b.company && <span className="text-ink-faint"> · {b.company}</span>}
                    </div>
                    <div className="truncate text-xs text-ink-faint">
                      Wants {formatDate(b.preferredDate, { dateOnly: true })} · {b.demos.length} demo
                      {b.demos.length === 1 ? "" : "s"} · {timeAgo(b.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No demo requests yet.</Empty>
          )}
        </Panel>
      </div>

      <Panel title="Ongoing projects" action={<ViewAll to={`${ADMIN_BASE}/projects`} />}>
        {projects.activeList.length ? (
          <ul className="-my-2 divide-y divide-line">
            {projects.activeList.map((p) => (
              <li key={p._id}>
                <Link
                  to={`${ADMIN_BASE}/projects/${p._id}`}
                  className="grid gap-2 py-3 transition-colors hover:text-ink sm:grid-cols-[1.4fr_auto_1fr] sm:items-center sm:gap-6"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-ink">{p.name}</div>
                    <div className="truncate text-xs text-ink-faint">
                      {p.client} · due {formatDate(p.dueDate, { dateOnly: true })}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                  <div className="flex items-center gap-3">
                    <ProgressBar value={p.progress} className="flex-1" />
                    <span className="w-9 text-right text-xs tabular-nums text-ink">{p.progress}%</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>
            No active projects.{" "}
            <Link to={`${ADMIN_BASE}/projects/new`} className="text-signal hover:underline">
              Add one
            </Link>
          </Empty>
        )}
      </Panel>
    </div>
  );
}
