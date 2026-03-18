import { betterAuth } from "better-auth";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { GenericCtx } from "@convex-dev/better-auth";
import authConfig from "./auth.config";

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
    },
    trustedOrigins: [process.env.SITE_URL!],
    plugins: [convex({ authConfig })],
  });
};

export const { getAuthUser } = authComponent.clientApi();
