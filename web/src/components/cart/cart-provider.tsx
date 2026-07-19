"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartItem } from "@/types/cart";

const storageKey = "takeasweet-cart-v1";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  isReady: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return [];
    const value: unknown = JSON.parse(stored);
    if (!Array.isArray(value)) return [];

    return value.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof item.slug === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 20 &&
        Array.isArray(item.selectedFlavors) &&
        item.selectedFlavors.every(
          (flavor: unknown) => typeof flavor === "string"
        )
    );
  } catch {
    return [];
  }
}

function lineKey(item: CartItem) {
  return `${item.slug}:${[...item.selectedFlavors].sort().join("|")}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [isReady, items]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((current) => {
      const key = lineKey(newItem);
      const existingIndex = current.findIndex((item) => lineKey(item) === key);
      if (existingIndex === -1) return [...current, newItem];

      return current.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity: Math.min(20, item.quantity + newItem.quantity),
            }
          : item
      );
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    const safeQuantity = Math.min(20, Math.max(1, Math.trunc(quantity)));
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: safeQuantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      isReady,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, itemCount, isReady, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider.");
  return context;
}
