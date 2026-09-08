import { shopliveFetch, relay } from "@/lib/shoplive";

export async function POST(request) {
  const body = await request.json();
  const result = await shopliveFetch("/seller", { method: "POST", body });
  return relay(result);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const result = await shopliveFetch("/seller", {
    query: {
      keyword: searchParams.get("keyword"),
      page: searchParams.get("page"),
      count: searchParams.get("count"),
    },
  });
  return relay(result);
}
