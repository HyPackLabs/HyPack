import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/layout/logo";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#080808]">
      <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-6">
        <Logo height={56} />
      </div>

      <div className="hypack-clerk flex flex-1 items-center justify-center px-6 pb-16">
        <SignUp
          appearance={clerkAppearance}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/modpacks"
          fallbackRedirectUrl="/modpacks"
        />
      </div>
    </div>
  );
}
