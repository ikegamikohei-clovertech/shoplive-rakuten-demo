import { shopliveFetch, relay } from "@/lib/shoplive";

export async function POST(request) {
  const body = await request.json();
  const result = await shopliveFetch("/product", { method: "POST", body });
  return relay(result);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const result = await shopliveFetch("/product", {
    query: {
      name: searchParams.get("name"),
      sellerId: searchParams.get("sellerId"),
      page: searchParams.get("page"),
      count: searchParams.get("count") || "50",
    },
  });
  return relay(result);
}
