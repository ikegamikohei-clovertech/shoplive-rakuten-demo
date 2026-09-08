import { shopliveFetch, relay } from "@/lib/shoplive";

export async function PUT(request, { params }) {
  const { searchParams } = new URL(request.url);
  const body = await request.json();
  const result = await shopliveFetch(
    `/console/${params.campaignKey}/product/stockStatus`,
    {
      method: "PUT",
      query: { stockStatus: searchParams.get("stockStatus") },
      body,
    }
  );
  return relay(result);
}
