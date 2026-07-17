import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Heading,
  Text,
  Hr,
} from "@react-email/components";

interface KycNotificationProps {
  status: "ACTIVE" | "BLOCKED";
  userName: string;
  storeName: string;
  siteUrl: string;
}

export function KycNotification({ status, userName, storeName, siteUrl }: KycNotificationProps) {
  const isActive = status === "ACTIVE";

  return (
    <Html>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        />
      </Head>
      <Body
        style={{
          fontFamily: "Manrope, system-ui, -apple-system, sans-serif",
          margin: 0,
          padding: 0,
          background: "#f4f4f5",
        }}
      >
        <Container style={{ maxWidth: 560, margin: "0 auto", background: "#ffffff" }}>
          <Section
            style={{
              padding: "28px 25px",
            }}
          >
            <Img
              src={`${siteUrl}/axiol-logo.svg`}
              alt="Axiol"
              style={{
                width: 50,
                height: 50,
                display: "inline-block",
                verticalAlign: "middle",
                marginRight: 10,
              }}
            />
            <Text
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                fontSize: 20,
                fontWeight: 800,
                color: "#111",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              Axiol
            </Text>
          </Section>

          <Section style={{ padding: "1px 32px 32px" }}>
            <Heading
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 12px",
                letterSpacing: "-0.3px",
              }}
            >
              {isActive ? "Payments Verified" : "Verification Failed"}
            </Heading>
            <Text
              style={{
                fontSize: 15,
                color: "#555",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Hello{userName ? ` ${userName}` : ""},
            </Text>

            {isActive ? (
              <>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#555",
                    margin: "12px 0 0",
                    lineHeight: 1.6,
                  }}
                >
                  Great news! Your payment details have been verified successfully. You can now
                  receive payouts from your sales on <strong>{storeName}</strong>.
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#555",
                    margin: "12px 0 0",
                    lineHeight: 1.6,
                  }}
                >
                  Earnings from your orders will be settled directly to your registered bank account
                  or UPI VPA on a T+1 schedule.
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#555",
                    margin: "12px 0 0",
                    lineHeight: 1.6,
                  }}
                >
                  Unfortunately, we were unable to verify your payment details. This could be due to
                  incorrect bank account information, UPI VPA, or KYC documents.
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#555",
                    margin: "12px 0 0",
                    lineHeight: 1.6,
                  }}
                >
                  Please update your payment details in your{" "}
                  <a
                    href={`${siteUrl}/dashboard/settings?tab=payments`}
                    style={{ color: "#111", fontWeight: 600 }}
                  >
                    settings
                  </a>{" "}
                  or contact support for assistance.
                </Text>
              </>
            )}
          </Section>

          <Section
            style={{
              padding: "24px 32px",
              background: "#fafafa",
              borderTop: "1px solid #eee",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#999",
                margin: "0 0 16px",
                letterSpacing: 1,
                textTransform: "uppercase" as const,
              }}
            >
              Account Details
            </Text>

            <Hr style={{ margin: 0, border: 0, borderTop: "1px solid #eee" }} />

            <table width="100%" cellPadding="0" cellSpacing="0" style={{ padding: "10px 0" }}>
              <tbody>
                <tr>
                  <td style={{ fontSize: 14, color: "#999", fontWeight: 500, width: "30%" }}>
                    Store
                  </td>
                  <td style={{ fontSize: 14, color: "#111", fontWeight: 600 }}>{storeName}</td>
                </tr>
                <tr>
                  <td style={{ fontSize: 14, color: "#999", fontWeight: 500, width: "30%" }}>
                    Status
                  </td>
                  <td style={{ fontSize: 14, color: "#111", fontWeight: 600 }}>
                    {isActive ? "Active" : "Blocked"}
                  </td>
                </tr>
              </tbody>
            </table>

            <Hr style={{ margin: 0, border: 0, borderTop: "1px solid #eee" }} />
          </Section>

          <Section
            style={{
              padding: "20px 32px",
              background: "#fafafa",
              borderTop: "1px solid #eee",
            }}
          >
            <Text
              style={{
                margin: 0,
                fontSize: 12,
                color: "#aaa",
                lineHeight: 1.5,
              }}
            >
              © {new Date().getFullYear()} Axiol. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
