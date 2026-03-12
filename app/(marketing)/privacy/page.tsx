import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
      <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: February 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information you provide directly: email address, display name, profile
            information, food logs, weight entries, water intake, and messages in group chats.
            We also collect usage data such as feature interactions and session information to
            improve the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">
            Your data is used to: provide and maintain the Service, calculate calorie and
            macro targets, enable accountability group features, send notifications, process
            payments, and improve the Service. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Third-Party Services</h2>
          <p className="text-muted-foreground">
            We use the following third-party services that may process your data:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>
              <strong>Supabase</strong> — Database hosting and authentication
            </li>
            <li>
              <strong>Stripe</strong> — Payment processing (we never store your card details)
            </li>
            <li>
              <strong>USDA FoodData Central</strong> — Food nutrition data lookups
            </li>
            <li>
              <strong>Vercel</strong> — Application hosting
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Data Security</h2>
          <p className="text-muted-foreground">
            Your data is stored securely using Supabase with PostgreSQL row-level security
            policies. All data transmission is encrypted via HTTPS. We implement
            industry-standard security measures to protect your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Data Sharing in Groups</h2>
          <p className="text-muted-foreground">
            When you join an accountability group, certain information is shared with group
            members: your display name, avatar, daily calorie summary, streak information,
            achievements, and messages you send in group chat. Detailed food logs are not
            shared with group members.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Your Rights</h2>
          <p className="text-muted-foreground">
            You have the right to: access your personal data, request correction of
            inaccurate data, request deletion of your account and data, export your data, and
            opt out of non-essential communications. To exercise these rights, contact us at
            support@unweighted.app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Cookies</h2>
          <p className="text-muted-foreground">
            We use essential cookies for authentication and session management. We do not use
            third-party tracking cookies or advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground">
            Unweighted is not intended for users under 13 years of age. We do not knowingly
            collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy periodically. We will notify you of significant
            changes via email or in-app notification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Contact</h2>
          <p className="text-muted-foreground">
            For privacy-related questions, contact us at support@unweighted.app.
          </p>
        </section>

        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Beta Notice:</strong> Unweighted is currently in beta. This privacy
            policy may be updated as we refine our data practices before full launch.
          </p>
        </div>
      </div>
    </div>
  )
}
