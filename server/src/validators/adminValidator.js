// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const { z } = require("zod");

// Must match the enums in models/ContactSubmission.js and models/DemoBooking.js.
const enquiryStatuses = ["new", "reviewed", "archived"];
const demoBookingStatuses = ["requested", "scheduled", "completed", "cancelled"];
const projectStatuses = ["planning", "in-progress", "review", "on-hold", "completed"];
const projectPriorities = ["low", "medium", "high"];

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});

// Dates arrive as ISO strings; "" or null clears the field.
const optionalDate = z
  .union([
    z.literal(""),
    z.null(),
    z.string().max(40).refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date"),
  ])
  .transform((v) => (v ? new Date(v) : null))
  .optional();

const nonEmpty = (schema) =>
  schema.refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Nothing to update",
  });

const enquiryUpdateSchema = z.object({
  status: z.enum(enquiryStatuses),
});

const demoBookingUpdateSchema = nonEmpty(
  z.object({
    status: z.enum(demoBookingStatuses).optional(),
    meetingLink: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "Use an https:// meeting link")
      .optional(),
    scheduledFor: optionalDate,
  })
);

const milestoneSchema = z.object({
  title: z.string().trim().min(1, "Milestone needs a title").max(160),
  dueDate: optionalDate,
  done: z.boolean().optional(),
});

const projectFields = {
  name: z.string().trim().min(2, "Enter a project name").max(160),
  client: z.string().trim().min(1, "Enter the client").max(160),
  clientEmail: z.string().trim().email("Enter a valid email address").max(200).optional().or(z.literal("")),
  status: z.enum(projectStatuses).optional(),
  priority: z.enum(projectPriorities).optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  startDate: optionalDate,
  dueDate: optionalDate,
  budget: z.string().trim().max(60).optional(),
  description: z.string().trim().max(4000).optional(),
  techStack: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  team: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  milestones: z.array(milestoneSchema).max(50).optional(),
};

const projectCreateSchema = z.object(projectFields);
const projectUpdateSchema = nonEmpty(z.object(projectFields).partial());

const projectNoteSchema = z.object({
  text: z.string().trim().min(1, "Write an update").max(2000),
});

module.exports = {
  enquiryStatuses,
  demoBookingStatuses,
  projectStatuses,
  projectPriorities,
  loginSchema,
  enquiryUpdateSchema,
  demoBookingUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  projectNoteSchema,
};
