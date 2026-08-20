const { z } = require("zod");

const projectTypes = [
  "Generative AI",
  "Custom Software",
  "Computer Vision",
  "AI Agents",
  "Data Engineering",
  "MLOps",
  "Predictive Analytics",
  "Other",
];

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address").max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  projectType: z.enum(projectTypes, {
    errorMap: () => ({ message: "Select a valid project type" }),
  }),
  budget: z.string().trim().min(1, "Select a budget range").max(60),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(4000),
  // Honeypot — must arrive empty. Populated only by bots that fill every
  // field on a form; real browsers never show this input to a visitor.
  website: z.string().max(0).optional().or(z.literal("")),
});

module.exports = { contactSchema, projectTypes };
