export type SocialLink = {
  url: string;
  icon: "instagram" | "youtube" | "globe";
  label: string;
  display: string;
};

export type ProductItem = {
  _id: string;
  name: string;
  productUrl: string;
  price?: string | null;
  coverImageUrl?: string | null;
  itemCount: number;
};
