import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const apiBase = process.env.FLOW_FACTORY_URL ?? "http://127.0.0.1:3747";
const tokenPath = join(process.cwd(), "../../.data-playwright/local.token");

test.beforeAll(async () => {
  const token = readFileSync(tokenPath, "utf8").trim();
  const response = await fetch(`${apiBase}/v1/tasks`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      id: "gaboesquivel/flow-factory#9999",
      title: "Playwright drag task",
      column: "backlog",
      blocked: false,
      body: "",
      acceptanceCriteria: [],
    }),
  });
  if (!response.ok) throw new Error(`seed task failed: ${response.status}`);
});

test("home shows status panel and sync", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("factory-home")).toBeVisible();
  await expect(page.getByTestId("factory-status")).toContainText(/Factory running/i);
  await expect(page.getByTestId("sync-github")).toBeVisible();
  await expect(page.getByTestId("task-board")).toBeVisible();
  await expect(page.getByText("Playwright drag task")).toBeVisible();
});

test("drag task updates Kanban column", async ({ page }) => {
  await page.goto("/");
  const card = page.locator("li").filter({ hasText: "Playwright drag task" });
  const readyColumn = page.getByTestId("kanban-column-ready");
  await card.dragTo(readyColumn);
  await expect(page.getByRole("status")).toContainText(/Moved to Ready/i);
  await expect(readyColumn.getByText("Playwright drag task")).toBeVisible();
});
