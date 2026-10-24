export type CartItem = Readonly<{
  slug: string;
  quantity: number;
  selectedFlavors: readonly string[];
}>;

export type ValidatedCartItem = Readonly<{
  slug: string;
  name: string;
  quantity: number;
  selectedFlavors: readonly string[];
  unitPriceCents: number;
  lineTotalCents: number;
}>;
