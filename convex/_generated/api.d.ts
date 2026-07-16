/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as catCounter from "../catCounter.js";
import type * as contentLimits from "../contentLimits.js";
import type * as contentStorage from "../contentStorage.js";
import type * as crons from "../crons.js";
import type * as deliveries from "../deliveries.js";
import type * as dmQueue from "../dmQueue.js";
import type * as http from "../http.js";
import type * as instagram from "../instagram.js";
import type * as integrations from "../integrations.js";
import type * as lib_instagramCrypto from "../lib/instagramCrypto.js";
import type * as orders from "../orders.js";
import type * as otpEmail from "../otpEmail.js";
import type * as productClicks from "../productClicks.js";
import type * as productConfig from "../productConfig.js";
import type * as productItems from "../productItems.js";
import type * as products from "../products.js";
import type * as security from "../security.js";
import type * as storage from "../storage.js";
import type * as users from "../users.js";
import type * as vendors from "../vendors.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  catCounter: typeof catCounter;
  contentLimits: typeof contentLimits;
  contentStorage: typeof contentStorage;
  crons: typeof crons;
  deliveries: typeof deliveries;
  dmQueue: typeof dmQueue;
  http: typeof http;
  instagram: typeof instagram;
  integrations: typeof integrations;
  "lib/instagramCrypto": typeof lib_instagramCrypto;
  orders: typeof orders;
  otpEmail: typeof otpEmail;
  productClicks: typeof productClicks;
  productConfig: typeof productConfig;
  productItems: typeof productItems;
  products: typeof products;
  security: typeof security;
  storage: typeof storage;
  users: typeof users;
  vendors: typeof vendors;
  waitlist: typeof waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  contentStorage: import("@convex-dev/r2/_generated/component.js").ComponentApi<"contentStorage">;
};
