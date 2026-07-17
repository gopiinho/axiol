import { betterAuth } from "better-auth";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { GenericCtx } from "@convex-dev/better-auth";
import authConfig from "./auth.config";
import { sendOtpEmail } from "./otpEmail";

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const googleId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
    },
    emailVerification: {
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
    },
    socialProviders:
      googleId && googleSecret
        ? {
            google: {
              clientId: googleId,
              clientSecret: googleSecret,
            },
          }
        : undefined,
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "email-password"],
      },
      storeStateStrategy: "database",
    },
    trustedOrigins: [process.env.SITE_URL!],
    plugins: [
      convex({ authConfig }),
      emailOTP({
        overrideDefaultEmailVerification: true,
        otpLength: 6,
        expiresIn: 600,
        async sendVerificationOTP({ email, otp, type }) {
          await sendOtpEmail(email, otp, type);
        },
      }),
    ],
  });
};

export const { getAuthUser } = authComponent.clientApi();
