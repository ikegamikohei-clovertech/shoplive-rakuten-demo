// Rakuten-side data that Shoplive has no concept of (application/approval status).
// Demo-only: kept in the browser's localStorage, never synced to a real database.

const KEYS = {
  storeApplications: "onair:storeApplications",
  liveApplications: "onair:liveApplications",
  currentSellerId: "onair:currentSellerId",
};

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// --- Store applications (account signup / approval) ---

export function listStoreApplications() {
  return read(KEYS.storeApplications, []);
}

export function addStoreApplication({ storeName, storeUrl, liveOverview }) {
  const list = listStoreApplications();
  const application = {
    id: newId("store"),
    storeName,
    storeUrl,
    liveOverview,
    status: "審査中",
    sellerId: null,
    createdAt: new Date().toISOString(),
  };
  write(KEYS.storeApplications, [application, ...list]);
  return application;
}

export function updateStoreApplication(id, patch) {
  const list = listStoreApplications();
  const next = list.map((item) => (item.id === id ? { ...item, ...patch } : item));
  write(KEYS.storeApplications, next);
  return next.find((item) => item.id === id);
}

export function listApprovedSellers() {
  return listStoreApplications()
    .filter((item) => item.status === "承認" && item.sellerId)
    .map((item) => ({
      sellerId: item.sellerId,
      storeName: item.storeName,
      storeApplicationId: item.id,
    }));
}

// --- Live applications (new-live requests, pre-approval) ---

export function listLiveApplications() {
  return read(KEYS.liveApplications, []);
}

export function getLiveApplication(id) {
  return listLiveApplications().find((item) => item.id === id) || null;
}

export function addLiveApplication(data) {
  const list = listLiveApplications();
  const application = {
    id: newId("live"),
    status: "審査中",
    createdAt: new Date().toISOString(),
    ...data,
  };
  write(KEYS.liveApplications, [application, ...list]);
  return application;
}

export function updateLiveApplication(id, patch) {
  const list = listLiveApplications();
  const next = list.map((item) => (item.id === id ? { ...item, ...patch } : item));
  write(KEYS.liveApplications, next);
  return next.find((item) => item.id === id);
}

// --- Current seller (store-side "which of my shops am I acting as") ---

export function getCurrentSellerId() {
  return read(KEYS.currentSellerId, null);
}

export function setCurrentSellerId(sellerId) {
  write(KEYS.currentSellerId, sellerId);
}
