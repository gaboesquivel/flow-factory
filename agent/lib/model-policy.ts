export const GATEWAY_MODELS = {
  analyst: "deepseek/deepseek-v4.1-flash-1017",
  classifier: "deepseek/deepseek-v4.1-flash-1017",
  implementer: "deepseek/deepseek-v4-pro",
  orchestrator: "deepseek/deepseek-v4.1-flash-1017",
  researcher: "deepseek/deepseek-v4.1-flash-1017",
  reviewer: "zai/glm-5.3-flash",
} as const;

export type FactoryAgent = keyof typeof GATEWAY_MODELS;

export type ModelProfile = "gateway" | "local" | "hybrid";

export const providerPrefix = (modelId: string) => {
  const slash = modelId.indexOf("/");
  return slash === -1 ? modelId : modelId.slice(0, slash);
};

export const resolveModelProfile = (): ModelProfile => {
  const raw = (process.env.FACTORY_MODEL_PROFILE ?? "gateway").toLowerCase();
  if (raw !== "gateway" && raw !== "local" && raw !== "hybrid") {
    throw new Error(
      `FACTORY_MODEL_PROFILE must be gateway, local, or hybrid; got '${raw}'.`
    );
  }
  if (process.env.VERCEL && raw !== "gateway") {
    throw new Error(
      "Cloud deployments must use FACTORY_MODEL_PROFILE=gateway (localhost models are unreachable)."
    );
  }
  return raw;
};

export const assertIndependentReview = ({
  implementerId,
  reviewerId,
  implementerVendor,
  reviewerVendor,
}: {
  implementerId: string;
  reviewerId: string;
  implementerVendor: string;
  reviewerVendor: string;
}) => {
  if (implementerId === reviewerId) {
    throw new Error(
      "Implementer and reviewer must not share the same model id for independent review."
    );
  }
  if (implementerVendor === reviewerVendor) {
    throw new Error(
      `Implementer and reviewer must use different model vendor families (got '${implementerVendor}' for both).`
    );
  }
};
