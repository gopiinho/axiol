import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface DownloadReceiptProps {
  productName: string;
  storeName: string;
  downloadUrl: string;
  siteUrl: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  orderId: string;
  orderDate: string;
}

export function DownloadReceipt({
  productName,
  storeName,
  downloadUrl,
  siteUrl,
  customerName,
  customerEmail,
  amount,
  orderId,
  orderDate,
}: DownloadReceiptProps) {
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

          <Section style={{ padding: "1px 32px 8px" }}>
            <Heading
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 12px",
                letterSpacing: "-0.3px",
              }}
            >
              Hello{customerName ? ` ${customerName}` : ""},
            </Heading>
            <Text
              style={{
                fontSize: 15,
                color: "#555",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Thank you for your purchase! Your order from <strong>{storeName}</strong> is
              confirmed. Your download is ready below.
            </Text>
          </Section>

          <Section style={{ padding: "24px 32px" }}>
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
              Order Details
            </Text>

            <Hr style={{ margin: 0, border: 0, borderTop: "1px solid #eee" }} />

            <Row label="Product" value={productName} />
            <Row label="Store" value={storeName} />
            <Row label="Email" value={customerEmail} />
            <Row label="Amount" value={amount} />
            {orderId ? <Row label="Order ID" value={orderId} /> : null}
            {orderDate ? <Row label="Date" value={orderDate} /> : null}

            <Hr style={{ margin: 0, border: 0, borderTop: "1px solid #eee" }} />
          </Section>

          <Section style={{ padding: "8px 32px 32px" }}>
            <Button
              href={downloadUrl}
              style={{
                display: "inline-block",
                padding: "13px 28px",
                background: "#111",
                color: "#fff",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Download
            </Button>
            <Text
              style={{
                margin: "16px 0 0",
                fontSize: 13,
                color: "#999",
              }}
            >
              This link expires in 7 days and can be used up to 5 times.
            </Text>
          </Section>

          {/* Footer */}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <table width="100%" cellPadding="0" cellSpacing="0" style={{ padding: "10px 0" }}>
      <tbody>
        <tr>
          <td
            style={{
              fontSize: 14,
              color: "#999",
              fontWeight: 500,
              width: "30%",
            }}
          >
            {label}
          </td>
          <td
            style={{
              fontSize: 14,
              color: "#111",
              fontWeight: 600,
            }}
          >
            {value}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
