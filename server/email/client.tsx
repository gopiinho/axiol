import { render } from "react-email";
import { Resend } from "resend";
import { DownloadReceipt } from "@/emails/download-receipt";
import { KycNotification } from "@/emails/kyc-notification";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@axiol.store";

export async function sendDownloadEmail(
  to: string,
  productName: string,
  downloadUrl: string,
  storeName: string,
  siteUrl: string,
  customerName: string,
  amount: string,
  orderId: string,
  orderDate: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const html = await render(
      <DownloadReceipt
        productName={productName}
        storeName={storeName}
        downloadUrl={downloadUrl}
        siteUrl={siteUrl}
        customerName={customerName}
        amount={amount}
        orderId={orderId}
        orderDate={orderDate}
      />
    );

    const { error } = await resend.emails.send({
      from: `${storeName || "Axiol"} <${FROM_EMAIL}>`,
      to,
      subject: `Your download: ${productName}`,
      html,
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

export async function sendKycNotification(
  to: string,
  status: "ACTIVE" | "BLOCKED",
  userName: string,
  storeName: string,
  siteUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const html = await render(
      <KycNotification
        status={status}
        userName={userName}
        storeName={storeName}
        siteUrl={siteUrl}
      />
    );

    const { error } = await resend.emails.send({
      from: `Axiol <${FROM_EMAIL}>`,
      to,
      subject: status === "ACTIVE" ? "Payments Verified" : "Payment Verification Failed",
      html,
    });

    if (error) {
      console.error("Resend KYC notification error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send KYC email";
    console.error("Resend sendKycNotification error:", message);
    return { ok: false, error: message };
  }
}