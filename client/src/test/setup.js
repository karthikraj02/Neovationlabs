import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement IntersectionObserver, which Framer Motion's
// `whileInView` relies on. Stub it so animated sections mount without
// throwing in tests.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = IntersectionObserverStub;
}

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom doesn't implement scrollTo; RootLayout calls it on every route
// change. Stub it so tests don't print "Not implemented" noise.
window.scrollTo = () => {};
