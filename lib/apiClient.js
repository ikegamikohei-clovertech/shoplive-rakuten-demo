// Browser-side helper for calling our own /api/shoplive/* proxy routes.
async function call(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?._e || data?.message || `Shoplive API error (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const shopliveApi = {
  createSeller: (payload) => call("/api/shoplive/seller", { method: "POST", body: payload }),
  searchSellers: (query = {}) => call(`/api/shoplive/seller?${new URLSearchParams(query)}`),
  searchCampaigns: (query) => call(`/api/shoplive/campaign?${new URLSearchParams(query)}`),
  createCampaign: (payload) => call("/api/shoplive/campaign", { method: "POST", body: payload }),
  getCampaign: (campaignKey) => call(`/api/shoplive/campaign/${campaignKey}`),
  updateCampaign: (campaignKey, payload) =>
    call(`/api/shoplive/campaign/${campaignKey}`, { method: "PUT", body: payload }),
  addProducts: (campaignKey, items) =>
    call(`/api/shoplive/campaign/${campaignKey}/product`, { method: "POST", body: items }),
  removeProducts: (campaignKey, items) =>
    call(`/api/shoplive/campaign/${campaignKey}/product`, { method: "DELETE", body: items }),
  reorderProducts: (campaignKey, items) =>
    call(`/api/shoplive/campaign/${campaignKey}/product/order`, { method: "PUT", body: items }),
  transferToSeller: (campaignKey, sellerId, withProduct = true) =>
    call(
      `/api/shoplive/campaign/${campaignKey}/transferToSeller/${sellerId}?withProduct=${withProduct}`,
      { method: "PUT" }
    ),
  getStats: (campaignKey) => call(`/api/shoplive/campaign/${campaignKey}/stats`),
  startBroadcast: (campaignKey, rehearsal = false) =>
    call(`/api/shoplive/console/${campaignKey}/start?rehearsal=${rehearsal}`, { method: "POST" }),
  endBroadcast: (campaignKey) =>
    call(`/api/shoplive/console/${campaignKey}/end`, { method: "POST" }),
  setStockStatus: (campaignKey, stockStatus, items) =>
    call(`/api/shoplive/console/${campaignKey}/product/stockStatus?stockStatus=${stockStatus}`, {
      method: "PUT",
      body: items,
    }),
  setShowNow: (campaignKey, show, items) =>
    call(`/api/shoplive/console/${campaignKey}/product/show?show=${show}`, {
      method: "PUT",
      body: items,
    }),
  searchProducts: (query) => call(`/api/shoplive/product?${new URLSearchParams(query)}`),
  createProducts: (items) => call("/api/shoplive/product", { method: "POST", body: items }),
};
