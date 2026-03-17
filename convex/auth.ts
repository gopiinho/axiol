import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const TRIAL_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days

const RESERVED_USERNAMES = [
  "login",
  "signup",
  "dashboard",
  "api",
  "privacy",
  "terms",
  "data-deletion",
  "list",
  "admin",
  "settings",
  "about",
  "help",
  "support",
  "contact",
];

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const saltData = encoder.encode(salt);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordData,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltData,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

export const createAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    if (args.password.length < 12) {
      throw new Error("Password must be at least 12 characters");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("Admin user already exists");
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(args.password, salt);
    const now = Date.now();

    return await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      username: "admin",
      name: "Admin",
      bio: "",
      accountType: "admin",
      passwordHash,
      salt,
      failedLoginAttempts: 0,
      accountLocked: false,
      createdAt: now,
    });
  },
});

export const signup = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    name: v.string(),
    password: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    const username = args.username.toLowerCase().trim();
    const usernameRegex = /^[a-z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      throw new Error(
        "Username must be 3-30 characters, lowercase letters, numbers, and underscores only"
      );
    }

    if (RESERVED_USERNAMES.includes(username)) {
      throw new Error("This username is not available");
    }

    if (args.name.trim().length < 1) {
      throw new Error("Name is required");
    }

    if (args.password.length < 12) {
      throw new Error("Password must be at least 12 characters");
    }

    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingEmail) {
      throw new Error("An account with this email already exists");
    }

    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existingUsername) {
      throw new Error("This username is already taken");
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(args.password, salt);
    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      username,
      name: args.name.trim(),
      bio: "",
      accountType: "creator",
      passwordHash,
      salt,
      failedLoginAttempts: 0,
      accountLocked: false,
      trialStartedAt: now,
      trialEndsAt: now + TRIAL_DURATION,
      subscriptionStatus: "trial",
      createdAt: now,
    });

    const token = generateSecureToken();
    const expiresAt = now + SESSION_DURATION;

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      createdAt: now,
      lastUsedAt: now,
    });

    return { token, expiresAt };
  },
});

export const checkUsernameAvailable = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const username = args.username.toLowerCase().trim();

    const usernameRegex = /^[a-z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return { available: false, reason: "Invalid username format" };
    }

    if (RESERVED_USERNAMES.includes(username)) {
      return { available: false, reason: "This username is not available" };
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existing) {
      return { available: false, reason: "This username is already taken" };
    }

    return { available: true };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Please enter a valid email address");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    const GENERIC_ERROR = "Invalid email or password";

    if (!user) {
      throw new Error(GENERIC_ERROR);
    }

    if (user.accountLocked) {
      const now = Date.now();
      if (user.accountLockedUntil && now < user.accountLockedUntil) {
        const minutesLeft = Math.ceil((user.accountLockedUntil - now) / 60000);
        throw new Error(
          `Account temporarily locked due to too many failed login attempts. Please try again in ${minutesLeft} minute${
            minutesLeft > 1 ? "s" : ""
          }.`
        );
      } else {
        await ctx.db.patch(user._id, {
          accountLocked: false,
          failedLoginAttempts: 0,
          accountLockedUntil: undefined,
        });
      }
    }

    const passwordHash = await hashPassword(args.password, user.salt);
    const passwordValid = timingSafeCompare(passwordHash, user.passwordHash);

    if (!passwordValid) {
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newFailedAttempts >= MAX_LOGIN_ATTEMPTS;
      const attemptsRemaining = MAX_LOGIN_ATTEMPTS - newFailedAttempts;

      await ctx.db.patch(user._id, {
        failedLoginAttempts: newFailedAttempts,
        lastFailedLogin: Date.now(),
        accountLocked: shouldLock,
        accountLockedUntil: shouldLock
          ? Date.now() + LOCKOUT_DURATION
          : undefined,
      });

      if (shouldLock) {
        throw new Error(
          "Too many failed login attempts. Your account has been locked for 15 minutes for security."
        );
      }

      if (attemptsRemaining <= 2) {
        throw new Error(
          `${GENERIC_ERROR}. Warning: ${attemptsRemaining} attempt${
            attemptsRemaining > 1 ? "s" : ""
          } remaining before account lockout.`
        );
      }

      throw new Error(GENERIC_ERROR);
    }

    await ctx.db.patch(user._id, {
      failedLoginAttempts: 0,
      lastFailedLogin: undefined,
    });

    const token = generateSecureToken();
    const now = Date.now();
    const expiresAt = now + SESSION_DURATION;

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      createdAt: now,
      lastUsedAt: now,
    });

    return {
      token,
      expiresAt,
      username: user.username,
      name: user.name,
      accountType: user.accountType,
    };
  },
});

export const verifySession = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      return { valid: false };
    }

    const now = Date.now();

    if (session.expiresAt < now) {
      await ctx.db.delete(session._id);
      return { valid: false };
    }

    if (session.lastUsedAt && now - session.lastUsedAt > SESSION_IDLE_TIMEOUT) {
      await ctx.db.delete(session._id);
      return { valid: false, reason: "Session expired due to inactivity" };
    }

    await ctx.db.patch(session._id, {
      lastUsedAt: now,
    });

    return { valid: true };
  },
});

export const checkSession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      return { valid: false };
    }

    const now = Date.now();

    if (session.expiresAt < now) {
      return { valid: false };
    }

    if (session.lastUsedAt && now - session.lastUsedAt > SESSION_IDLE_TIMEOUT) {
      return { valid: false };
    }

    return { valid: true };
  },
});

export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const logoutAllSessions = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) return;

    const allUserSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    for (const s of allUserSessions) {
      await ctx.db.delete(s._id);
    }
  },
});

export const cleanupExpiredSessions = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const sessions = await ctx.db.query("sessions").collect();

    for (const session of sessions) {
      const isExpired = session.expiresAt < now;
      const isIdle =
        session.lastUsedAt && now - session.lastUsedAt > SESSION_IDLE_TIMEOUT;

      if (isExpired || isIdle) {
        await ctx.db.delete(session._id);
      }
    }
  },
});

export const getActiveSessions = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const currentSession = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!currentSession) return [];

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", currentSession.userId))
      .collect();

    return sessions.map((s) => ({
      _id: s._id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
      isCurrent: s._id === currentSession._id,
    }));
  },
});
