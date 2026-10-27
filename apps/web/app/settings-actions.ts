"use server";

import { revalidatePath } from "next/cache";

import { factoryFetch } from "../lib/factory-api";

export const configureGithubAction = async ({
  owner,
  repo,
  projectNumber,
}: {
  owner: string;
  repo: string;
  projectNumber: string;
}) => {
  const result = await factoryFetch("/v1/github/config", {
    method: "POST",
    body: {
      owner,
      repo,
      projectNumber: projectNumber.trim() ? Number(projectNumber) : null,
    },
  });
  revalidatePath("/settings");
  revalidatePath("/");
  return result;
};

export const pauseFactoryAction = async () => {
  const result = await factoryFetch("/v1/factory/pause", { method: "POST" });
  revalidatePath("/settings");
  revalidatePath("/");
  return result;
};

export const resumeFactoryAction = async () => {
  const result = await factoryFetch("/v1/factory/resume", { method: "POST" });
  revalidatePath("/settings");
  revalidatePath("/");
  return result;
};
