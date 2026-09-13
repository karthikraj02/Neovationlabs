import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { useApiResource } from "../../hooks/useApiResource";
import { adminApi, errorMessage } from "../api";
import { ADMIN_BASE } from "../config";
import { toDateInput } from "../format";
import { ErrorNotice, Field, Loading, PageHeader, Panel, buttonClass, inputClass, statusLabel } from "../ui";
import { cn } from "../../lib/utils";

const STATUSES = ["planning", "in-progress", "review", "on-hold", "completed"];
const PRIORITIES = ["low", "medium", "high"];

const EMPTY = {
  name: "",
  client: "",
  clientEmail: "",
  status: "planning",
  priority: "medium",
  progress: 0,
  startDate: "",
  dueDate: "",
  budget: "",
  description: "",
  techStack: "",
  team: "",
  milestones: [],
};

function toForm(project) {
  return {
    name: project.name,
    client: project.client,
    clientEmail: project.clientEmail || "",
    status: project.status,
    priority: project.priority,
    progress: project.progress,
    startDate: toDateInput(project.startDate),
    dueDate: toDateInput(project.dueDate),
    budget: project.budget || "",
    description: project.description || "",
    techStack: project.techStack.join(", "),
    team: project.team.join(", "),
    milestones: project.milestones.map((m) => ({ title: m.title, dueDate: toDateInput(m.dueDate), done: m.done })),
  };
}

const splitList = (value) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function toPayload(form) {
  return {
    ...form,
    progress: Number(form.progress),
    techStack: splitList(form.techStack),
    team: splitList(form.team),
    milestones: form.milestones
      .filter((m) => m.title.trim())
      .map((m) => ({ title: m.title.trim(), dueDate: m.dueDate, done: m.done })),
  };
}

function ProjectForm({ initial, projectId }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const backTo = projectId ? `${ADMIN_BASE}/projects/${projectId}` : `${ADMIN_BASE}/projects`;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setMilestone = (index, patch) =>
    setForm((f) => ({ ...f, milestones: f.milestones.map((m, i) => (i === index ? { ...m, ...patch } : m)) }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const saved = projectId
        ? await adminApi.updateProject(projectId, toPayload(form))
        : await adminApi.createProject(toPayload(form));
      navigate(`${ADMIN_BASE}/projects/${saved._id}`);
    } catch (err) {
      setError(errorMessage(err, "Couldn't save the project."));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-xs text-ink-dim hover:text-ink">
        <ArrowLeft size={14} /> Back
      </Link>
      <PageHeader title={projectId ? "Edit project" : "New project"} />

      <Panel title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name">
            <input required value={form.name} onChange={set("name")} className={inputClass} />
          </Field>
          <Field label="Client">
            <input required value={form.client} onChange={set("client")} className={inputClass} />
          </Field>
          <Field label="Client email">
            <input type="email" value={form.clientEmail} onChange={set("clientEmail")} className={inputClass} />
          </Field>
          <Field label="Budget">
            <input value={form.budget} onChange={set("budget")} placeholder="e.g. ₹8L or $25k" className={inputClass} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea rows={4} value={form.description} onChange={set("description")} className={inputClass} />
          </Field>
        </div>
      </Panel>

      <Panel title="Status & timeline">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Status">
            <select value={form.status} onChange={set("status")} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={set("priority")} className={cn(inputClass, "capitalize")}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {statusLabel(p)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Start date">
            <input type="date" value={form.startDate} onChange={set("startDate")} className={inputClass} />
          </Field>
          <Field label="Due date">
            <input type="date" value={form.dueDate} onChange={set("dueDate")} className={inputClass} />
          </Field>
          <Field label={`Progress · ${form.progress}%`} className="sm:col-span-2 lg:col-span-4">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.progress}
              onChange={set("progress")}
              className="w-full accent-[color:var(--color-signal)]"
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Team & stack">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Team" hint="Comma separated">
            <input value={form.team} onChange={set("team")} placeholder="Karthik, Priya" className={inputClass} />
          </Field>
          <Field label="Tech stack" hint="Comma separated">
            <input value={form.techStack} onChange={set("techStack")} placeholder="React, FastAPI, PostgreSQL" className={inputClass} />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Milestones"
        action={
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, milestones: [...f.milestones, { title: "", dueDate: "", done: false }] }))}
            className="inline-flex items-center gap-1.5 text-xs text-signal hover:underline"
          >
            <Plus size={14} /> Add milestone
          </button>
        }
      >
        {form.milestones.length === 0 ? (
          <p className="text-sm text-ink-faint">No milestones yet.</p>
        ) : (
          <ul className="space-y-3">
            {form.milestones.map((m, i) => (
              <li key={i} className="grid items-center gap-3 sm:grid-cols-[auto_1fr_11rem_auto]">
                <input
                  type="checkbox"
                  checked={m.done}
                  onChange={(e) => setMilestone(i, { done: e.target.checked })}
                  aria-label="Done"
                  className="h-4 w-4 accent-[color:var(--color-signal)]"
                />
                <input
                  value={m.title}
                  onChange={(e) => setMilestone(i, { title: e.target.value })}
                  placeholder="Milestone"
                  aria-label="Milestone title"
                  className={inputClass}
                />
                <input
                  type="date"
                  value={m.dueDate}
                  onChange={(e) => setMilestone(i, { dueDate: e.target.value })}
                  aria-label="Milestone due date"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, milestones: f.milestones.filter((_, j) => j !== i) }))}
                  aria-label="Remove milestone"
                  className="justify-self-start rounded-lg p-2 text-ink-faint transition-colors hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {error && <ErrorNotice message={error} />}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={buttonClass.primary}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          {projectId ? "Save changes" : "Create project"}
        </button>
        <Link to={backTo} className={buttonClass.secondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

function EditExisting({ id }) {
  const { status, data, error, retry } = useApiResource(() => adminApi.project(id), { deps: [id] });
  if (status === "error") return <ErrorNotice message={error} onRetry={retry} />;
  if (!data || status === "loading") return <Loading />;
  return <ProjectForm key={data._id} initial={toForm(data)} projectId={id} />;
}

export default function ProjectEditor() {
  const { id } = useParams();
  return id ? <EditExisting id={id} /> : <ProjectForm initial={EMPTY} />;
}
