const request = require("supertest");

describe("Contact rate limiter", () => {
  let app;
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    // Rebuild the app with NODE_ENV temporarily not "test" so the
    // limiter's skip() (which only fires under the test suite itself)
    // does not apply here — this test exists specifically to prove the
    // limiter is active outside of automated tests.
    jest.resetModules();
    process.env.NODE_ENV = "development";
    // eslint-disable-next-line global-require
    app = require("../src/app");
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  const payload = {
    name: "Rate Limit Test",
    email: "not-an-email", // intentionally invalid — we only care about
    // the 429 kicking in before/regardless of body validation, and we
    // don't want this test to depend on the ContactSubmission model.
    projectType: "Other",
    budget: "Under $10k",
    message: "x".repeat(25),
  };

  it("returns 429 after exceeding the request limit for one IP", async () => {
    const agent = request(app);
    let lastStatus;

    for (let i = 0; i < 6; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await agent.post("/api/contact").send(payload);
      lastStatus = res.statusCode;
    }

    expect(lastStatus).toBe(429);
  });
});
