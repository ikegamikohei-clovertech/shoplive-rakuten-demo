import { shopliveFetch, relay } from "@/lib/shoplive";

export async function GET(request, { params }) {
  const result = await shopliveFetch(`/campaign/${params.campaignKey}`);
  return relay(result);
}

export async function PUT(request, { params }) {
  const body = await request.json();
  const result = await shopliveFetch(`/campaign/${params.campaignKey}`, {
    method: "PUT",
    body,
  });
  return relay(result);
}
