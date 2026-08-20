export type MediaApproval = Readonly<{
  status: "approved";
  source: "owner-provided" | "repository-verified";
  approvedAt: string;
}>;

type ApprovedLocalMedia = Readonly<{
  id: string;
  src: `/media/authentic/${string}`;
  alt: string;
  caption: string;
  width: number;
  height: number;
  approval: MediaApproval;
}>;

export type AuthenticGalleryItem = ApprovedLocalMedia &
  Readonly<{
    kind: "authentic-work";
    category: "treat" | "event" | "process";
  }>;

export type ApprovedFounderPortrait = ApprovedLocalMedia &
  Readonly<{
    kind: "approved-founder-portrait";
  }>;

export type IllustrativeProductMedia = Readonly<{
  kind: "illustrative-generated";
  src: `/media/illustrative/${string}`;
  alt: string;
  width: number;
  height: number;
  disclosure: "Illustrative image — not a photograph of TakeASweet's work.";
}>;
