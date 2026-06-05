import type { ProductStepKey, ProductStepComponent } from "../../registry/steps";
import { ThumbnailStep } from "./ThumbnailStep";
import { CheckoutStep } from "./CheckoutStep";
import { ContentStep } from "./ContentStep";
import { OptionsStep } from "./OptionsStep";

const PlaceholderStep: ProductStepComponent = () => <div>Step coming soon</div>;

export const STEP_COMPONENTS: Record<ProductStepKey, ProductStepComponent> = {
  thumbnail: ThumbnailStep,
  checkout: CheckoutStep,
  content: ContentStep,
  availability: PlaceholderStep,
  form: PlaceholderStep,
  options: OptionsStep,
};
