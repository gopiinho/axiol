export type ThumbnailLiveState = {
  style: "button" | "callout";
  title: string;
  subtitle?: string;
  buttonText: string;
  imageUrl?: string | null;
  price?: string | null;
};

export type ThumbnailCardProps = {
  product: {
    _id: string;
    name: string;
    productUrl: string;
    type?: string;
    price?: string | null;
    coverImageUrl?: string | null;
    thumbnailImageUrl?: string | null;
    config?: Record<string, unknown>;
    itemCount?: number;
  };
  username?: string;
  index?: number;
  interactive?: boolean;
};

export type ThumbnailStyle = "button" | "callout";

export type CheckoutLiveState = {
  name: string;
  description: string;
  price: string;
  coverImageUrl: string | null;
  phoneEnabled: boolean;
  username: string;
  type: string;
  checkoutButtonText: string;
};
