import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Linkkit",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-accent text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.938rem] leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-[0.938rem] leading-relaxed text-muted-foreground marker:text-border">
      {children}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12 space-y-2">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; Back to Linkkit
          </Link>
          <h1 className="font-accent mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective March 19, 2026
          </p>
        </header>

        <div className="space-y-10">
          <Section title="1. Introduction">
            <P>
              Linkkit (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
              operates the Linkkit platform, a creator toolkit for affiliate
              marketing and Instagram DM automation. This Privacy Policy
              explains how we collect, use, share, and protect your personal
              information when you use our website and services.
            </P>
            <P>
              If you have questions about this policy, contact us at{" "}
              <a
                href="mailto:gopinho@protonmail.com"
                className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
              >
                gopinho@protonmail.com
              </a>
              .
            </P>
          </Section>

          <Section title="2. Data We Collect">
            <SubSection title="Account Data">
              <P>
                When you create an account, we collect your email address, full
                name, username, and password. Passwords are stored using a
                secure, one-way hashing algorithm and are never stored in plain
                text.
              </P>
            </SubSection>

            <SubSection title="Instagram Data (via OAuth)">
              <P>
                If you connect your Instagram account, we receive and store your
                Instagram user ID, Instagram username, and a long-lived access
                token. Access tokens are encrypted at rest using AES-GCM
                encryption. We also access reel metadata (reel IDs, captions,
                thumbnails, and publish dates) to enable the automation features
                you configure.
              </P>
            </SubSection>

            <SubSection title="Webhook &amp; Automation Data">
              <P>
                When Instagram sends webhook events to our servers, we receive
                comment text, commenter user IDs and usernames, DM message text,
                and sender user IDs and usernames. This data is stored in our
                comment and DM log tables to provide you with activity history
                and troubleshooting information.
              </P>
            </SubSection>

            <SubSection title="Usage &amp; Analytics Data">
              <P>
                We use PostHog for product analytics. This includes page views,
                feature usage events, and general interaction data. PostHog may
                collect device type, browser information, and approximate
                location based on IP address.
              </P>
            </SubSection>

            <SubSection title="Cookies">
              <P>We use the following cookies:</P>
              <Ul>
                <li>
                  <strong className="text-foreground">Session cookie</strong> —
                  an HttpOnly, secure cookie containing your authentication
                  session token. This is essential for keeping you logged in.
                </li>
                <li>
                  <strong className="text-foreground">OAuth CSRF cookie</strong>{" "}
                  — a short-lived cookie (10 minutes) used to prevent cross-site
                  request forgery during the Instagram OAuth flow.
                </li>
              </Ul>
              <P>We do not use advertising or third-party tracking cookies.</P>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Data">
            <Ul>
              <li>
                <strong className="text-foreground">Account data</strong> — to
                authenticate you, display your profile, and provide your public
                creator page.
              </li>
              <li>
                <strong className="text-foreground">Instagram data</strong> — to
                connect your Instagram account, display your reels in the
                dashboard, and send automated DMs on your behalf when triggered
                by comments matching your configured keywords.
              </li>
              <li>
                <strong className="text-foreground">Webhook data</strong> — to
                process incoming Instagram events, trigger automated responses,
                and provide you with activity logs.
              </li>
              <li>
                <strong className="text-foreground">Usage data</strong> — to
                understand how our product is used and improve the platform.
              </li>
            </Ul>
          </Section>

          <Section title="4. Instagram Data &amp; Automated Messaging">
            <SubSection title="Permissions We Request">
              <P>We request the following Instagram API permissions:</P>
              <Ul>
                <li>
                  <strong className="text-foreground">
                    instagram_business_basic
                  </strong>{" "}
                  — to read your Instagram profile info and media (reels,
                  posts).
                </li>
                <li>
                  <strong className="text-foreground">
                    instagram_business_manage_messages
                  </strong>{" "}
                  — to send direct messages on your behalf in response to
                  comment triggers.
                </li>
                <li>
                  <strong className="text-foreground">
                    instagram_business_manage_comments
                  </strong>{" "}
                  — to read comments on your media and identify keyword
                  triggers.
                </li>
              </Ul>
            </SubSection>

            <SubSection title="How Automated DMs Work">
              <P>
                You configure &ldquo;reel mappings&rdquo; that pair a specific
                Instagram reel with a product collection and a trigger keyword.
                When a user comments on your reel with a matching keyword, our
                system automatically sends them a DM containing the product
                links from the associated collection. You have full control over
                which reels are mapped, which keywords trigger responses, and
                which products are included.
              </P>
            </SubSection>

            <SubSection title="Messaging Compliance">
              <P>
                We comply with Instagram&apos;s 24-hour messaging window policy.
                DMs are only sent in response to user-initiated interactions
                (comments) within the allowed window. We enforce a rate limit of
                195 DMs per hour per account to stay within Meta&apos;s API
                guidelines.
              </P>
            </SubSection>

            <SubSection title="User Control">
              <P>
                You can disable any reel mapping at any time, disconnect your
                Instagram account, or delete your Linkkit account entirely.
                Disabling a mapping immediately stops automated DMs for that
                reel.
              </P>
            </SubSection>
          </Section>

          <Section title="5. Data Sharing">
            <P>
              We do not sell, rent, or trade your personal information. We share
              data only with the following third parties:
            </P>
            <Ul>
              <li>
                <strong className="text-foreground">Meta / Instagram</strong> —
                we send DMs via the Meta Graph API on your behalf. Message
                content and recipient information is transmitted to Meta as part
                of this process.
              </li>
              <li>
                <strong className="text-foreground">PostHog</strong> —
                anonymized usage analytics for product improvement.
              </li>
              <li>
                <strong className="text-foreground">Convex</strong> — our
                backend-as-a-service provider that hosts our database. All data
                is stored on Convex infrastructure.
              </li>
            </Ul>
            <P>
              We may also disclose data if required by law or to protect our
              legal rights.
            </P>
          </Section>

          <Section title="6. Data Retention &amp; Deletion">
            <P>
              We retain your data for as long as your account is active. You can
              request deletion of your data at any time by contacting us at{" "}
              <a
                href="mailto:gopinho@protonmail.com"
                className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
              >
                gopinho@protonmail.com
              </a>{" "}
              or using our{" "}
              <Link
                href="/data-deletion"
                className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
              >
                data deletion page
              </Link>
              . Upon receiving a valid deletion request, we will delete your
              data within 30 days.
            </P>
            <P>
              If you disconnect your Instagram account, we delete your stored
              access token and Instagram-related automation data.
            </P>
          </Section>

          <Section title="7. Data Security">
            <P>We protect your data through the following measures:</P>
            <Ul>
              <li>
                Instagram access tokens are encrypted at rest using AES-GCM
                encryption.
              </li>
              <li>All data is transmitted over HTTPS with TLS encryption.</li>
              <li>
                Authentication cookies are HttpOnly and Secure, preventing
                client-side script access.
              </li>
              <li>
                Webhook payloads from Instagram are verified using HMAC-SHA256
                signature validation.
              </li>
              <li>
                Passwords are hashed using industry-standard one-way hashing.
              </li>
            </Ul>
          </Section>

          <Section title="8. Your Rights">
            <P>
              Depending on your jurisdiction, you may have the following rights
              regarding your personal data:
            </P>
            <Ul>
              <li>
                <strong className="text-foreground">Access</strong> — request a
                copy of the personal data we hold about you.
              </li>
              <li>
                <strong className="text-foreground">Correction</strong> —
                request correction of inaccurate data.
              </li>
              <li>
                <strong className="text-foreground">Deletion</strong> — request
                deletion of your data.
              </li>
              <li>
                <strong className="text-foreground">Portability</strong> —
                request a machine-readable export of your data.
              </li>
              <li>
                <strong className="text-foreground">Objection</strong> — object
                to certain processing of your data.
              </li>
            </Ul>
            <P>
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:gopinho@protonmail.com"
                className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
              >
                gopinho@protonmail.com
              </a>
              . We will respond within 30 days.
            </P>
          </Section>

          <Section title="9. Children's Privacy">
            <P>
              Linkkit is not intended for use by anyone under the age of 13. We
              do not knowingly collect personal data from children under 13. If
              we learn that we have collected data from a child under 13, we
              will delete that data promptly.
            </P>
          </Section>

          <Section title="10. Changes to This Policy">
            <P>
              We may update this Privacy Policy from time to time. If we make
              material changes, we will notify you by email or by posting a
              notice on the platform. Your continued use of Linkkit after any
              changes constitutes acceptance of the updated policy.
            </P>
          </Section>

          <Section title="11. Contact Us">
            <P>
              If you have questions, concerns, or requests regarding this
              Privacy Policy or your personal data, contact us at:
            </P>
            <P>
              <a
                href="mailto:gopinho@protonmail.com"
                className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
              >
                gopinho@protonmail.com
              </a>
            </P>
          </Section>
        </div>

        <footer className="mt-14 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <span className="mx-2">&middot;</span>
          <Link href="/data-deletion" className="hover:underline">
            Data Deletion
          </Link>
        </footer>
      </div>
    </main>
  );
}
