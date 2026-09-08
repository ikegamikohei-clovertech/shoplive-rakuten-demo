import { shopliveFetch, relay } from "@/lib/shoplive";

export async function POST(request) {
  const body = await request.json();
  // New live applications aren't assigned to their real store seller until a
  // Rakuten admin approves them (see design doc's approval workflow) -- until
  // then they park under this placeholder seller.
  if (!body.seller && process.env.SHOPLIVE_PLACEHOLDER_SELLER_ID) {
    body.seller = { sellerId: Number(process.env.SHOPLIVE_PLACEHOLDER_SELLER_ID) };
  }
  const result = await shopliveFetch("/campaign", { method: "POST", body });
  return relay(result);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const result = await shopliveFetch("/campaign", {
    query: {
      sellerId: searchParams.get("sellerId"),
      campaignStatus: searchParams.get("campaignStatus"),
      keyword: searchParams.get("keyword"),
      page: searchParams.get("page"),
      count: searchParams.get("count") || "20",
    },
  });
  return relay(result);
}
