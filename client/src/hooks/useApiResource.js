// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useCallback, useEffect, useState } from "react";

/**
 * Fetches a resource with real loading/error/retry states.
 * If `fallback` is provided and the request fails, the fallback data is
 * used so the page still renders — the caller can display a small
 * "couldn't reach the API" notice via `usedFallback` + `retry()`.
 *
 * `emptyMeansFallback` is for content lists that ship with the site itself
 * (services, insights). A database that is reachable but has not been filled
 * yet answers with an empty list, which is not an outage, so the built-in
 * content is shown quietly, with no "couldn't reach the API" notice. Leave it
 * off for real data such as enquiries, where empty is a true answer.
 */
export function useApiResource(fetchFn, { fallback = null, deps = [], emptyMeansFallback = false } = {}) {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [data, setData] = useState(fallback);
  const [error, setError] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const result = await fetchFn();
      const isEmptyList = Array.isArray(result) && result.length === 0;
      setData(emptyMeansFallback && isEmptyList && fallback !== null ? fallback : result);
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
