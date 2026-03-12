import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { getServerConvexClient } from "@/server/convex/client";

const convex = getServerConvexClient();
const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const INTERNAL_WEBHOOK_SECRET = process.env.INSTAGRAM_WEBHOOK_INTERNAL_SECRET;

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object"
    ? (value as UnknownRecord)
    : null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isValidSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const receivedHex = signatureHeader.slice("sha256=".length);
  if (!receivedHex) {
    return false;
  }

  const expectedHex = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  const expected = Buffer.from(expectedHex, "hex");
  const received = Buffer.from(receivedHex, "hex");

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message },
    },
    { status }
  );
}

function jsonOk(status: number, data: Record<string, unknown> = {}) {
  return NextResponse.json(
    {
      ok: true,
      ...data,
    },
    { status }
  );
}

export async function GET(request: NextRequest) {
  if (!VERIFY_TOKEN) {
    return jsonError(
      503,
      "WEBHOOK_CONFIG_MISSING",
      "Webhook verify token is not configured"
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !challenge) {
    return jsonError(400, "INVALID_CHALLENGE_REQUEST", "Invalid webhook challenge");
  }

  if (token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return jsonError(403, "FORBIDDEN", "Invalid verify token");
}

export async function POST(request: NextRequest) {
  try {
    if (!APP_SECRET || !INTERNAL_WEBHOOK_SECRET) {
      return jsonError(
        503,
        "WEBHOOK_CONFIG_MISSING",
        "Webhook security is not fully configured"
      );
    }

    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return jsonError(415, "INVALID_CONTENT_TYPE", "Expected application/json");
    }

    const rawBody = await request.text();
    if (!rawBody.trim()) {
      return jsonError(400, "EMPTY_BODY", "Webhook body is empty");
    }

    const signatureHeader = request.headers.get("x-hub-signature-256");

    if (!isValidSignature(rawBody, signatureHeader, APP_SECRET)) {
      return jsonError(401, "INVALID_SIGNATURE", "Invalid webhook signature");
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody) as unknown;
    } catch {
      return jsonError(400, "INVALID_JSON", "Webhook body must be valid JSON");
    }

    const payload = asRecord(body);
    if (!payload) {
      return jsonError(400, "INVALID_PAYLOAD", "Webhook payload must be an object");
    }

    const objectType = getString(payload.object);
    if (objectType !== "instagram") {
      return jsonOk(202, { status: "ignored_object" });
    }

    const entry = payload?.entry;
    if (!Array.isArray(entry)) {
      return jsonOk(200, { status: "no_entry" });
    }

    let processedEvents = 0;

    for (const rawEntry of entry) {
      const entryObj = asRecord(rawEntry);
      const changes = entryObj?.changes;
      if (!Array.isArray(changes)) continue;

      for (const rawChange of changes) {
        const change = asRecord(rawChange);
        if (!change) continue;

        const field = getString(change.field);

        if (field === "comments") {
          await handleCommentEvent(change.value, INTERNAL_WEBHOOK_SECRET);
          processedEvents += 1;
        }

        if (field === "messages") {
          await handleDMEvent(change.value, INTERNAL_WEBHOOK_SECRET);
          processedEvents += 1;
        }
      }
    }

    return jsonOk(200, { status: "success", processedEvents });
  } catch (error) {
    console.error("Webhook error:", error);
    return jsonError(500, "INTERNAL_ERROR", "Internal webhook processing error");
  }
}

async function handleCommentEvent(rawComment: unknown, webhookSecret: string) {
  const comment = asRecord(rawComment);
  if (!comment) return;

  const commentId = getString(comment.id);
  const commentTextRaw = getString(comment.text);
  const media = asRecord(comment.media);
  const from = asRecord(comment.from);
  const mediaId = getString(media?.id);
  const userId = getString(from?.id);
  const username = getString(from?.username);

  if (!commentId || !commentTextRaw || !mediaId || !userId || !username) {
    return;
  }

  const commentText = commentTextRaw.toLowerCase().trim();

  try {
    const mapping = await convex.query(api.instagram.findMappingForComment, {
      sourceSecret: webhookSecret,
      reelId: mediaId,
      commentText,
    });

    if (!mapping) {
      await convex.mutation(api.instagram.logComment, {
        sourceSecret: webhookSecret,
        commentId,
        reelId: mediaId,
        instagramUserId: userId,
        username,
        commentText,
        keyword: commentText,
        dmSent: false,
        dmError: "No active mapping for reel and keyword",
      });
      return;
    }

    const fullMapping = await convex.query(api.instagram.getReelMappingById, {
      sourceSecret: webhookSecret,
      id: mapping.mappingId,
    });

    const jobId = await convex.mutation(api.dmQueue.createDmJob, {
      sourceSecret: webhookSecret,
      instagramUserId: userId,
      username,
      sectionId: mapping.sectionId,
      reelId: mediaId,
      triggerType: "comment",
      triggerId: commentId,
      maxItemsInDM: fullMapping?.maxItemsInDM ?? 10,
      includeWebsiteLink: fullMapping?.includeWebsiteLink ?? true,
    });

    await convex.mutation(api.instagram.logComment, {
      sourceSecret: webhookSecret,
      commentId,
      reelId: mediaId,
      instagramUserId: userId,
      username,
      commentText,
      keyword: mapping.keyword,
      sectionId: mapping.sectionId,
      dmSent: Boolean(jobId),
      dmError: jobId ? undefined : "Duplicate job skipped",
    });

    if (jobId) {
      console.log("DM job created:", jobId);
    }
  } catch (error) {
    console.error("handleCommentEvent error:", error);

    await convex.mutation(api.instagram.logComment, {
      sourceSecret: webhookSecret,
      commentId,
      reelId: mediaId,
      instagramUserId: userId,
      username,
      commentText,
      keyword: commentText,
      dmSent: false,
      dmError: String(error),
    });
  }
}

async function handleDMEvent(rawMessage: unknown, webhookSecret: string) {
  const message = asRecord(rawMessage);
  if (!message) return;

  const messageId = getString(message.mid);
  const messageBody = asRecord(message.message);
  const messageText = getString(messageBody?.text);
  const from = asRecord(message.from);
  const userId = getString(from?.id);
  const username = getString(from?.username);

  if (!messageText || !userId || !username || !messageId) {
    return;
  }

  try {
    const reelMatch = messageText.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/);
    if (!reelMatch) {
      return;
    }

    const reelId = reelMatch[1];

    const mapping = await convex.query(api.instagram.findMappingForReel, {
      sourceSecret: webhookSecret,
      reelId,
    });

    if (!mapping) {
      return;
    }

    const fullMapping = await convex.query(api.instagram.getReelMappingById, {
      sourceSecret: webhookSecret,
      id: mapping.mappingId,
    });

    const jobId = await convex.mutation(api.dmQueue.createDmJob, {
      sourceSecret: webhookSecret,
      instagramUserId: userId,
      username,
      sectionId: mapping.sectionId,
      reelId,
      triggerType: "dm",
      triggerId: messageId,
      maxItemsInDM: fullMapping?.maxItemsInDM ?? 10,
      includeWebsiteLink: fullMapping?.includeWebsiteLink ?? true,
    });

    if (jobId) {
      console.log("DM job created from inbox message:", jobId);
    }
  } catch (error) {
    console.error("handleDMEvent error:", error);
  }
}
