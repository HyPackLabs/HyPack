import Link from "next/link";
import { GuidesNav } from "@/components/layout/guides-nav";
import { HeaderActions } from "@/components/layout/header-actions";
import { Logo } from "@/components/layout/logo";

const navLinks = [
  { label: "Explore", href: "/explore" },
  { label: "Blog", href: "/blog" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Logo height={48} />

        <nav
          aria-label="Main"
          className="hidden flex-1 items-center justify-center gap-6 text-sm text-zinc-400 md:flex lg:gap-8"
        >
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <GuidesNav />
        </nav>

        <HeaderActions />
      </div>
    </header>
  );
}
