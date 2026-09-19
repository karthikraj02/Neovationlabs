// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const submission = {
  name: "Ada Lovelace",
  company: "Analytical Engines Inc.",
  email: "ada@example.com",
  phone: "+44 20 7946 0000",
  projectType: "Generative AI",
  message: "We'd like to explore an internal knowledge assistant for our support team.",
};

const WHATSAPP_ENV = [
  "WHATSAPP_TO",
  "WHATSAPP_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_TEMPLATE",
  "WHATSAPP_TEMPLATE_LANGUAGE",
  "WHATSAPP_API_VERSION",
  "CALLMEBOT_API_KEY",
];

// The config reads process.env when first required, so each test sets its
// environment and then loads the service fresh. `fetch` is replaced, so no real
// message is ever sent.
function loadService(env = {}, fetchImpl) {
  jest.resetModules();
  WHATSAPP_ENV.forEach((key) => {
    process.env[key] = "";
  });
  Object.assign(process.env, env);
  global.fetch = fetchImpl || jest.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "" });
  // eslint-disable-next-line global-require
  return require("../src/services/whatsappService");
}

describe("WhatsApp alerts", () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
    WHATSAPP_ENV.forEach((key) => delete process.env[key]);
  });

  it("is skipped, not thrown, when no provider is configured", async () => {
    const service = loadService();
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = await service.sendContactWhatsApp(submission);

    expect(result).toEqual({ sent: false, reason: "whatsapp-not-configured" });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(service.activeProvider()).toBeNull();
    warn.mockRestore();
  });

  it("writes a readable alert with the visitor's details", () => {
    const { contactMessage } = loadService();

    const text = contactMessage(submission);

    expect(text).toContain("New project request — Generative AI");
    expect(text).toContain("Name: Ada Lovelace");
    expect(text).toContain("Company: Analytical Engines Inc.");
    expect(text).toContain("Email: ada@example.com");
    expect(text).toContain("Phone: +44 20 7946 0000");
    expect(text).toContain(submission.message);
    expect(text).not.toMatch(/budget/i);
  });

  it("shortens a very long message and leaves out a missing company", () => {
    const { contactMessage } = loadService();

    const text = contactMessage({ ...submission, company: "", message: "y".repeat(3000) });

    expect(text).not.toContain("Company:");
    expect(text.length).toBeLessThan(900);
    expect(text.endsWith("…")).toBe(true);
  });

  describe("Meta WhatsApp Cloud API", () => {
    const cloudEnv = { WHATSAPP_TOKEN: "test-token", WHATSAPP_PHONE_NUMBER_ID: "1234567890" };

    it("sends a text message to the company number when no template is set", async () => {
      const service = loadService(cloudEnv);

      const result = await service.sendContactWhatsApp(submission);

      expect(result).toEqual({ sent: true, provider: "cloud" });
      const [url, init] = global.fetch.mock.calls[0];
      expect(url).toBe("https://graph.facebook.com/v21.0/1234567890/messages");
      expect(init.method).toBe("POST");
      expect(init.headers.Authorization).toBe("Bearer test-token");
      const body = JSON.parse(init.body);
      expect(body).toMatchObject({ messaging_product: "whatsapp", to: "919901723492", type: "text" });
      expect(body.text.body).toContain("Name: Ada Lovelace");
    });

    it("uses the approved template, flattened to one line, when one is configured", async () => {
      const service = loadService({ ...cloudEnv, WHATSAPP_TEMPLATE: "new_project_request", WHATSAPP_TEMPLATE_LANGUAGE: "en_GB" });

      await service.sendContactWhatsApp(submission);

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.type).toBe("template");
      expect(body.template.name).toBe("new_project_request");
      expect(body.template.language.code).toBe("en_GB");
      const param = body.template.components[0].parameters[0].text;
      expect(param).not.toMatch(/[\n\r\t]/);
      expect(param).not.toMatch(/ {4,}/);
      expect(param).toContain("Ada Lovelace");
    });

    it("sends to a different number when WHATSAPP_TO is set", async () => {
      const service = loadService({ ...cloudEnv, WHATSAPP_TO: "+91 90000 11111" });

      await service.sendContactWhatsApp(submission);

      expect(JSON.parse(global.fetch.mock.calls[0][1].body).to).toBe("919000011111");
    });

    it("rejects with the provider's status when the API refuses, without leaking the token", async () => {
      const service = loadService(cloudEnv, jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => '{"error":{"message":"Invalid OAuth access token"}}',
      }));

      let error;
      try {
        await service.sendContactWhatsApp(submission);
      } catch (err) {
        error = err;
      }
      expect(error.message).toMatch(/cloud\) responded 401/);
      expect(error.message).not.toContain("test-token");
    });
  });

  describe("CallMeBot", () => {
    it("sends the alert to the company number with the API key", async () => {
      const service = loadService({ CALLMEBOT_API_KEY: "key-123" });

      const result = await service.sendContactWhatsApp(submission);

      expect(result).toEqual({ sent: true, provider: "callmebot" });
      const url = new URL(String(global.fetch.mock.calls[0][0]));
      expect(url.origin + url.pathname).toBe("https://api.callmebot.com/whatsapp.php");
      expect(url.searchParams.get("phone")).toBe("+919901723492");
      expect(url.searchParams.get("apikey")).toBe("key-123");
      expect(url.searchParams.get("text")).toContain("Name: Ada Lovelace");
    });

    it("rejects without putting the API key (which lives in the URL) in the error", async () => {
      const service = loadService({ CALLMEBOT_API_KEY: "key-123" }, jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => "APIKey is invalid",
      }));

      let error;
      try {
        await service.sendContactWhatsApp(submission);
      } catch (err) {
        error = err;
      }
      expect(error.message).toMatch(/callmebot\) responded 403/);
      expect(error.message).not.toContain("key-123");
    });

    it("prefers the official Cloud API when both are configured", async () => {
      const service = loadService({
        WHATSAPP_TOKEN: "test-token",
        WHATSAPP_PHONE_NUMBER_ID: "1234567890",
        CALLMEBOT_API_KEY: "key-123",
      });

      expect(service.activeProvider()).toBe("cloud");
    });
  });
});
