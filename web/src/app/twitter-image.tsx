import { ImageResponse } from "next/og";

import { SocialCard, socialImageSize } from "@/components/social-card";

export const alt = "TakeASweet Bakery in Charlotte, North Carolina";
export const size = socialImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<SocialCard />, size);
}
