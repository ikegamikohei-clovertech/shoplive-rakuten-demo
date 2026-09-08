import { shopliveFetch, relay } from "@/lib/shoplive";

export async function POST(request, { params }) {
  const body = await request.json();
  const result = await shopliveFetch(`/campaign/${params.campaignKey}/product`, {
    method: "POST",
    body,
  });
  return relay(result);
}

export async function DELETE(request, { params }) {
  const body = await request.json();
  const result = await shopliveFetch(`/campaign/${params.campaignKey}/product`, {
    method: "DELETE",
    body,
  });
  return relay(result);
}
