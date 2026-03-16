import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "refresh expiring instagram tokens",
  { hourUTC: 3, minuteUTC: 0 },
  internal.instagram.refreshExpiring,
);

export default crons;
