import { Html, Head, Body, Container, Section, Img, Heading, Text } from "@react-email/components";

interface VerificationCodeEmailProps {
  otp: string;
}

export function VerificationCodeEmail({ otp }: VerificationCodeEmailProps) {
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
              src={`https://axiol.store/axiol-logo.svg`}
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
              Your verification code
            </Heading>

            <Text
              style={{
                fontSize: 15,
                color: "#555",
                margin: "0 0 24px",
                lineHeight: 1.6,
              }}
            >
              Enter this code to complete your action. It expires in 10 minutes.
            </Text>

            <Section
              style={{
                background: "#f4f4f5",
                borderRadius: 12,
                padding: "24px 32px",
                textAlign: "center" as const,
              }}
            >
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#111",
                  letterSpacing: 8,
                  margin: 0,
                  fontFamily: "Monaco, Courier, monospace",
                }}
              >
                {otp}
              </Text>
            </Section>

            <Text
              style={{
                fontSize: 13,
                color: "#999",
                margin: "24px 0 0",
                lineHeight: 1.5,
              }}
            >
              If you didn&apos;t request this code, you can safely ignore this email.
            </Text>
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
