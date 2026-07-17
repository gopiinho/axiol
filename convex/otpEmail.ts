function otpHtml(otp: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body style="font-family: Manrope, system-ui, -apple-system, sans-serif; margin: 0; padding: 0; background: #f4f4f5;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; margin: 0 auto;">
            <tr>
              <td style="padding: 28px 25px;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <img src="https://axiol.store/axiol-logo.svg" width="50" height="50" alt="Axiol" style="display: inline-block; vertical-align: middle; margin-right: 10px;" />
                    </td>
                    <td style="font-size: 20px; font-weight: 800; color: #111; vertical-align: middle; letter-spacing: -0.5px;">
                      Axiol
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 1px 32px 32px;">
                <h1 style="font-size: 22px; font-weight: 700; color: #111; margin: 0 0 12px; letter-spacing: -0.3px;">
                  Your verification code
                </h1>
                <p style="font-size: 15px; color: #555; margin: 0 0 24px; line-height: 1.6;">
                  Enter this code to complete your action. It expires in 10 minutes.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background: #f4f4f5; border-radius: 12px; padding: 24px 32px; text-align: center;">
                      <p style="font-size: 36px; font-weight: 800; color: #111; letter-spacing: 8px; margin: 0; font-family: Monaco, Courier, monospace;">
                        ${otp}
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="font-size: 13px; color: #999; margin: 24px 0 0; line-height: 1.5;">
                  If you didn't request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 32px; background: #fafafa; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 12px; color: #aaa; line-height: 1.5;">
                  &copy; ${new Date().getFullYear()} Axiol. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendOtpEmail(email: string, otp: string, type: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "noreply@axiol.store";

  if (!apiKey) {
    console.log(`[OTP] ${type} code for ${email}: ${otp}`);
    return;
  }

  const subject =
    type === "forget-password" ? "Your password reset code" : "Your verification code";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Axiol <${from}>`,
      to: email,
      subject,
      html: otpHtml(otp),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Resend error (${res.status}):`, body);
    throw new Error(`Failed to send email (${res.status}): ${body}`);
  }
}
