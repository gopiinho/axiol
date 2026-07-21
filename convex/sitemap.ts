import { query } from "./_generated/server";

export const getUsernames = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(50000);
    return users
      .filter((u) => u.username)
      .map((u) => ({
        username: u.username,
        updatedAt: u._creationTime,
      }));
  },
});

export const getProductUrls = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_publish_status", (q) => q.eq("status", "published"))
      .take(50000);

    const results = await Promise.all(
      products.map(async (p) => {
        const user = await ctx.db.get(p.createdBy);
        return user?.username
          ? {
              username: user.username,
              productUrl: p.productUrl,
              updatedAt: p.updatedAt,
            }
          : null;
      })
    );

    return results.filter(
      (
        r
      ): r is {
        username: string;
        productUrl: string;
        updatedAt: number;
      } => r !== null
    );
  },
});
