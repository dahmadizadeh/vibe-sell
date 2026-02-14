export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 40);
}

export function formatCompanySize(size: number): string {
  if (size >= 10000) return `${Math.round(size / 1000)}K employees`;
  if (size >= 1000) return `${(size / 1000).toFixed(1).replace(/\.0$/, "")}K employees`;
  return `${size} employees`;
}

export function formatSizeRange(min: number, max: number): string {
  return `${min.toLocaleString()}–${max.toLocaleString()} employees`;
}

export function uniqueCompanies(contacts: { company: string }[]): number {
  return new Set(contacts.map((c) => c.company)).size;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 1) + "…";
}

export function companySlug(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function staggerDelay(index: number, baseMs: number = 50): string {
  return `${index * baseMs}ms`;
}
