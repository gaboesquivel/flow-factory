import { FactoryHome } from "./factory-home";

const apiBase = process.env.FLOW_FACTORY_URL ?? "http://127.0.0.1:3747";

export default async () => {
  let status: Record<string, unknown> | null = null;
  let tasks: unknown[] = [];
  let error: string | null = null;

  try {
    const [statusRes, tasksRes] = await Promise.all([
      fetch(`${apiBase}/v1/factory/status`, { cache: "no-store" }),
      fetch(`${apiBase}/v1/tasks`, { cache: "no-store" }),
    ]);
    if (!statusRes.ok) throw new Error(`status ${statusRes.status}`);
    if (!tasksRes.ok) throw new Error(`tasks ${tasksRes.status}`);
    status = await statusRes.json();
    const tasksBody = await tasksRes.json();
    tasks = tasksBody.tasks ?? [];
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "Service unavailable";
  }

  return <FactoryHome status={status} tasks={tasks} error={error} />;
};
