import { shopliveFetch, relay } from "@/lib/shoplive";

export async function GET(request, { params }) {
  const result = await shopliveFetch(`/campaign/${params.campaignKey}/stats`);
  return relay(result);
}
