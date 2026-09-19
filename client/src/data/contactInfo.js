// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/

// The company's phone / WhatsApp number, written once. `tel:` needs the +country
// code with no spaces; wa.me needs digits only (no +).
export const PHONE_DISPLAY = "+91 99017 23492";
export const PHONE_TEL = "tel:+919901723492";
export const WHATSAPP_NUMBER = "919901723492";

/** A wa.me link that opens a WhatsApp chat with us, optionally with text ready to send. */
export function whatsappLink(text) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

const MAX_MESSAGE_CHARS = 600; // keeps the link a comfortable length for WhatsApp

/** The WhatsApp text a visitor sends after submitting the project request form. */
export function projectRequestWhatsAppText(data) {
  const message = (data.message || "").trim();
  const clipped = message.length > MAX_MESSAGE_CHARS ? `${message.slice(0, MAX_MESSAGE_CHARS).trimEnd()}…` : message;
  return [
    "Hi NeovationLabs, I just sent a project request through your website.",
    "",
    `Name: ${data.name}`,
    data.company ? `Company: ${data.company}` : null,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    `Project type: ${data.projectType}`,
    "",
    clipped,
  ]
    .filter((line) => line !== null)
    .join("\n");
}
