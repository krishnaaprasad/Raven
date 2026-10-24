import Link from "next/link";

export const metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-(--theme-bg) px-6">
      <div className="text-center max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-(--theme-muted) mb-4">404</p>
        <h1 className="font-[Crimson_Text] text-3xl sm:text-4xl font-semibold text-(--theme-text) mb-3">
          This page has faded away
        </h1>
        <p className="text-sm text-(--theme-muted) mb-8">
          The page you&apos;re looking for doesn&apos;t exist or is no longer available.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/collection"
            className="px-6 py-3 bg-(--theme-text) text-(--theme-bg) text-xs uppercase tracking-[0.2em] hover:opacity-90 transition"
          >
            Shop the Collection
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-(--theme-border) text-(--theme-text) text-xs uppercase tracking-[0.2em] hover:bg-(--theme-soft) transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
