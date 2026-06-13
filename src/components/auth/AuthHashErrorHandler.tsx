"use client";

import { useEffect, useState } from "react";

function parseAuthHashError(): string | null {
  if (typeof window === "undefined" || !window.location.hash) return null;

  const params = new URLSearchParams(window.location.hash.slice(1));
  const description = params.get("error_description");
  const code = params.get("error_code");

  if (description?.toLowerCase().includes("database error saving new user")) {
    return "We could not finish creating your account. The store database needs a quick update — please contact support or try email sign-up.";
  }

  if (description) {
    return description.replace(/\+/g, " ");
  }

  if (code === "unexpected_failure") {
    return "Google sign-in failed unexpectedly. Please try again.";
  }

  return null;
}

export function AuthHashErrorHandler({
  onError,
}: {
  onError: (message: string) => void;
}) {
  const [, setReady] = useState(false);

  useEffect(() => {
    const message = parseAuthHashError();
    if (message) onError(message);
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
    setReady(true);
  }, [onError]);

  return null;
}
