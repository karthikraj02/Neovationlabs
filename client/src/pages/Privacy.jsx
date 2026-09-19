// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import LegalPage from "../components/ui/LegalPage";

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="August 2026">
      <p>
        This is a placeholder privacy policy for NeovationLabs. Replace this
        content with a policy reviewed by legal counsel before launch,
        covering what data is collected through this site (including the
        contact form), how it is stored, who it is shared with, and how
        visitors can request deletion.
      </p>
      <h2>What we collect</h2>
      <p>
        Information submitted through the contact form — name, company,
        email, phone, project type, and message — is stored to
        respond to your inquiry. It is also sent to our team by email and
        WhatsApp so we can reply quickly.
      </p>
      <h2>How we use it</h2>
      <p>
        Submitted information is used solely to evaluate and respond to
        project inquiries. It is not sold or shared with third parties for
        marketing purposes.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to{" "}
        <a href="mailto:neovationlabs@outlook.com" className="text-signal hover:underline">
          neovationlabs@outlook.com
        </a>{" "}
        or{" "}
        <a href="mailto:neovationlabs.official@gmail.com" className="text-signal hover:underline">
          neovationlabs.official@gmail.com
        </a>
        .
      </p>
    </LegalPage>
  );
}
