import { experimental_createTheme } from "@clerk/themes";

export const clerkAppearance = experimental_createTheme({
  name: "hypack",
  layout: {
    socialButtonsVariant: "blockButton",
    socialButtonsPlacement: "top",
  },
  variables: {
    colorBackground: "#141414",
    colorInput: "#1a1a1a",
    colorInputForeground: "#fafafa",
    colorForeground: "#fafafa",
    colorMutedForeground: "#a1a1aa",
    colorPrimary: "#7c3aed",
    colorPrimaryForeground: "#ffffff",
    colorNeutral: "white",
    colorBorder: "rgba(255, 255, 255, 0.12)",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-[420px]",
    card: "border border-white/10 bg-[#141414] shadow-2xl shadow-black/40",
    headerTitle: "text-white",
    headerSubtitle: "text-zinc-400",
    socialButtons: "gap-3",
    socialButtonsBlockButton:
      "h-11 w-full border border-violet-500/25 bg-violet-500/10 text-white shadow-none hover:border-violet-400/40 hover:bg-violet-500/15",
    socialButtonsBlockButtonText: "text-white font-medium text-sm",
    socialButtonsProviderIcon: "size-[18px] opacity-100",
    socialButtonsIconButton:
      "h-11 border border-violet-500/25 bg-violet-500/10 shadow-none hover:border-violet-400/40 hover:bg-violet-500/15",
    providerIcon__github: { filter: "brightness(0) invert(1)" },
    providerIcon__google: { filter: "none" },
    socialButtonsProviderIcon__github: { filter: "brightness(0) invert(1)" },
    socialButtonsProviderIcon__google: { filter: "none" },
    dividerLine: "bg-white/10",
    dividerText: "text-zinc-500",
    formFieldLabel: "text-zinc-300",
    formFieldInput:
      "border-white/10 bg-[#1a1a1a] text-white placeholder:text-zinc-500",
    formButtonPrimary:
      "bg-violet-600 text-white hover:bg-violet-500 shadow-none",
    footerActionLink: "text-violet-400 hover:text-violet-300",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-violet-400",
  },
});
