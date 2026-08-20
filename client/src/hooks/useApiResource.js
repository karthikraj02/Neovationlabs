import { useCallback, useEffect, useState } from "react";

/**
 * Fetches a resource with real loading/error/retry states.
 * If `fallback` is provided and the request fails, the fallback data is
 * used so the page still renders — the caller can display a small
 * "couldn't reach the API" notice via `usedFallback` + `retry()`.
 */
export function useApiResource(fetchFn, { fallback = null, deps = [] } = {}) {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [data, setData] = useState(fallback);
  const [error, setError] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      setUsedFallback(false);
      setStatus("success");
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      if (fallback !== null) {
        setData(fallback);
        setUsedFallback(true);
        setStatus("success");
      } else {
        setStatus("error");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { status, data, error, usedFallback, retry: load };
}
