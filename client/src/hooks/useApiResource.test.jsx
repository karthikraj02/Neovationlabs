// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useApiResource } from "./useApiResource";

const fallback = [{ id: "built-in" }];

describe("useApiResource", () => {
  it("returns what the API answers", async () => {
    const { result } = renderHook(() => useApiResource(async () => [{ id: "from-api" }], { fallback }));

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.data).toEqual([{ id: "from-api" }]);
    expect(result.current.usedFallback).toBe(false);
  });

  it("uses the fallback, and says so, when the request fails", async () => {
    const { result } = renderHook(() =>
      useApiResource(
        async () => {
          throw new Error("network down");
        },
        { fallback }
      )
    );

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.data).toEqual(fallback);
    expect(result.current.usedFallback).toBe(true);
  });

  it("keeps an empty list empty by default, because empty is a real answer for things like enquiries", async () => {
    const { result } = renderHook(() => useApiResource(async () => [], { fallback }));

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.data).toEqual([]);
    expect(result.current.usedFallback).toBe(false);
  });

  it("shows the built-in content, quietly, when a content list comes back empty and emptyMeansFallback is on", async () => {
    // A database that is reachable but not filled yet answers with []. That is not an outage.
    const { result } = renderHook(() =>
      useApiResource(async () => [], { fallback, emptyMeansFallback: true })
    );

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.data).toEqual(fallback);
    expect(result.current.usedFallback).toBe(false); // no "couldn't reach the API" notice
  });

  it("still prefers real API content over the fallback when there is some", async () => {
    const { result } = renderHook(() =>
      useApiResource(async () => [{ id: "from-api" }], { fallback, emptyMeansFallback: true })
    );

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.data).toEqual([{ id: "from-api" }]);
  });

  it("does not turn an empty non-list answer into the fallback", async () => {
    const { result } = renderHook(() =>
      useApiResource(async () => null, { fallback, emptyMeansFallback: true })
    );

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.data).toBeNull();
  });
});
