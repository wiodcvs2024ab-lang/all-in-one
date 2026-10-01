import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const RUN_ID = "X-Lovable-AIG-Run-ID";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
    return res;
  };
}

export type CatalogItem = { id: string; name: string; category: string; price: number; description: string | null };

export async function recommendFromCatalog(need: string, catalog: CatalogItem[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });
  const list = catalog
    .map((s) => `${s.id} | ${s.name} | ${s.category} | ₹${s.price} | ${(s.description ?? "").slice(0, 120)}`)
    .join("\n");
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system:
      "You match a customer's home-service need to a catalog. Reply ONLY with JSON: " +
      '{"picks":[{"id":"<catalog id>","reason":"<one short sentence>"}]}. ' +
      "Pick up to 4 best matches, only ids from the catalog. If nothing fits, return an empty picks array.",
    prompt: `Catalog (id | name | category | price | description):\n${list}\n\nCustomer need: ${need}`,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text;
  const match = text.match(/\{[\s\S]*\}/);
  let picks: { id: string; reason: string }[] = [];
  try {
    picks = JSON.parse(match?.[0] ?? "{}").picks ?? [];
  } catch {
    picks = [];
  }
  const ids = new Set(catalog.map((c) => c.id));
  return picks.filter((p) => ids.has(String(p.id))).slice(0, 4).map((p) => ({ id: String(p.id), reason: String(p.reason ?? "") }));
}
