const BLOCKED = [
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "nigger",
  "faggot",
  "rape",
];

function maskBlockedWords(value: string): string {
  return BLOCKED.reduce(
    (text, word) => text.replace(new RegExp(word, "gi"), "*".repeat(word.length)),
    value,
  );
}

function collapse(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
}

export function sanitizeTitle(value: string, fallback = "Untitled Game"): string {
  const cleaned = maskBlockedWords(collapse(value)).slice(0, 60);
  return cleaned.length >= 2 ? cleaned : fallback;
}

export function sanitizeCreatorName(value: string | undefined): string {
  if (!value) return "Anonymous";
  const cleaned = maskBlockedWords(collapse(value)).slice(0, 32);
  return cleaned.length >= 2 ? cleaned : "Anonymous";
}

export function normalizeObjectLabel(label: string): string {
  return collapse(label)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/s$/, "");
}
