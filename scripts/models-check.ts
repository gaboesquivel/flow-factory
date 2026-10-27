import { resolveModelProfile } from "../agent/lib/model-policy.js";
import { readLocalModelId } from "../agent/lib/models.js";

const listLocalModels = async (baseURL: string) => {
  const url = new URL(
    "/models",
    baseURL.endsWith("/") ? baseURL : `${baseURL}/`
  );
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Local server returned ${response.status} for ${url}`);
  }
  const body = (await response.json()) as { data?: { id?: string }[] };
  return new Set(
    (body.data ?? [])
      .map((entry) => entry.id)
      .filter((id): id is string => typeof id === "string")
  );
};

const main = async () => {
  const profile = resolveModelProfile();
  if (profile === "gateway") {
    console.log(
      "FACTORY_MODEL_PROFILE=gateway — no local model probe required."
    );
    return;
  }

  const baseURL = process.env.FACTORY_LOCAL_BASE_URL?.trim();
  if (!baseURL) {
    console.error("FACTORY_LOCAL_BASE_URL is not set.");
    process.exit(1);
  }

  const available = await listLocalModels(baseURL);
  const stations =
    profile === "hybrid"
      ? (["orchestrator", "classifier"] as const)
      : ([
          "orchestrator",
          "classifier",
          "analyst",
          "researcher",
          "implementer",
          "reviewer",
        ] as const);

  let missing = 0;
  for (const station of stations) {
    const modelId = readLocalModelId(station);
    const ok = available.has(modelId);
    console.log(`${station}: ${modelId} — ${ok ? "available" : "MISSING"}`);
    if (!ok) {
      missing += 1;
    }
  }

  if (missing > 0) {
    console.error(
      `${missing} configured local model(s) are not reported by ${baseURL}. Pull or serve them before relying on the local profile.`
    );
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
