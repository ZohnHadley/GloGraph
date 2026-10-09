/* ============================================================================
   GloGraph landing page — downloads + email capture.

   GloGraph is completely free; the primary CTA is downloading the app, with an
   email list for new builds and the devlog. Every CTA carries a data-cta="..."
   attribute, so we log which buttons get pressed, plus the email signups
   themselves. Wire trackEvent() to your analytics provider. Each email form's
   `action` is set in index.html (the `.notify__form` elements).
   ========================================================================== */

/* ── Analytics hook ────────────────────────────────────────────────────────
   Replace the body with your provider. All CTA clicks + form submits flow here. */
function trackEvent(name, props) {
  const merged = props || {};
  // Plausible custom event (the script is loaded in <head>; window.plausible is queued
  // until it loads, so early clicks aren't lost). Falls back to console when not present
  // (e.g. local file:// dev before the domain is wired).
  if (window.plausible) window.plausible(name, { props: merged });
  else console.log("[cta]", name, merged);
}

/* ── Log every CTA click ─────────────────────────────────────────────────── */
document.querySelectorAll("[data-cta]").forEach((el) => {
  el.addEventListener("click", () => {
    trackEvent("cta_click", { cta: el.getAttribute("data-cta"), text: el.textContent.trim() });
  });
});

/* ── Email capture (binds every .notify__form on the page) ────────────────────
   Submits via fetch so the user stays on the page and sees the inline success
   message, instead of redirecting to the provider's confirmation page. Buttondown
   is cross-origin and returns an opaque (no-cors) response, so we can't read
   success/failure: the subscribe is fire-and-forget and we confirm optimistically
   (network errors are swallowed). The form's native required/email validation runs
   before this handler, so the email is already valid here. */
document.querySelectorAll(".notify__form").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailEl = form.querySelector('input[name="email"]');
    const email = emailEl ? emailEl.value.trim() : "";
    trackEvent("notify_submit", {
      email_domain: email.split("@")[1] || "",
      where: form.getAttribute("data-where") || "",   // hero vs footer, to see what converts
    });

    // Fire the subscribe (skipped in pure demand-test mode with no real action URL).
    const action = form.getAttribute("action");
    if (action && action !== "#") {
      fetch(action, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(new FormData(form)),
      }).catch(() => {});
    }

    // Confirm inline: hide the form and reveal its sibling [data-notify-ok].
    form.hidden = true;
    const ok = form.parentElement && form.parentElement.querySelector("[data-notify-ok]");
    if (ok) ok.hidden = false;
  });
});

/* ── Footer year ───────────────────────────────────────────────────────────── */
const yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();
