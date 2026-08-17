/* ══════════════════════════════════════════════════════════════════════════
   Dronaskill — company hiring criteria roster
   ──────────────────────────────────────────────────────────────────────────
   Plain classic script, window global — same pattern as skills-data.js /
   certification-data.js / supabase-config.js.

   A small, hand-curated set of illustrative hiring bars (career track +
   certification domain + minimum score) spanning both mass IT-services
   recruiters (Wipro, TCS, Infosys, Accenture, Cognizant — broader tracks,
   lower bar) and product companies (Google, Microsoft, Amazon, Flipkart,
   Zomato — narrower track, higher bar). This is illustrative, not a live
   feed from any real employer — used to give a student a concrete, honest
   "here's what you currently clear" signal on dashboard.html, and reused by
   recruiters.html's demo mode so both sides of the site tell one consistent
   story.
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  var COMPANIES = [
    { id: "wipro",     name: "Wipro",      tier: "mass",    tracks: ["sde", "backend", "frontend", "fullstack"],            domain: "CS Fundamentals", minScore: 6 },
    { id: "tcs",       name: "TCS Digital", tier: "mass",    tracks: ["sde", "backend", "fullstack", "data-analyst"],        domain: "CS Fundamentals", minScore: 6 },
    { id: "infosys",   name: "Infosys",    tier: "mass",    tracks: ["sde", "backend", "frontend"],                          domain: "CS Fundamentals", minScore: 6 },
    { id: "accenture", name: "Accenture",  tier: "mass",    tracks: ["fullstack", "backend", "product-manager", "business-analyst"], domain: "CS Fundamentals", minScore: 6 },
    { id: "cognizant", name: "Cognizant",  tier: "mass",    tracks: ["backend", "data-analyst", "sde"],                      domain: "Backend & Infra", minScore: 6 },

    { id: "google",    name: "Google",     tier: "product", tracks: ["sde"],             domain: "CS Fundamentals",  minScore: 8 },
    { id: "microsoft", name: "Microsoft",  tier: "product", tracks: ["backend"],         domain: "Backend & Infra",  minScore: 7 },
    { id: "amazon",    name: "Amazon",     tier: "product", tracks: ["fullstack"],       domain: "CS Fundamentals",  minScore: 7 },
    { id: "flipkart",  name: "Flipkart",   tier: "product", tracks: ["frontend"],        domain: "Frontend",         minScore: 7 },
    { id: "zomato",    name: "Zomato",     tier: "product", tracks: ["product-manager"], domain: "Product & Business", minScore: 7 }
  ];

  /* A student matches a company if their career track is one the company
     hires for (or the company doesn't restrict by track) AND they hold a
     certification in that company's domain at or above its minimum score. */
  function matchCompanies(trackId, certifications) {
    certifications = certifications || [];
    return COMPANIES.filter(function (c) {
      var trackOk = !c.tracks.length || c.tracks.indexOf(trackId) !== -1;
      if (!trackOk) return false;
      return certifications.some(function (cert) {
        return cert.domain === c.domain && cert.score >= c.minScore;
      });
    });
  }

  function getCompany(id) {
    for (var i = 0; i < COMPANIES.length; i++) if (COMPANIES[i].id === id) return COMPANIES[i];
    return null;
  }

  global.DRONA_COMPANIES = {
    COMPANIES: COMPANIES,
    matchCompanies: matchCompanies,
    getCompany: getCompany
  };
})(window);
