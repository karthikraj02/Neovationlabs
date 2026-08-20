import LegalPage from "../components/ui/LegalPage";

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="August 2026">
      <p>
        This is a placeholder terms of service page for NeovationLabs. Replace
        this content with terms reviewed by legal counsel before launch.
      </p>
      <h2>Use of this site</h2>
      <p>
        This website is provided for informational purposes about
        NeovationLabs's services. Content should not be treated as a binding
        offer until confirmed in a signed agreement.
      </p>
      <h2>Project engagements</h2>
      <p>
        Any actual client engagement is governed by a separate, signed
        statement of work — not by this website's content.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{" "}
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
