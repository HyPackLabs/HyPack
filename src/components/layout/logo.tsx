import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  height?: number;
};

export function Logo({ className = "", height = 48 }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="HyPack"
        width={Math.round(height * (940 / 426))}
        height={height}
        priority
        className="h-auto w-auto"
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}
