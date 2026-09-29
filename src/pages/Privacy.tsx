import { Link } from "react-router-dom";

const Privacy = () => (
  <main className="min-h-screen bg-background px-4 py-12">
    <article className="mx-auto max-w-3xl space-y-6">
      <Link to="/signup" className="text-sm text-primary hover:underline">
        Back to sign up
      </Link>
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="text-muted-foreground">
        ZAAR uses the information you provide to operate your account, deliver
        requested notifications, and improve the service.
      </p>
      <p className="text-muted-foreground">
        We do not ask for sensitive information that is not needed for the service.
        Contact the ZAAR team if you have questions about your account data.
      </p>
    </article>
  </main>
);

export default Privacy;
