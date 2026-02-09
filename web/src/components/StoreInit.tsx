"use client";

import { useEffect } from "react";
import { useStore } from "@/store/store";

export default function StoreInit() {
  const loadFromStorage = useStore((s) => s.loadFromStorage);
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  return null;
}
