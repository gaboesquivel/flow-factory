import { readFileSync } from "node:fs";

export const extractSlashCommand = (human) => {
  const token = human.trim().split(/\s+/u)[0] ?? "";
  if (!/^\/[a-z0-9][a-z0-9-]*$/iu.test(token)) return null;
  return token.toLowerCase();
};

export const extractSkillsLoaded = (text) => {
  const marker = "**Skills loaded**";
  const index = text.indexOf(marker);
  if (index === -1) return [];
  const names = [];
  for (const match of text
    .slice(index + marker.length)
    .matchAll(/`([^`\n]+)`/gu)) {
    const name = match[1].trim();
    if (name && name.toLowerCase() !== "none") names.push(name);
  }
  return [...new Set(names)];
};

const modelString = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || /[\r\n]/u.test(trimmed) || trimmed.length > 120) return null;
  return trimmed;
};

export const extractExposedModel = (sources) => {
  for (const source of sources) {
    const model = modelString(source);
    if (model) return model;
  }
  return null;
};

const extractUserQuery = (text) => {
  const match = text.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/u);
  const raw = match ? match[1].trim() : text.trim();
  return raw.replace(/<timestamp>[\s\S]*?<\/timestamp>\s*/u, "").trim();
};

const textFromMessage = (message) => {
  const parts = message?.content ?? [];
  return parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
};

const summarizeAgent = (text) => {
  const withoutSkills =
    text.split(/\n---\n\*\*Skills loaded\*\*/u)[0]?.trim() ?? text;
  const taskReport = withoutSkills.match(/\*\*Task report\*\*[\s\S]*/u)?.[0];
  if (taskReport) {
    const outcome = taskReport.match(/\*\*Outcome\*\*[^\n]*\n+([^\n#]+)/u)?.[1];
    if (outcome) return outcome.trim();
    const firstLine = taskReport
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith("**"));
    if (firstLine) return firstLine.slice(0, 400);
  }
  const line = withoutSkills
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return (line ?? withoutSkills).slice(0, 400);
};

export const parseLastTurnFromTranscript = (transcriptPath) => {
  const lines = readFileSync(transcriptPath, "utf-8")
    .split("\n")
    .filter((line) => line.trim());

  let lastUser = "";
  let lastAssistant = "";
  let model = null;
  for (const line of lines) {
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    if (row.type === "turn_ended") continue;
    const exposed = extractExposedModel([row.model, row.message?.model]);
    if (exposed) model = exposed;
    if (row.role === "user") {
      const text = textFromMessage(row.message);
      if (text) lastUser = extractUserQuery(text);
    }
    if (row.role === "assistant") {
      const text = textFromMessage(row.message);
      if (text && !text.startsWith("[REDACTED]")) lastAssistant = text;
    }
  }

  if (!lastUser) return null;
  return {
    agent: summarizeAgent(
      lastAssistant || "(hook: no assistant text in transcript)"
    ),
    command: extractSlashCommand(lastUser),
    human: lastUser,
    model,
    skills: extractSkillsLoaded(lastAssistant),
  };
};
