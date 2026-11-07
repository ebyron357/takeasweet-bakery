import {
  CalendarHeart,
  Info,
  PackageX,
  ReceiptText,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { OrderInfoIcon } from "@shared/site-settings";

/** Icon and Admin label for each Order Information icon choice. */
export const ORDER_INFO_ICON_OPTIONS: Record<OrderInfoIcon, { label: string; Icon: LucideIcon }> = {
  pickup: { label: "Pickup", Icon: Store },
  delivery: { label: "Delivery", Icon: Truck },
  noShipping: { label: "No shipping", Icon: PackageX },
  customOrders: { label: "Custom orders", Icon: CalendarHeart },
  payment: { label: "Payment", Icon: ReceiptText },
  info: { label: "General", Icon: Info },
};
