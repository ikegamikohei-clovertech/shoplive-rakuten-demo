import { shopliveFetch, relay } from "@/lib/shoplive";

export async function PUT(request, { params }) {
  const { searchParams } = new URL(request.url);
  const body = await request.json();
  const result = await shopliveFetch(`/console/${params.campaignKey}/product/show`, {
    method: "PUT",
    query: { show: searchParams.get("show") || "true" },
    body,
  });
  return relay(result);
}
