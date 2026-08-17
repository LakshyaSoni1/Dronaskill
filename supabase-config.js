/* ══════════════════════════════════════════════════════════════════════════
   Dronaskill — Supabase project config
   ──────────────────────────────────────────────────────────────────────────
   Plain classic script, window global — same pattern as skills-data.js and
   certification-data.js, so it loads over file:// with no build step.

   The anon/public key below is safe to ship in client-side code by design —
   it identifies the project, it does not grant privileged access. Real
   access control lives in Supabase's Row Level Security policies on the
   database side, not in keeping this key secret.
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  global.DRONA_SUPABASE = {
    url: "https://tqiookmyndiasgiooyxj.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaW9va215bmRpYXNnaW9veXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NTAzNzMsImV4cCI6MjEwMjUyNjM3M30.bcaSxVZPe1nXLoagUmdoPzgWELnjJW-tqQDQaVjukr8"
  };
})(window);
