export const parseAcceptanceCriteria = (body: string | null) => {
  if (!body) return [] as string[];
  const match = /##\s*acceptance criteria\s*\n([\s\S]*?)(?=\n##\s|\n*$)/i.exec(body);
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*\[[ xX]?\]\s*/, "").trim())
    .filter(Boolean);
};

export const columnFromLabels = (labels: { name: string }[]) => {
  const factoryLabel = labels.find((label) => label.name.startsWith("factory-column:"));
  if (!factoryLabel) return null;
  return factoryLabel.name.slice("factory-column:".length);
};
