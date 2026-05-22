import Image from "next/image";
import { Package } from "lucide-react";

type ModpackIconProps = {
  iconUrl?: string | null;
  title: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-11 w-11 rounded-xl",
  md: "h-16 w-16 rounded-xl",
  lg: "h-24 w-24 rounded-2xl",
} as const;

const iconSizes = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-10 w-10",
} as const;

const imageSizes = {
  sm: 44,
  md: 64,
  lg: 96,
} as const;

export function ModpackIcon({
  iconUrl,
  title,
  size = "sm",
}: ModpackIconProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-violet-500/15 ring-1 ring-violet-400/20 ${sizeClasses[size]}`}
    >
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt={`${title} icon`}
          width={imageSizes[size]}
          height={imageSizes[size]}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        <Package className={`text-violet-300 ${iconSizes[size]}`} />
      )}
    </span>
  );
}
