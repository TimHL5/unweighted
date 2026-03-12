import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
      <h1 className="mb-2 text-3xl font-bold">Terms of Service</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: February 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using Unweighted (&quot;the Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use the
            Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Description of Service</h2>
          <p className="text-muted-foreground">
            Unweighted is a calorie tracking application with accountability group features.
            The Service allows users to log food intake, track macronutrients, join
            accountability groups, and participate in gamification features.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. User Accounts</h2>
          <p className="text-muted-foreground">
            You must create an account to use the Service. You are responsible for maintaining
            the confidentiality of your account credentials and for all activities under your
            account. You must provide accurate and complete information when creating your
            account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
          <p className="text-muted-foreground">
            You agree not to misuse the Service. This includes but is not limited to:
            harassing other users, posting inappropriate content in group chats, attempting to
            exploit or disrupt the Service, or violating any applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Subscriptions & Billing</h2>
          <p className="text-muted-foreground">
            Some features require a paid subscription. Subscriptions are billed monthly or
            yearly through Stripe. You may cancel at any time and will retain access until the
            end of your billing period. Refunds are handled on a case-by-case basis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Health Disclaimer</h2>
          <p className="text-muted-foreground">
            Unweighted is not a medical service and does not provide medical advice. The
            calorie and macro targets are estimates for informational purposes only. Always
            consult a healthcare professional before making significant changes to your diet
            or exercise routine.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Intellectual Property</h2>
          <p className="text-muted-foreground">
            All content, features, and functionality of the Service are owned by Unweighted
            and are protected by copyright, trademark, and other intellectual property laws.
            You retain ownership of any content you submit (food logs, messages, etc.).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            The Service is provided &quot;as is&quot; without warranties of any kind. Unweighted
            shall not be liable for any indirect, incidental, special, or consequential
            damages resulting from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these Terms at any time. We will notify users of
            significant changes via email or in-app notification. Continued use after changes
            constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Contact</h2>
          <p className="text-muted-foreground">
            If you have questions about these Terms, please contact us at
            support@unweighted.app.
          </p>
        </section>
      </div>
    </div>
  )
}
