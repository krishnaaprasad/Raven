// Escape user search text before using it in a Mongo $regex (e.g. "+91…" used to throw).
export const escapeRegex = (s) => String(s ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
