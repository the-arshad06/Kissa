import MainLayout from '../components/MainLayout'

export default function Terms() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-headline md:text-display-mobile font-bold mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-on-surface-variant mb-10">Last updated: {new Date().getFullYear()}</p>

        <div className="flex flex-col gap-8 text-on-surface leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-bold mb-2">1. What KISSA Is</h2>
            <p className="text-sm">
              KISSA is a crowd-sourced archive where people share local histories, oral traditions,
              and personal memories tied to real places. By creating an account, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold mb-2">2. Your Content</h2>
            <p className="text-sm">
              You retain ownership of every story, photo, and comment you post. By publishing on KISSA,
              you grant other users the right to view, like, comment on, and share it within the app.
              You're responsible for making sure you have the right to share any photo or account you post —
              please don't post someone else's copyrighted work without permission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold mb-2">3. Community Guidelines</h2>
            <p className="text-sm">
              Stories should be genuine and respectful. Don't post hate speech, harassment, spam, or
              deliberately false historical claims. Accounts that repeatedly violate this may be
              suspended.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold mb-2">4. Accounts</h2>
            <p className="text-sm">
              You're responsible for keeping your login credentials secure. You must be old enough to
              legally use online services in your country to create an account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold mb-2">5. Changes</h2>
            <p className="text-sm">
              These terms may be updated as KISSA grows. Continuing to use the app after a change means
              you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold mb-2">6. Questions</h2>
            <p className="text-sm">
              Reach out any time through the{' '}
              <a href="/contact" className="text-primary underline">
                Contact page
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}
