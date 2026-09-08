import { shopliveFetch, relay } from "@/lib/shoplive";

export async function POST(request, { params }) {
  const result = await shopliveFetch(`/console/${params.campaignKey}/end`, {
    method: "POST",
  });
  return relay(result);
}
