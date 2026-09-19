// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useApiResource } from "../../hooks/useApiResource";
import { adminApi } from "../api";
import { ADMIN_BASE } from "../config";
import { formatDate, isOverdue } from "../format";
import { Empty, ErrorNotice, Loading, PageHeader, ProgressBar, Segmented, StatusBadge, buttonClass, statusLabel } from "../ui";
import { cn } from "../../lib/utils";

const STATUSES = ["planning", "in-progress", "review", "on-hold", "completed"];
const FILTERS = [{ value: "", label: "All" }, ...STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))];

function ProjectCard({ project }) {
  const done = project.milestones.filter((m) => m.done).length;
  const overdue = isOverdue(project);

  return (
    <Link
      to={`${ADMIN_BASE}/projects/${project._id}`}
      className="block rounded-xl border border-line bg-surface p-5 transition-colors hover:border-ink-faint"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{project.name}</div>
          <div className="truncate text-xs text-ink-faint">{project.client}</div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-5 flex items-center justify-between text-xs">
        <span className="text-ink-faint">Progress</span>
        <span className="tabular-nums text-ink">{project.progress}%</span>
      </div>
      <ProgressBar value={project.progress} className="mt-2" />

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-faint">
        <span className={cn(overdue && "text-red-300")}>
          Due {formatDate(project.dueDate, { dateOnly: true })}
          {overdue && " · overdue"}
        </span>
        {project.milestones.length > 0 && (
          <span>
            {done}/{project.milestones.length} milestones
          </span>
        )}
        <span className="capitalize">{project.priority} priority</span>
      </div>
    </Link>
  );
}

export default function Projects() {
  const [status, setStatus] = useState("");
  const { status: loadState, data, error, retry } = useApiResource(
    () => adminApi.projects({ status: status || undefined }),
    { deps: [status] }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Client work in flight — progress, milestones and updates"
        actions={
          <Link to={`${ADMIN_BASE}/projects/new`} className={buttonClass.primary}>
            <Plus size={15} /> New project
          </Link>
        }
      />

      <Segmented label="Filter by status" options={FILTERS} value={status} onChange={setStatus} />

      {loadState === "error" && <ErrorNotice message={error} onRetry={retry} />}

      {!data && loadState === "loading" ? (
        <Loading />
      ) : !data?.length ? (
        <Empty>
          {status ? "No projects with this status." : "No projects yet."}{" "}
          <Link to={`${ADMIN_BASE}/projects/new`} className="text-signal hover:underline">
            Add a project
          </Link>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
