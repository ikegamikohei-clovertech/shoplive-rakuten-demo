import { shopliveFetch, relay } from "@/lib/shoplive";

export async function PUT(request, { params }) {
  const body = await request.json();
  const result = await shopliveFetch(`/campaign/${params.campaignKey}/product/order`, {
    method: "PUT",
    body,
  });
  return relay(result);
}
