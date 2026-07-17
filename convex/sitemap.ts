import { query } from "./_generated/server";

export const getUsernames = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
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
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

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
