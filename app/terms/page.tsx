import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Axiol",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-accent text-foreground text-xl font-bold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-[0.938rem] leading-relaxed">{children}</p>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="text-muted-foreground marker:text-border list-disc space-y-2 pl-5 text-[0.938rem] leading-relaxed">
      {children}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <main className="bg-background min-h-screen px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12 space-y-2">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            &larr; Back to Axiol
          </Link>
          <h1 className="font-accent text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm">Effective March 19, 2026</p>
        </header>

        <div className="space-y-10">
          <Section title="1. Acceptance of Terms">
            <P>
              By accessing or using Axiol (&ldquo;the Service&rdquo;), you agree to be bound by
              these Terms of Service. If you do not agree, do not use the Service.
            </P>
          </Section>

          <Section title="2. Account Registration &amp; Responsibilities">
            <P>
              You must provide accurate information when creating an account. You are responsible
              for maintaining the security of your account credentials and for all activity that
              occurs under your account. You must notify us immediately of any unauthorized use.
            </P>
            <P>
              You must be at least 13 years old to use Axiol. By registering, you represent that you
              meet this age requirement.
            </P>
          </Section>

          <Section title="3. Permitted Use">
            <P>
              Axiol provides tools for creators to build public profile pages with product
              collections and automate Instagram DM responses. You agree to use the Service only for
              its intended purpose and in compliance with all applicable laws.
            </P>

            <div className="space-y-2">
              <h3 className="text-foreground text-base font-semibold">Prohibited Conduct</h3>
              <P>You may not:</P>
              <Ul>
                <li>Use the Service to send spam, unsolicited messages, or harassing content.</li>
                <li>
                  Violate Instagram&apos;s Terms of Use, Community Guidelines, or Platform Policy.
                </li>
                <li>Attempt to circumvent rate limits or other technical safeguards.</li>
                <li>Use the Service for illegal activities, fraud, or deceptive practices.</li>
                <li>Interfere with or disrupt the Service or its infrastructure.</li>
                <li>
                  Reverse engineer, decompile, or attempt to extract the source code of the Service.
                </li>
                <li>Share your account credentials with others or create multiple accounts.</li>
              </Ul>
            </div>
          </Section>

          <Section title="4. Instagram Integration">
            <P>
              By connecting your Instagram account to Axiol, you authorize us to access your
              Instagram data as described in our{" "}
              <Link
                href="/privacy"
                className="text-primary decoration-primary/30 hover:decoration-primary font-medium underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              . You are solely responsible for the content of automated messages sent through your
              account, including product links and collection descriptions.
            </P>
            <P>
              You acknowledge that Instagram may change, restrict, or revoke API access at any time,
              which may affect the availability of automation features. Axiol is not responsible for
              changes to Instagram&apos;s policies or API.
            </P>
          </Section>

          <Section title="5. Intellectual Property">
            <P>
              The Axiol platform, including its design, code, and branding, is owned by us. You
              retain ownership of the content you create and upload (collections, product links,
              profile information). By using the Service, you grant us a limited license to display
              your public content on your creator page.
            </P>
          </Section>

          <Section title="6. Limitation of Liability">
            <P>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranties of any kind. To the maximum extent permitted by law:
            </P>
            <Ul>
              <li>
                We are not liable for any indirect, incidental, consequential, or punitive damages
                arising from your use of the Service.
              </li>
              <li>
                We are not responsible for lost revenue, missed messages, or failed automations due
                to Instagram API changes, downtime, or rate limiting.
              </li>
              <li>
                Our total liability for any claim related to the Service shall not exceed the amount
                you paid us in the 12 months preceding the claim.
              </li>
            </Ul>
          </Section>

          <Section title="7. Termination">
            <P>
              You may delete your account at any time. We may suspend or terminate your account if
              you violate these Terms, engage in prohibited conduct, or if we are required to do so
              by law. Upon termination, we will delete your data in accordance with our Privacy
              Policy.
            </P>
          </Section>

          <Section title="8. Changes to These Terms">
            <P>
              We may update these Terms from time to time. If we make material changes, we will
              notify you by email or by posting a notice on the platform. Your continued use of
              Axiol after changes are posted constitutes acceptance of the updated Terms.
            </P>
          </Section>

          <Section title="9. Contact Us">
            <P>
              If you have questions about these Terms, contact us at{" "}
              <a
                href="mailto:gopinho@protonmail.com"
                className="text-primary decoration-primary/30 hover:decoration-primary font-medium underline underline-offset-2"
              >
                gopinho@protonmail.com
              </a>
              .
            </P>
          </Section>
        </div>

        <footer className="border-border text-muted-foreground mt-14 border-t pt-6 text-center text-xs">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
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
