import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-8 text-center">
      <p className="text-5xl">🌙</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-ink-500">This corner of HerSpace doesn’t exist yet.</p>
      <Link
        to="/today"
        className="mt-8 rounded-full bg-gradient-to-r from-blossom-400 to-lilac-300 px-8 py-3 font-medium text-white shadow-md"
      >
        Back to Today
      </Link>
    </div>
  );
}
