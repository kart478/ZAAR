import { Link } from "react-router-dom";

const Terms = () => (
  <main className="min-h-screen bg-background px-4 py-12">
    <article className="mx-auto max-w-3xl space-y-6">
      <Link to="/signup" className="text-sm text-primary hover:underline">
        Back to sign up
      </Link>
      <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
      <p className="text-muted-foreground">
        By using ZAAR, you agree to use the service lawfully, respect other members,
        and keep your account credentials secure.
      </p>
      <p className="text-muted-foreground">
        We may update these terms as the service changes. Continued use after an
        update means you accept the revised terms.
      </p>
    </article>
  </main>
);

export default Terms;
