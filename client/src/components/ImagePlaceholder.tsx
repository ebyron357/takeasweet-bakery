import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Placeholder for real TakeASweet photos (products, founder, events).
 * Replace by setting an imageUrl in the admin panel or swapping the src.
 */
export default function ImagePlaceholder({
  label,
  className,
  ratio = "square",
}: {
  label: string;
  className?: string;
  ratio?: "square" | "wide" | "portrait";
}) {
  const ratioClass =
    ratio === "wide" ? "aspect-[16/10]" : ratio === "portrait" ? "aspect-[4/5]" : "aspect-square";
  return (
    <div
      role="img"
      aria-label={`Photo placeholder: ${label}`}
      className={cn(
        "bg-muted border-border text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-center",
        ratioClass,
        className,
      )}
    >
      <Camera className="size-7 opacity-60" />
      <span className="max-w-[16rem] text-xs leading-snug font-semibold">{label}</span>
    </div>
  );
}
