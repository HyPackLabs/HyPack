import Link from "next/link";
import { Plus } from "lucide-react";

type CreateModpackButtonProps = {
  variant?: "nav" | "default" | "lg";
};

export function CreateModpackButton({
  variant = "default",
}: CreateModpackButtonProps) {
  if (variant === "nav") {
    return (
      <Link
        href="/modpacks/new"
        className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(124,58,237,0.35)] transition hover:from-violet-400 hover:to-indigo-400 hover:shadow-[0_0_32px_rgba(124,58,237,0.45)]"
      >
        <Plus className="h-4 w-4" />
        Create
      </Link>
    );
  }

  const isLarge = variant === "lg";

  return (
    <Link
      href="/modpacks/new"
      className={`inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 font-medium text-white shadow-[0_0_32px_rgba(124,58,237,0.3)] transition hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] ${
        isLarge ? "px-6 py-3.5 text-base" : "px-4 py-2.5 text-sm"
      }`}
    >
      <Plus className={isLarge ? "h-5 w-5" : "h-4 w-4"} />
      Create new modpack
    </Link>
  );
}
