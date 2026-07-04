import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@axiol.store";

export async function sendDownloadEmail(
  to: string,
  productName: string,
  downloadUrl: string,
  storeName: string,
  siteUrl: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: `${storeName} <${FROM_EMAIL}>`,
      to,
      subject: `Your download: ${productName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
          <img src="${siteUrl}/cover.png" alt="" style="width: 100%; display: block;" />
          <div style="padding: 24px; text-align: center;">
            <h2 style="margin: 0 0 8px;">${productName}</h2>
            <p style="margin: 0 0 24px; color: #555;">Your purchase from ${storeName} is ready.</p>
            <a href="${downloadUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Download
            </a>
            <p style="margin: 24px 0 0; font-size: 13px; color: #999;">
              This link expires in 7 days and can be used up to 5 times.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend send error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("Resend sendDownloadEmail error:", message);
    return { ok: false, error: message };
  }
}
