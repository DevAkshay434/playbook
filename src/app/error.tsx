"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-10 text-center gap-4">
      <h2 className="text-xl font-bold">Something went wrong.</h2>
      <p className="text-[var(--ink-2)] text-sm">Please refresh or try again.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-[var(--navy)] text-white rounded-md mt-4 font-bold text-sm"
      >
        Try again
      </button>
    </div>
  );
}
