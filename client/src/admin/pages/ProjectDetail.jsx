// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Pencil, Trash2 } from "lucide-react";
import { useApiResource } from "../../hooks/useApiResource";
import { adminApi, errorMessage } from "../api";
import { ADMIN_BASE } from "../config";
import { formatDate, formatDateTime, isOverdue, timeAgo } from "../format";
import {
  ErrorNotice,
  Loading,
  PageHeader,
  Panel,
  ProgressBar,
  StatusBadge,
  buttonClass,
  inputClass,
  labelClass,
  statusLabel,
} from "../ui";
import { cn } from "../../lib/utils";

const STATUSES = ["planning", "in-progress", "review", "on-hold", "completed"];

function Detail({ label, children }) {
  return (
    <div>
      <dt className={labelClass}>{label}</dt>
      <dd className="mt-1 text-sm text-ink-dim">{children || "—"}</dd>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, data, error, retry } = useApiResource(() => adminApi.project(id), { deps: [id] });

  const [local, setLocal] = useState(null);
  const [progressDraft, setProgressDraft] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [actionError, setActionError] = useState("");

  // Mutations return the saved project; prefer that over the initial fetch.
  const project = local?._id === id ? local : data;

  async function patch(body, key, failMessage) {
    setBusy(key);
    setActionError("");
    try {
      setLocal(await adminApi.updateProject(id, body));
      return true;
    } catch (err) {
      setActionError(errorMessage(err, failMessage));
      return false;
    } finally {
      setBusy("");
    }
  }

  async function saveProgress() {
    if (await patch({ progress: progressDraft }, "progress", "Couldn't update progress.")) setProgressDraft(null);
  }

  function toggleMilestone(index) {
    const milestones = project.milestones.map((m, i) => ({
      title: m.title,
      dueDate: m.dueDate || "",
      done: i === index ? !m.done : m.done,
    }));
    patch({ milestones }, `milestone-${index}`, "Couldn't update the milestone.");
  }

  async function postNote(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setBusy("note");
    setActionError("");
    try {
      setLocal(await adminApi.addProjectUpdate(id, note.trim()));
      setNote("");
    } catch (err) {
      setActionError(errorMessage(err, "Couldn't post the update."));
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${project.name}"? This permanently removes the project and its updates.`)) return;
    setBusy("delete");
    try {
      await adminApi.deleteProject(id);
      navigate(`${ADMIN_BASE}/projects`, { replace: true });
    } catch (err) {
      setActionError(errorMessage(err, "Couldn't delete the project."));
      setBusy("");
    }
  }

  if (status === "error" && !project) return <ErrorNotice message={error} onRetry={retry} />;
  if (!project) return <Loading />;

  const progress = progressDraft ?? project.progress;
  const doneCount = project.milestones.filter((m) => m.done).length;
  const overdue = isOverdue(project);

  return (
    <div className="space-y-6">
      <Link to={`${ADMIN_BASE}/projects`} className="inline-flex items-center gap-1.5 text-xs text-ink-dim hover:text-ink">
        <ArrowLeft size={14} /> All projects
      </Link>

      <PageHeader
        title={project.name}
        description={`${project.client} · updated ${timeAgo(project.updatedAt)}`}
        actions={
          <>
            <Link to={`${ADMIN_BASE}/projects/${id}/edit`} className={buttonClass.secondary}>
              <Pencil size={14} /> Edit
            </Link>
            <button type="button" onClick={remove} disabled={busy === "delete"} className={buttonClass.danger}>
              <Trash2 size={14} /> Delete
            </button>
          </>
        }
      />

      {actionError && <ErrorNotice message={actionError} />}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel
            title="Progress"
            action={
              <select
                value={project.status}
                onChange={(e) => patch({ status: e.target.value }, "status", "Couldn't change the status.")}
                disabled={busy === "status"}
                aria-label="Project status"
                className={cn(inputClass, "w-auto py-1.5 text-xs")}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            }
          >
            <div className="flex items-end justify-between gap-4">
              <div className="font-display text-4xl font-medium tabular-nums tracking-tight text-ink">{progress}%</div>
              <div className="text-right text-xs text-ink-faint">
                {project.milestones.length > 0 && (
                  <div>
                    {doneCount} of {project.milestones.length} milestones done
                  </div>
                )}
                <div className={cn(overdue && "text-red-300")}>
                  Due {formatDate(project.dueDate, { dateOnly: true })}
                  {overdue && " · overdue"}
                </div>
              </div>
            </div>
            <ProgressBar value={progress} className="mt-4 h-2" />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(e) => setProgressDraft(Number(e.target.value))}
                aria-label="Set progress"
                className="min-w-0 flex-1 accent-[color:var(--color-signal)]"
              />
              {progressDraft !== null && progressDraft !== project.progress && (
                <>
                  <button type="button" onClick={saveProgress} disabled={busy === "progress"} className={buttonClass.primary}>
                    {busy === "progress" && <Loader2 size={14} className="animate-spin" />}
                    Save {progressDraft}%
                  </button>
                  <button type="button" onClick={() => setProgressDraft(null)} className="text-xs text-ink-faint hover:text-ink">
                    Cancel
                  </button>
                </>
              )}
            </div>
          </Panel>

          <Panel title="Milestones">
            {project.milestones.length === 0 ? (
              <p className="text-sm text-ink-faint">
                No milestones.{" "}
                <Link to={`${ADMIN_BASE}/projects/${id}/edit`} className="text-signal hover:underline">
                  Add some
                </Link>
              </p>
            ) : (
              <ul className="-my-1 space-y-1">
                {project.milestones.map((m, i) => (
                  <li key={m._id || i}>
                    <button
                      type="button"
                      onClick={() => toggleMilestone(i)}
                      disabled={busy.startsWith("milestone")}
                      aria-pressed={m.done}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-raised"
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                          m.done ? "border-signal bg-signal text-void" : "border-ink-faint"
                        )}
                      >
                        {m.done && <Check size={13} strokeWidth={3} />}
                      </span>
                      <span className={cn("flex-1 text-sm", m.done ? "text-ink-faint line-through" : "text-ink")}>{m.title}</span>
                      {m.dueDate && <span className="text-xs text-ink-faint">{formatDate(m.dueDate, { dateOnly: true })}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Updates">
            <form onSubmit={postNote} className="space-y-3">
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What moved on this project? Decisions, blockers, what shipped…"
                aria-label="New update"
                className={inputClass}
              />
              <button type="submit" disabled={!note.trim() || busy === "note"} className={buttonClass.primary}>
                {busy === "note" && <Loader2 size={14} className="animate-spin" />}
                Post update
              </button>
            </form>

            {project.updates.length > 0 && (
              <ol className="mt-6 space-y-5 border-l border-line pl-5">
                {project.updates.map((u) => (
                  <li key={u._id} className="relative">
                    <span className="absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
                    <div className="text-xs text-ink-faint">
                      {u.author || "Team"} · {formatDateTime(u.createdAt)}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-dim">{u.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Details">
            <dl className="grid grid-cols-2 gap-4">
              <Detail label="Status">
                <StatusBadge status={project.status} />
              </Detail>
              <Detail label="Priority">
                <span className="capitalize">{project.priority}</span>
              </Detail>
              <Detail label="Start">{formatDate(project.startDate, { dateOnly: true })}</Detail>
              <Detail label="Due">{formatDate(project.dueDate, { dateOnly: true })}</Detail>
              <Detail label="Budget">{project.budget}</Detail>
              <Detail label="Created">{formatDate(project.createdAt)}</Detail>
              <div className="col-span-2">
                <Detail label="Client contact">
                  {project.clientEmail && (
                    <a href={`mailto:${project.clientEmail}`} className="break-all text-signal hover:underline">
                      {project.clientEmail}
                    </a>
                  )}
                </Detail>
              </div>
              <div className="col-span-2">
                <Detail label="Team">{project.team.join(", ")}</Detail>
              </div>
            </dl>

            {project.techStack.length > 0 && (
              <div className="mt-5">
                <div className={labelClass}>Tech stack</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.techStack.map((t) => (
                    <span key={t} className="rounded-full border border-line bg-void px-2.5 py-0.5 font-mono text-xs text-ink-dim">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          {project.description && (
            <Panel title="Description">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-dim">{project.description}</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
