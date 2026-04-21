import Link from "next/link";

export const metadata = {
  title: "Data Deletion — Axiol",
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 space-y-2">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; Back to Axiol
          </Link>
          <h1 className="font-accent mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Data Deletion
          </h1>
          <p className="text-sm text-muted-foreground">
            How to delete your data from Axiol.
          </p>
        </header>

        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="font-accent text-xl font-bold tracking-tight text-foreground">
              Delete Your Account
            </h2>
            <p className="text-[0.938rem] leading-relaxed text-muted-foreground">
              You can permanently delete your Axiol account and all associated
              data directly from your dashboard:
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-[0.938rem] leading-relaxed text-muted-foreground marker:text-border marker:font-semibold">
              <li>Log in to your Axiol account.</li>
              <li>
                Go to{" "}
                <Link
                  href="/dashboard/settings"
                  className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                >
                  Settings
                </Link>
                .
              </li>
              <li>
                Select the <strong className="text-foreground">Advanced</strong>{" "}
                tab.
              </li>
              <li>
                Click{" "}
                <strong className="text-foreground">Delete Account</strong> and
                follow the confirmation prompt.
              </li>
            </ol>
            <p className="text-[0.938rem] leading-relaxed text-muted-foreground">
              This will permanently delete your account along with all
              collections, items, Instagram configurations, automation mappings,
              and activity logs. This action cannot be undone.
            </p>
          </section>

          <div className="h-px bg-border" />

          <section className="space-y-4">
            <h2 className="font-accent text-xl font-bold tracking-tight text-foreground">
              Disconnect Instagram
            </h2>
            <p className="text-[0.938rem] leading-relaxed text-muted-foreground">
              If you only want to remove your Instagram connection without
              deleting your entire account, you can revoke Axiol&apos;s access
              from your Instagram settings:
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-[0.938rem] leading-relaxed text-muted-foreground marker:text-border marker:font-semibold">
              <li>Open the Instagram app and go to your profile.</li>
              <li>
                Tap the menu, then{" "}
                <strong className="text-foreground">
                  Settings and privacy
                </strong>
                .
              </li>
              <li>
                Navigate to{" "}
                <strong className="text-foreground">Website permissions</strong>{" "}
                &gt;{" "}
                <strong className="text-foreground">Apps and websites</strong>.
              </li>
              <li>
                Find <strong className="text-foreground">Axiol</strong> and
                remove it.
              </li>
            </ol>
          </section>

          <div className="h-px bg-border" />

          <section className="space-y-4">
            <h2 className="font-accent text-xl font-bold tracking-tight text-foreground">
              Contact Us
            </h2>
            <p className="text-[0.938rem] leading-relaxed text-muted-foreground">
              If you are unable to access your account or need assistance with
              data deletion, contact us at{" "}
              <a
                href="mailto:gopinho@protonmail.com"
                className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
              >
                gopinho@protonmail.com
              </a>
              . We will process your request within 30 days.
            </p>
          </section>
        </div>

        <footer className="mt-14 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <span className="mx-2">&middot;</span>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </footer>
      </div>
    </main>
  );
}
