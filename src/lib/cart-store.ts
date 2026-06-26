import { useSyncExternalStore } from "react";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  flavor: string;
  qty: number;
};

type State = {
  items: CartItem[];
  open: boolean;
};

const STORAGE_KEY = "iz-cart-v1";

function loadInitial(): State {
  if (typeof window === "undefined") return { items: [], open: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], open: false };
    const parsed = JSON.parse(raw) as { items?: CartItem[] };
    return { items: Array.isArray(parsed.items) ? parsed.items : [], open: false };
  } catch {
    return { items: [], open: false };
  }
}

let state: State = loadInitial();
const listeners = new Set<() => void>();

function persist(s: State) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: s.items }));
  } catch {
    /* ignore */
  }
}

function setState(updater: (s: State) => State) {
  state = updater(state);
  persist(state);
  listeners.forEach((l) => l());
}

const serverSnapshot: State = { items: [], open: false };

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  },
  getServerSnapshot() {
    return serverSnapshot;
  },
  add(item: CartItem) {
    setState((s) => {
      const key = `${item.slug}-${item.size}-${item.flavor}`;
      const existing = s.items.find((i) => `${i.slug}-${i.size}-${i.flavor}` === key);
      if (existing) {
        return {
          ...s,
          open: true,
          items: s.items.map((i) =>
            `${i.slug}-${i.size}-${i.flavor}` === key ? { ...i, qty: i.qty + item.qty } : i
          ),
        };
      }
      return { ...s, open: true, items: [...s.items, item] };
    });
  },
  updateQty(key: string, qty: number) {
    setState((s) => ({
      ...s,
      items: s.items
        .map((i) => (`${i.slug}-${i.size}-${i.flavor}` === key ? { ...i, qty } : i))
        .filter((i) => i.qty > 0),
    }));
  },
  remove(key: string) {
    setState((s) => ({
      ...s,
      items: s.items.filter((i) => `${i.slug}-${i.size}-${i.flavor}` !== key),
    }));
  },
  clear() {
    setState((s) => ({ ...s, items: [] }));
  },
  setOpen(open: boolean) {
    setState((s) => ({ ...s, open }));
  },
};

export function useCart() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
}

export function itemKey(i: CartItem) {
  return `${i.slug}-${i.size}-${i.flavor}`;
}
