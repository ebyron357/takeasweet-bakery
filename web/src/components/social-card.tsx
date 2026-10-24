import { siteConfig } from "@/config/site";

export const socialImageSize = { width: 1200, height: 630 } as const;

export function SocialCard() {
  return (
    <div
      style={{
        alignItems: "center",
        background: "#fdfaf2",
        color: "#3f342d",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "flex-start",
          border: "3px solid #e6d8c7",
          borderRadius: "32px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "64px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#9a5e20",
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {siteConfig.serviceArea}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              color: "#6f6258",
              display: "flex",
              fontSize: 30,
              lineHeight: 1.35,
              marginTop: 28,
            }}
          >
            Verified menu, authentic-work gallery, and local ordering
            information.
          </div>
        </div>
      </div>
    </div>
  );
}
