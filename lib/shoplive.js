import { NextResponse } from "next/server";

const BASE_URL = "https://private.shopliveapi.com/v2";

function buildUrl(path, query) {
  const accessKey = process.env.SHOPLIVE_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("SHOPLIVE_ACCESS_KEY is not set");
  }
  const url = new URL(`${BASE_URL}/${accessKey}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// Thin server-side proxy to the Shoplive API. Keeps AccessKey/JWT out of the browser.
export async function shopliveFetch(path, { method = "GET", query, body } = {}) {
  const jwt = process.env.SHOPLIVE_JWT_TOKEN;
  if (!jwt) {
    throw new Error("SHOPLIVE_JWT_TOKEN is not set");
  }
  const url = buildUrl(path, query);
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text();
  let data = raw;
  if (contentType.includes("application/json") && raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  return { ok: res.ok, status: res.status, data };
}

// Route handlers call this to relay a Shoplive response straight to the browser.
export function relay(result) {
  return NextResponse.json(
    typeof result.data === "string" ? { message: result.data } : result.data,
    { status: result.status }
  );
}
