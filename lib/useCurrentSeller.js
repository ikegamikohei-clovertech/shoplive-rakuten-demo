"use client";

import { useEffect, useState } from "react";
import { listApprovedSellers, getCurrentSellerId, setCurrentSellerId } from "@/lib/mockStore";

// Resolves "which of my approved shops am I acting as right now" for store-side pages.
export function useCurrentSeller() {
  const [seller, setSeller] = useState(undefined); // undefined = loading, null = none

  useEffect(() => {
    const list = listApprovedSellers();
    const stored = getCurrentSellerId();
    const found = list.find((s) => String(s.sellerId) === String(stored)) || list[0] || null;
    if (found && String(found.sellerId) !== String(stored)) {
      setCurrentSellerId(found.sellerId);
    }
    setSeller(found);
  }, []);

  return seller;
}
