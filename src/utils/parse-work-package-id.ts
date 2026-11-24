export function parseWorkPackageId(raw?: string | null): number | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const fromUrl = trimmed.match(/work_packages\/(\d+)/i);
  if (fromUrl) return Number(fromUrl[1]);

  const fromHash = trimmed.match(/#(\d+)\b/);
  if (fromHash) return Number(fromHash[1]);

  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  return undefined;
}
