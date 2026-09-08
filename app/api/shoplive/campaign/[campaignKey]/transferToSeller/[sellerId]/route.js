import { shopliveFetch, relay } from "@/lib/shoplive";

export async function PUT(request, { params }) {
  const { searchParams } = new URL(request.url);
  const result = await shopliveFetch(
    `/campaign/${params.campaignKey}/transferToSeller/${params.sellerId}`,
    {
      method: "PUT",
      query: { withProduct: searchParams.get("withProduct") || "true" },
    }
  );
  return relay(result);
}
