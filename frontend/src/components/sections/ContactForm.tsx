"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/**
 * The source has no backend — script.js just prevents the default submit,
 * shows a status message, and resets the form. This mirrors that exactly
 * rather than wiring up a Server Action for a form that has nowhere to send
 * its data.
 */
export function ContactForm() {
  const { ref, isVisible } = useScrollReveal<HTMLFormElement>();
  const [status, setStatus] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Thanks — we'll reach out within 24 hours.");
    e.currentTarget.reset();
  }

  return (
    <form
      className={isVisible ? "form reveal is-visible" : "form reveal"}
      noValidate
      ref={ref}
      onSubmit={handleSubmit}
    >
      {/* autocomplete tokens let browsers/password managers fill fields, and
          inputMode brings up the right mobile keyboard — both UX + a11y wins. */}
      <div className="row">
        <div className="field">
          <label htmlFor="fn">First name</label>
          <input id="fn" name="firstName" autoComplete="given-name" required />
        </div>
        <div className="field">
          <label htmlFor="ln">Last name</label>
          <input id="ln" name="lastName" autoComplete="family-name" required />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="em">Email</label>
          <input id="em" name="email" type="email" autoComplete="email" inputMode="email" required />
        </div>
        <div className="field">
          <label htmlFor="ph">Phone</label>
          <input id="ph" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="sv">Service</label>
        <select id="sv" name="service">
          <option>Criminal Defense</option>
          <option>Legal Consultation</option>
          <option>Mergers &amp; Acquisitions</option>
          <option>Family Law</option>
          <option>Other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="ms">Message</label>
        <textarea id="ms" name="message" required />
      </div>

      {/* No checkbox required just to reply to an enquiry — that's legitimate
          interest, not consent. A separate, unticked opt-in is only needed
          for the genuinely optional marketing use below (PECR/UK GDPR). */}
      <p className="form-privacy-note">
        We&apos;ll only use these details to respond to your enquiry. See our{" "}
        <Link href="/legal/privacy-policy">Privacy Policy</Link> for how long we keep it and your rights.
      </p>

      <label className="form-consent">
        <input type="checkbox" name="marketingOptIn" />
        <span>Yes, I&apos;d like to receive occasional legal updates from ALLS by email. You can unsubscribe at any time.</span>
      </label>

      <Button type="submit" variant="gold" arrow>
        Send Message
      </Button>
      <p className="form-status" role="status">
        {status}
      </p>
    </form>
  );
}
