import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm sm:px-8">
        <p className="text-foreground font-semibold">{siteConfig.name}</p>
        <p>Serving {siteConfig.serviceArea}.</p>
      </div>
    </footer>
  );
}
