import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import {
  assertIndependentReview,
  type FactoryAgent,
  GATEWAY_MODELS,
  type ModelProfile,
  providerPrefix,
  resolveModelProfile,
} from "./model-policy.js";

const FACTORY_AGENTS = Object.keys(GATEWAY_MODELS) as FactoryAgent[];

const localModelEnvKey = (agent: FactoryAgent) =>
  `FACTORY_LOCAL_MODEL_${agent.toUpperCase()}`;

const localContextEnvKey = (agent: FactoryAgent) =>
  `FACTORY_LOCAL_CONTEXT_${agent.toUpperCase()}`;

export const readLocalModelId = (agent: FactoryAgent) => {
  const key = localModelEnvKey(agent);
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(
      `${key} is required for station '${agent}' when FACTORY_MODEL_PROFILE is ${resolveModelProfile()}.`
    );
  }
  return value;
};

export const readLocalContextTokens = (agent: FactoryAgent) => {
  const key = localContextEnvKey(agent);
  const raw = process.env[key]?.trim() ?? "65536";
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive integer; got '${raw}'.`);
  }
  return parsed;
};

export const localVendorLabel = (agent: FactoryAgent, modelId: string) =>
  process.env[`FACTORY_LOCAL_VENDOR_${agent.toUpperCase()}`]?.trim() ?? modelId;

const stationUsesLocal = (agent: FactoryAgent, profile: ModelProfile) => {
  if (profile === "gateway") {
    return false;
  }
  if (profile === "local") {
    return true;
  }
  return agent === "orchestrator" || agent === "classifier";
};

let localProvider: ReturnType<typeof createOpenAICompatible> | null = null;

const getLocalProvider = () => {
  if (localProvider) {
    return localProvider;
  }
  const baseURL = process.env.FACTORY_LOCAL_BASE_URL?.trim();
  if (!baseURL) {
    throw new Error(
      "FACTORY_LOCAL_BASE_URL is required when FACTORY_MODEL_PROFILE is local or hybrid."
    );
  }
  localProvider = createOpenAICompatible({
    baseURL,
    includeUsage: true,
    name: "local",
  });
  return localProvider;
};

const validateProfileAtLoad = () => {
  const profile = resolveModelProfile();
  if (profile === "gateway" || profile === "hybrid") {
    assertIndependentReview({
      implementerId: GATEWAY_MODELS.implementer,
      implementerVendor: providerPrefix(GATEWAY_MODELS.implementer),
      reviewerId: GATEWAY_MODELS.reviewer,
      reviewerVendor: providerPrefix(GATEWAY_MODELS.reviewer),
    });
  }
  if (profile === "local") {
    for (const agent of FACTORY_AGENTS) {
      readLocalModelId(agent);
    }
    assertIndependentReview({
      implementerId: readLocalModelId("implementer"),
      implementerVendor: localVendorLabel(
        "implementer",
        readLocalModelId("implementer")
      ),
      reviewerId: readLocalModelId("reviewer"),
      reviewerVendor: localVendorLabel(
        "reviewer",
        readLocalModelId("reviewer")
      ),
    });
  }
  if (profile === "hybrid") {
    readLocalModelId("orchestrator");
    readLocalModelId("classifier");
  }
};

validateProfileAtLoad();

export const stationModel = (agent: FactoryAgent): string | LanguageModel => {
  const profile = resolveModelProfile();
  if (stationUsesLocal(agent, profile)) {
    return getLocalProvider()(readLocalModelId(agent));
  }
  return GATEWAY_MODELS[agent];
};

export const stationContextWindow = (agent: FactoryAgent) => {
  const profile = resolveModelProfile();
  if (!stationUsesLocal(agent, profile)) {
    return;
  }
  return readLocalContextTokens(agent);
};

export const stationAgentConfig = (agent: FactoryAgent) => {
  const model = stationModel(agent);
  const modelContextWindowTokens = stationContextWindow(agent);
  return modelContextWindowTokens === undefined
    ? { model }
    : { model, modelContextWindowTokens };
};

/** @deprecated Use {@link stationModel}. */
export const MODELS = GATEWAY_MODELS;
