export interface OverpassResult {
  name: string;
  brand: string;
  lat: number;
  lon: number;
}

const BRANDS = [
  "Buc-ee's",
  "Pilot Flying J",
  "Pilot",
  "Flying J",
  "Love's Travel Stop",
  "Love's",
  "Sheetz",
  "Wawa",
  "QuikTrip",
  "Casey's",
  "Kwik Trip",
  "Kum & Go",
  "Kum and Go",
  "Speedway",
  "Circle K",
  "7-Eleven",
  "TA Travel Center",
  "TravelCenters of America",
  "Petro Stopping Center",
  "Petro",
];

const BRANDS_LOWER = BRANDS.map((b) => b.toLowerCase());

function matchesBrand(value: string): string | null {
  const lower = value.toLowerCase();
  for (let i = 0; i < BRANDS_LOWER.length; i++) {
    if (lower.includes(BRANDS_LOWER[i])) return BRANDS[i];
  }
  return null;
}

function buildQuery(lat: number, lon: number, radiusMeters: number): string {
  // Query all fuel stations and toilets — filter by brand client-side
  // Regex on nwr is too expensive and causes Overpass to time out
  return `
[out:json][timeout:25];
(
  node["amenity"="fuel"](around:${radiusMeters},${lat},${lon});
  way["amenity"="fuel"](around:${radiusMeters},${lat},${lon});
  node["amenity"="toilets"](around:${radiusMeters},${lat},${lon});
  way["amenity"="toilets"](around:${radiusMeters},${lat},${lon});
);
out center;
`.trim();
}

export async function queryOverpass(
  lat: number,
  lon: number,
  radiusMeters: number = 32000
): Promise<OverpassResult[]> {
  const query = buildQuery(lat, lon, radiusMeters);
  console.log("[Overpass] Query:\n", query);

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  console.log("[Overpass] Fetching URL length:", url.length);

  let res: Response;
  try {
    res = await fetch(url);
  } catch (fetchErr) {
    console.error("[Overpass] Fetch failed (network/CORS):", fetchErr);
    throw new Error("Network error reaching Overpass API. Check browser console for CORS details.");
  }

  console.log("[Overpass] Response status:", res.status, res.statusText);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("[Overpass] Error body:", errorBody);
    throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
  }

  let data: { elements?: Array<Record<string, unknown>> };
  try {
    data = await res.json();
  } catch (parseErr) {
    console.error("[Overpass] JSON parse failed:", parseErr);
    throw new Error("Failed to parse Overpass response");
  }

  console.log("[Overpass] Raw response elements:", data.elements?.length ?? 0);

  const results: OverpassResult[] = [];
  const seen = new Set<string>();
  let skippedNoLatLon = 0;
  let skippedNoBrand = 0;
  let skippedDupe = 0;

  for (const el of data.elements as Array<Record<string, unknown>>) {
    // Nodes have lat/lon directly; ways/relations have them in .center
    const elLat = (el.lat ?? (el.center as Record<string, number>)?.lat) as number | undefined;
    const elLon = (el.lon ?? (el.center as Record<string, number>)?.lon) as number | undefined;

    if (!elLat || !elLon) {
      skippedNoLatLon++;
      continue;
    }

    const tags = (el.tags ?? {}) as Record<string, string>;
    const isToilet = tags.amenity === "toilets";
    const name = tags.name || tags.brand || (isToilet ? "Public Restroom" : "Unknown");
    const brand = tags.brand || matchesBrand(name) || "";

    // Client-side brand filtering: skip if no recognized brand (unless it's a toilet)
    if (!isToilet) {
      const brandMatch = matchesBrand(brand) || matchesBrand(name);
      if (!brandMatch) {
        skippedNoBrand++;
        continue;
      }
    }

    // Deduplicate by approximate location
    const key = `${name}:${elLat.toFixed(4)}:${elLon.toFixed(4)}`;
    if (seen.has(key)) {
      skippedDupe++;
      continue;
    }
    seen.add(key);

    results.push({ name, brand, lat: elLat, lon: elLon });
  }

  console.log("[Overpass] Parsing summary — noLatLon:", skippedNoLatLon, "noBrand:", skippedNoBrand, "dupes:", skippedDupe, "kept:", results.length);

  return results;
}
