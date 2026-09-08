import { shopliveFetch, relay } from "@/lib/shoplive";

export async function POST(request, { params }) {
  const { searchParams } = new URL(request.url);
  const result = await shopliveFetch(`/console/${params.campaignKey}/start`, {
    method: "POST",
    query: { rehearsal: searchParams.get("rehearsal") || "false" },
  });
  return relay(result);
}
