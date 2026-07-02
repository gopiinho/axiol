interface CashfreeCheckoutResult {
  error?: { message: string };
  redirect?: boolean;
  paymentDetails?: Record<string, unknown>;
}

interface CashfreeInstance {
  checkout: (opts: {
    paymentSessionId: string;
    redirectTarget: "_modal" | "_self" | "_top" | "_blank";
  }) => Promise<CashfreeCheckoutResult>;
  create: (type: string, opts?: Record<string, unknown>) => unknown;
  pay: (opts: Record<string, unknown>) => Promise<CashfreeCheckoutResult>;
  subscriptionsCheckout: (opts: Record<string, unknown>) => Promise<CashfreeCheckoutResult>;
}

interface Window {
  Cashfree: (config: { mode: string }) => CashfreeInstance;
}
