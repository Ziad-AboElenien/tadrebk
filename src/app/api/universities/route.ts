export const dynamic = 'force-dynamic';

const ROR_API = 'https://api.ror.org/v2/organizations?query=university&filter=country.country_code:EG&page=%d';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface RorName {
  value?: string;
  types?: string[];
}

interface RorOrg {
  names?: RorName[];
}

interface RorResponse {
  items?: RorOrg[];
  number_of_results?: number;
}

function getDisplayName(names: RorName[]): string | undefined {
  return (
    names.find((n) => n.types?.includes('ror_display'))?.value?.trim() ||
    names.find((n) => n.types?.includes('label'))?.value?.trim() ||
    names[0]?.value?.trim()
  );
}

function toNames(items: RorOrg[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const item of items) {
    const name = getDisplayName(item.names ?? []);
    if (name && !seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

async function fetchRorPage(page: number): Promise<RorResponse> {
  const res = await fetch(ROR_API.replace('%d', String(page)), {
    headers: { 'User-Agent': 'tadrebk/1.0' },
    next: { revalidate: CACHE_TTL_MS / 1000 },
  });
  if (!res.ok) throw new Error(`ROR request failed with status ${res.status}`);
  return res.json() as Promise<RorResponse>;
}

// ROR returns ~20 results per page; follow the pages until we have them all.
async function fetchAllFromRor(): Promise<string[]> {
  const first = await fetchRorPage(1);
  const names = toNames(first.items ?? []);
  const total = first.number_of_results ?? names.length;
  const perPage = Math.max(first.items?.length ?? 20, 1);
  const pages = Math.ceil(total / perPage);
  for (let p = 2; p <= pages; p++) {
    names.push(...toNames((await fetchRorPage(p)).items ?? []));
  }
  return [...new Set(names)];
}

let cache: { names: string[]; fetchedAt: number } | null = null;

export async function GET() {
  try {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      return Response.json(cache.names);
    }
    const names = await fetchAllFromRor();
    cache = { names, fetchedAt: Date.now() };
    return Response.json(names);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to load universities' },
      { status: 502 },
    );
  }
}
