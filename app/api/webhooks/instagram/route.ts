import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN!;
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    if (!APP_SECRET || !INTERNAL_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Webhook security not configured" },
        { status: 503 }
      );
    }

    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256");

    if (!isValidSignature(rawBody, signatureHeader, APP_SECRET)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as unknown;
    const payload = asRecord(body);

    const entry = payload?.entry;
    if (!Array.isArray(entry)) {
      return NextResponse.json({ status: "no_entry" });
    }

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
        }

        if (field === "messages") {
          await handleDMEvent(change.value, INTERNAL_WEBHOOK_SECRET);
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
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
      reelId: mediaId,
      commentText,
    });

    if (!mapping) {
      await convex.mutation(api.instagram.logComment, {
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
      reelId,
    });

    if (!mapping) {
      return;
    }

    const fullMapping = await convex.query(api.instagram.getReelMappingById, {
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
