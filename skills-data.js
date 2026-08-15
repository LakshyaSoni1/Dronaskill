/* ══════════════════════════════════════════════════════════════════════════
   Dronaskill — skill catalogue + career tracks
   ──────────────────────────────────────────────────────────────────────────
   Plain classic script (no modules) so every page can load it over file://
   with a simple <script src="skills-data.js"></script> and read window.DRONA.

   SKILLS   : the master catalogue. One entry per learnable skill.
              level  = foundation | core | advanced | career
              hours  = realistic hours to reach "can use it on a project"
   TRACKS   : career goals. Each maps to an ordered list of skill ids.
   buildPlan: profile -> ordered checklist, with already-known skills marked.
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  /* ── Master skill catalogue ───────────────────────────────────────────── */
  var SKILLS = {

    /* ─── Universal employability (attached to every track) ─────────────── */
    "comm-english":      { domain: "Employability", name: "Professional English & Communication", level: "foundation", hours: 30, desc: "Speaking, writing and explaining your work clearly — the skill that decides most interviews." },
    "aptitude":          { domain: "Employability", name: "Aptitude & Logical Reasoning",         level: "foundation", hours: 40, desc: "Quant, logic and data interpretation — the first filter in most campus and off-campus hiring." },
    "git":               { domain: "Employability", name: "Git & GitHub",                          level: "foundation", hours: 15, desc: "Version control, branches, pull requests, and keeping a public commit history." },
    "ai-tools":          { domain: "Employability", name: "Working With AI Tools",                 level: "foundation", hours: 12, desc: "Using Claude/Copilot to learn and build faster — and knowing when not to trust them." },
    "resume-portfolio":  { domain: "Employability", name: "Resume, LinkedIn & Portfolio",          level: "career",     hours: 20, desc: "A one-page resume, a real portfolio and a profile that gets shortlisted." },
    "interview-prep":    { domain: "Employability", name: "Interview Skills & Mock Practice",      level: "career",     hours: 30, desc: "Technical rounds, HR rounds, behavioural answers and handling pressure." },
    "teamwork-agile":    { domain: "Employability", name: "Teamwork & Agile Basics",               level: "career",     hours: 12, desc: "Standups, sprints, tickets, code review etiquette — how work actually happens in a team." },

    /* ─── Computer science fundamentals ─────────────────────────────────── */
    "cs-basics":         { domain: "CS Fundamentals", name: "Computer Fundamentals",                 level: "foundation", hours: 20, desc: "How a computer actually runs your code: memory, CPU, files, compilation." },
    "prog-basics":       { domain: "CS Fundamentals", name: "Programming Fundamentals",              level: "foundation", hours: 60, desc: "Variables, conditionals, loops, functions, arrays, strings, recursion — in one language." },
    "oop":               { domain: "CS Fundamentals", name: "Object-Oriented Programming",           level: "foundation", hours: 35, desc: "Classes, objects, inheritance, polymorphism, abstraction and when to use them." },
    "dsa-basic":         { domain: "CS Fundamentals", name: "DSA — Arrays to Trees",                 level: "core",       hours: 120, desc: "Arrays, strings, hashing, stacks, queues, linked lists, sorting, searching, trees." },
    "dsa-advanced":      { domain: "CS Fundamentals", name: "DSA — Graphs, DP & Greedy",             level: "advanced",   hours: 120, desc: "Graph algorithms, dynamic programming, greedy, backtracking, tries, heaps." },
    "complexity":        { domain: "CS Fundamentals", name: "Time & Space Complexity",               level: "core",       hours: 15, desc: "Big-O analysis — arguing why your solution is fast enough before you write it." },
    "dbms":              { domain: "CS Fundamentals", name: "DBMS Concepts",                         level: "core",       hours: 40, desc: "Normalisation, keys, transactions, ACID, indexing and isolation levels." },
    "sql":               { domain: "CS Fundamentals", name: "SQL",                                   level: "core",       hours: 40, desc: "Joins, aggregates, subqueries, window functions and query tuning." },
    "os":                { domain: "CS Fundamentals", name: "Operating Systems",                     level: "core",       hours: 45, desc: "Processes, threads, scheduling, deadlocks, memory management, paging." },
    "cn":                { domain: "CS Fundamentals", name: "Computer Networks",                     level: "core",       hours: 40, desc: "OSI/TCP-IP, HTTP, DNS, TCP vs UDP, TLS — the layer every backend bug lives in." },
    "linux":             { domain: "CS Fundamentals", name: "Linux & Shell",                         level: "core",       hours: 25, desc: "Filesystem, permissions, processes, pipes, ssh and everyday shell scripting." },
    "coa":               { domain: "CS Fundamentals", name: "Computer Organisation & Architecture",  level: "core",       hours: 45, desc: "Instruction cycles, pipelining, cache hierarchy, memory organisation." },
    "toc":               { domain: "CS Fundamentals", name: "Theory of Computation",                 level: "advanced",   hours: 45, desc: "Automata, regular and context-free languages, decidability." },
    "compiler":          { domain: "CS Fundamentals", name: "Compiler Design",                       level: "advanced",   hours: 40, desc: "Lexical analysis, parsing, syntax-directed translation, code generation." },
    "discrete-math":     { domain: "CS Fundamentals", name: "Discrete Mathematics",                  level: "foundation", hours: 45, desc: "Sets, relations, logic, combinatorics, graph theory, number theory." },
    "eng-math":          { domain: "CS Fundamentals", name: "Engineering Mathematics",               level: "foundation", hours: 60, desc: "Linear algebra, calculus, probability and numerical methods." },

    /* ─── Web — frontend ─────────────────────────────────────────────────── */
    "html-css":          { domain: "Frontend", name: "HTML & CSS",                            level: "foundation", hours: 40, desc: "Semantic markup, the box model, flexbox and grid — building a page that holds up." },
    "responsive":        { domain: "Frontend", name: "Responsive & Mobile-First Design",      level: "foundation", hours: 20, desc: "Breakpoints, fluid type, touch targets — one layout that works on every screen." },
    "javascript":        { domain: "Frontend", name: "JavaScript (ES6+)",                     level: "core",       hours: 70, desc: "DOM, events, async/await, promises, modules, closures, array methods." },
    "typescript":        { domain: "Frontend", name: "TypeScript",                            level: "core",       hours: 30, desc: "Types, interfaces, generics and narrowing — catching bugs before runtime." },
    "react":             { domain: "Frontend", name: "React",                                 level: "core",       hours: 60, desc: "Components, props, state, hooks, effects, lists and conditional rendering." },
    "state-mgmt":        { domain: "Frontend", name: "State Management & Data Fetching",      level: "core",       hours: 25, desc: "Context, reducers, React Query / Redux Toolkit, caching and loading states." },
    "routing-forms":     { domain: "Frontend", name: "Routing, Forms & Validation",           level: "core",       hours: 20, desc: "Client routing, controlled inputs, schema validation and error UX." },
    "nextjs":            { domain: "Frontend", name: "Next.js / SSR",                         level: "advanced",   hours: 35, desc: "File routing, server components, rendering strategies, SEO and deployment." },
    "web-perf":          { domain: "Frontend", name: "Web Performance",                       level: "advanced",   hours: 25, desc: "Core Web Vitals, bundle size, lazy loading, images and rendering cost." },
    "a11y":              { domain: "Frontend", name: "Accessibility (a11y)",                  level: "advanced",   hours: 20, desc: "Semantics, keyboard flows, ARIA, contrast — building for everyone, and for audits." },
    "frontend-testing":  { domain: "Frontend", name: "Frontend Testing",                      level: "advanced",   hours: 25, desc: "Unit tests, React Testing Library and end-to-end tests with Playwright." },

    /* ─── Web — backend & infrastructure ─────────────────────────────────── */
    "nodejs":            { domain: "Backend & Infra", name: "Node.js & Express",                     level: "core",       hours: 50, desc: "Server-side JS, routing, middleware, file and stream handling." },
    "backend-python":    { domain: "Backend & Infra", name: "Backend with Python (Django/FastAPI)",  level: "core",       hours: 50, desc: "Routing, ORM, serialisers, migrations and async endpoints." },
    "backend-java":      { domain: "Backend & Infra", name: "Backend with Java (Spring Boot)",       level: "core",       hours: 60, desc: "Controllers, services, JPA, dependency injection — the enterprise default." },
    "rest-api":          { domain: "Backend & Infra", name: "REST API Design",                       level: "core",       hours: 25, desc: "Resources, status codes, pagination, versioning and clean error contracts." },
    "auth-security":     { domain: "Backend & Infra", name: "Authentication & App Security",         level: "core",       hours: 30, desc: "Sessions, JWT, OAuth, hashing, RBAC and the OWASP basics." },
    "db-design":         { domain: "Backend & Infra", name: "Database Design & Modelling",           level: "core",       hours: 25, desc: "Schema design, relationships, indexes and migrations that don't hurt later." },
    "nosql":             { domain: "Backend & Infra", name: "NoSQL (MongoDB / Redis)",               level: "advanced",   hours: 25, desc: "Document modelling, aggregation pipelines, and caching with Redis." },
    "system-design-lo":  { domain: "Backend & Infra", name: "Low-Level Design",                      level: "advanced",   hours: 45, desc: "SOLID, design patterns and modelling a real feature into clean classes." },
    "system-design-hi":  { domain: "Backend & Infra", name: "High-Level System Design",              level: "advanced",   hours: 60, desc: "Load balancing, caching, queues, sharding, CAP — designing for scale." },
    "microservices":     { domain: "Backend & Infra", name: "Microservices & Message Queues",        level: "advanced",   hours: 35, desc: "Service boundaries, Kafka/RabbitMQ, retries and eventual consistency." },
    "docker":            { domain: "Backend & Infra", name: "Docker & Containers",                   level: "advanced",   hours: 25, desc: "Images, containers, volumes, networks and docker-compose for local stacks." },
    "ci-cd":             { domain: "Backend & Infra", name: "CI/CD Pipelines",                       level: "advanced",   hours: 25, desc: "GitHub Actions, automated tests, build artefacts and safe deploys." },
    "cloud-basics":      { domain: "Backend & Infra", name: "Cloud Fundamentals (AWS/Azure/GCP)",    level: "advanced",   hours: 45, desc: "Compute, storage, networking, IAM and cost — one cloud, properly." },
    "kubernetes":        { domain: "Backend & Infra", name: "Kubernetes",                            level: "advanced",   hours: 45, desc: "Pods, deployments, services, configmaps, scaling and rollouts." },
    "iac":               { domain: "Backend & Infra", name: "Infrastructure as Code (Terraform)",    level: "advanced",   hours: 30, desc: "Declarative infra, state, modules and reproducible environments." },
    "observability":     { domain: "Backend & Infra", name: "Monitoring & Observability",            level: "advanced",   hours: 25, desc: "Logs, metrics, traces, alerting and reading a dashboard during an incident." },
    "sre-basics":        { domain: "Backend & Infra", name: "Reliability & Incident Response",       level: "career",     hours: 20, desc: "SLIs/SLOs, on-call, postmortems and designing for graceful failure." },

    /* ─── Mobile ─────────────────────────────────────────────────────────── */
    "mobile-ui":         { domain: "Mobile", name: "Mobile UI & Layout",                    level: "foundation", hours: 25, desc: "Navigation patterns, gestures, safe areas and platform design guidelines." },
    "flutter":           { domain: "Mobile", name: "Flutter & Dart",                        level: "core",       hours: 60, desc: "Widgets, layout, state, packages — one codebase for Android and iOS." },
    "react-native":      { domain: "Mobile", name: "React Native",                          level: "core",       hours: 55, desc: "Cross-platform apps reusing your React knowledge and JS ecosystem." },
    "kotlin-android":    { domain: "Mobile", name: "Android with Kotlin",                   level: "core",       hours: 70, desc: "Jetpack Compose, activities, lifecycle, Room and the Android SDK." },
    "swift-ios":         { domain: "Mobile", name: "iOS with Swift",                        level: "core",       hours: 70, desc: "SwiftUI, view lifecycle, navigation and Apple's app conventions." },
    "mobile-state":      { domain: "Mobile", name: "Mobile State & Local Storage",          level: "core",       hours: 20, desc: "App state, offline-first data, local DBs and background sync." },
    "firebase":          { domain: "Mobile", name: "Firebase / BaaS",                       level: "core",       hours: 20, desc: "Auth, Firestore, storage, push notifications and analytics without a backend." },
    "app-release":       { domain: "Mobile", name: "App Store & Play Store Release",        level: "career",     hours: 15, desc: "Signing, store listings, review guidelines, staged rollouts and crash reports." },

    /* ─── Data & analytics ───────────────────────────────────────────────── */
    "python-basics":     { domain: "Data & Analytics", name: "Python Programming",                    level: "foundation", hours: 55, desc: "Syntax, data structures, functions, files and the standard library." },
    "excel":             { domain: "Data & Analytics", name: "Excel / Google Sheets",                 level: "foundation", hours: 25, desc: "Formulas, lookups, pivot tables and dashboards — still the most-used data tool." },
    "statistics":        { domain: "Data & Analytics", name: "Statistics & Probability",              level: "foundation", hours: 50, desc: "Distributions, sampling, hypothesis tests, confidence intervals, correlation." },
    "pandas":            { domain: "Data & Analytics", name: "NumPy & Pandas",                        level: "core",       hours: 45, desc: "Vectorised operations, dataframes, joins, groupby and reshaping." },
    "data-cleaning":     { domain: "Data & Analytics", name: "Data Cleaning & EDA",                   level: "core",       hours: 35, desc: "Missing values, outliers, types, and asking a dataset the first useful questions." },
    "data-viz":          { domain: "Data & Analytics", name: "Data Visualisation",                    level: "core",       hours: 25, desc: "Matplotlib, Seaborn and Plotly — choosing the chart that answers the question." },
    "bi-tools":          { domain: "Data & Analytics", name: "Power BI / Tableau",                    level: "core",       hours: 35, desc: "Data models, DAX/calculated fields and dashboards a manager will actually read." },
    "data-storytelling": { domain: "Data & Analytics", name: "Data Storytelling",                     level: "career",     hours: 20, desc: "Turning an analysis into a recommendation, a slide and a decision." },
    "ab-testing":        { domain: "Data & Analytics", name: "Experimentation & A/B Testing",         level: "advanced",   hours: 25, desc: "Hypotheses, sample size, significance, guardrail metrics and reading results honestly." },
    "data-pipelines":    { domain: "Data & Analytics", name: "Data Pipelines & ETL",                  level: "advanced",   hours: 40, desc: "Ingestion, transformation, scheduling with Airflow, and warehouse modelling." },
    "big-data":          { domain: "Data & Analytics", name: "Big Data (Spark)",                      level: "advanced",   hours: 40, desc: "Distributed processing, RDDs/DataFrames and working past single-machine limits." },

    /* ─── Machine learning & AI ──────────────────────────────────────────── */
    "ml-supervised":     { domain: "AI & ML", name: "Supervised Learning",                   level: "core",       hours: 60, desc: "Regression, trees, ensembles, SVM — fitting and interpreting real models." },
    "ml-unsupervised":   { domain: "AI & ML", name: "Unsupervised Learning",                 level: "core",       hours: 30, desc: "Clustering, dimensionality reduction and finding structure without labels." },
    "feature-eng":       { domain: "AI & ML", name: "Feature Engineering",                   level: "core",       hours: 30, desc: "Encoding, scaling, leakage, and the work that decides model quality." },
    "model-eval":        { domain: "AI & ML", name: "Model Evaluation & Validation",         level: "core",       hours: 25, desc: "Cross-validation, precision/recall, ROC, bias-variance and honest baselines." },
    "deep-learning":     { domain: "AI & ML", name: "Deep Learning",                         level: "advanced",   hours: 70, desc: "Neural nets, backprop, CNNs, RNNs and training with PyTorch or TensorFlow." },
    "nlp":               { domain: "AI & ML", name: "Natural Language Processing",           level: "advanced",   hours: 45, desc: "Tokenisation, embeddings, transformers and text classification." },
    "cv":                { domain: "AI & ML", name: "Computer Vision",                       level: "advanced",   hours: 45, desc: "Image processing, CNN architectures, detection and segmentation." },
    "genai-llm":         { domain: "AI & ML", name: "Generative AI & LLM Apps",              level: "advanced",   hours: 40, desc: "Prompting, embeddings, RAG, agents, evals and fine-tuning basics." },
    "mlops":             { domain: "AI & ML", name: "MLOps & Model Deployment",              level: "advanced",   hours: 40, desc: "Packaging models, serving APIs, versioning, monitoring and drift." },
    "ai-ethics":         { domain: "AI & ML", name: "Responsible AI",                        level: "career",     hours: 12, desc: "Bias, privacy, explainability and the limits you should state out loud." },

    /* ─── Cybersecurity ──────────────────────────────────────────────────── */
    "security-basics":   { domain: "Security", name: "Security Fundamentals",                 level: "foundation", hours: 30, desc: "CIA triad, threat models, attack surface and defence in depth." },
    "network-security":  { domain: "Security", name: "Network Security",                      level: "core",       hours: 40, desc: "Firewalls, VPNs, packet analysis with Wireshark, IDS/IPS and segmentation." },
    "cryptography":      { domain: "Security", name: "Applied Cryptography",                  level: "core",       hours: 30, desc: "Hashing, symmetric/asymmetric encryption, TLS, PKI and key handling." },
    "owasp":             { domain: "Security", name: "Web Application Security (OWASP)",      level: "core",       hours: 35, desc: "Injection, XSS, CSRF, broken auth, SSRF — finding and fixing the top ten." },
    "pentest-tools":     { domain: "Security", name: "Ethical Hacking Toolkit",               level: "advanced",   hours: 45, desc: "Nmap, Burp Suite, Metasploit, Hydra — reconnaissance through exploitation, in a lab." },
    "vapt":              { domain: "Security", name: "VAPT & Reporting",                      level: "advanced",   hours: 35, desc: "Running a scoped assessment and writing a report a client can act on." },
    "soc-siem":          { domain: "Security", name: "SOC Operations & SIEM",                 level: "advanced",   hours: 40, desc: "Log analysis, Splunk/ELK, alert triage and incident escalation." },
    "forensics":         { domain: "Security", name: "Digital Forensics & IR",                level: "advanced",   hours: 35, desc: "Evidence handling, disk and memory analysis, timelines and containment." },
    "grc":               { domain: "Security", name: "GRC & Compliance",                      level: "career",     hours: 25, desc: "ISO 27001, GDPR, India's DPDP Act, audits, policies and risk registers." },

    /* ─── Design (UI/UX) ─────────────────────────────────────────────────── */
    "design-principles": { domain: "Design", name: "Design Fundamentals",                   level: "foundation", hours: 30, desc: "Hierarchy, spacing, colour, typography, contrast and layout grids." },
    "figma":             { domain: "Design", name: "Figma",                                 level: "foundation", hours: 30, desc: "Frames, auto-layout, components, variants and shared libraries." },
    "wireframing":       { domain: "Design", name: "Wireframing & Information Architecture",level: "core",       hours: 25, desc: "User flows, sitemaps and low-fidelity screens before any pixel is polished." },
    "user-research":     { domain: "Design", name: "User Research",                         level: "core",       hours: 30, desc: "Interviews, surveys, personas, JTBD and synthesising what people actually need." },
    "prototyping":       { domain: "Design", name: "Prototyping & Interaction Design",      level: "core",       hours: 25, desc: "Clickable flows, states, micro-interactions and motion that carries meaning." },
    "design-systems":    { domain: "Design", name: "Design Systems",                        level: "advanced",   hours: 30, desc: "Tokens, components, documentation and handoff engineers can build from." },
    "usability-testing": { domain: "Design", name: "Usability Testing",                     level: "advanced",   hours: 25, desc: "Test scripts, moderated sessions, findings and iterating on evidence." },
    "ux-writing":        { domain: "Design", name: "UX Writing",                            level: "advanced",   hours: 18, desc: "Labels, empty states, error messages — the words that carry the interface." },
    "design-portfolio":  { domain: "Design", name: "Case-Study Portfolio",                  level: "career",     hours: 35, desc: "Three deep case studies showing problem, process, decisions and outcome." },

    /* ─── Product & business ─────────────────────────────────────────────── */
    "product-sense":     { domain: "Product & Business", name: "Product Sense",                         level: "foundation", hours: 30, desc: "Users, problems, trade-offs and judging whether an idea is worth building." },
    "prd-writing":       { domain: "Product & Business", name: "PRDs & Requirement Writing",            level: "core",       hours: 25, desc: "Problem statements, scope, user stories, acceptance criteria and edge cases." },
    "prioritisation":    { domain: "Product & Business", name: "Roadmapping & Prioritisation",          level: "core",       hours: 20, desc: "RICE, MoSCoW, effort vs impact and defending what you chose to cut." },
    "product-metrics":   { domain: "Product & Business", name: "Product Metrics & Analytics",           level: "core",       hours: 30, desc: "Activation, retention, funnels, north-star metrics and instrumenting them." },
    "stakeholder-comm":  { domain: "Product & Business", name: "Stakeholder Communication",             level: "core",       hours: 20, desc: "Aligning engineering, design and business — and saying no with reasons." },
    "process-modeling":  { domain: "Product & Business", name: "Process & Requirement Modelling",       level: "core",       hours: 25, desc: "BPMN, as-is/to-be flows, BRD/FRD documents and gap analysis." },
    "gtm":               { domain: "Product & Business", name: "Go-To-Market Basics",                   level: "advanced",   hours: 20, desc: "Positioning, pricing, launch plans and the first hundred users." },
    "domain-knowledge":  { domain: "Product & Business", name: "Domain Knowledge",                      level: "career",     hours: 30, desc: "Learning one industry — fintech, health, logistics — deeply enough to be trusted." },

    /* ─── Digital marketing ──────────────────────────────────────────────── */
    "marketing-basics":  { domain: "Marketing", name: "Marketing Fundamentals",                level: "foundation", hours: 25, desc: "Audience, positioning, funnels and the 4Ps applied to digital channels." },
    "copywriting":       { domain: "Marketing", name: "Copywriting",                           level: "foundation", hours: 25, desc: "Headlines, hooks, landing-page copy and writing that converts." },
    "seo":               { domain: "Marketing", name: "SEO",                                   level: "core",       hours: 40, desc: "Keyword research, on-page, technical SEO, backlinks and search intent." },
    "content-marketing": { domain: "Marketing", name: "Content & Social Media Marketing",      level: "core",       hours: 30, desc: "Content calendars, platform-native formats, community and distribution." },
    "paid-ads":          { domain: "Marketing", name: "Paid Ads (Google & Meta)",              level: "core",       hours: 35, desc: "Campaign structure, targeting, creatives, budgets, ROAS and optimisation." },
    "email-crm":         { domain: "Marketing", name: "Email Marketing & CRM",                 level: "core",       hours: 20, desc: "Lists, segments, automation flows, deliverability and lifecycle messaging." },
    "web-analytics":     { domain: "Marketing", name: "Web Analytics (GA4)",                   level: "core",       hours: 25, desc: "Events, conversions, attribution and reporting what a channel really did." },
    "video-editing":     { domain: "Marketing", name: "Short-Form Video & Editing",            level: "advanced",   hours: 25, desc: "Scripting, shooting, cutting and publishing for Reels/Shorts." },
    "brand-strategy":    { domain: "Marketing", name: "Brand Strategy",                        level: "advanced",   hours: 20, desc: "Voice, narrative, differentiation and consistency across every touchpoint." },

    /* ─── Core / electronics / embedded ──────────────────────────────────── */
    "c-programming":     { domain: "Electronics & Embedded", name: "C Programming",                         level: "foundation", hours: 55, desc: "Pointers, memory, structs and the language embedded work is written in." },
    "digital-elec":      { domain: "Electronics & Embedded", name: "Digital Electronics",                   level: "foundation", hours: 45, desc: "Logic gates, combinational and sequential circuits, FSMs, timing." },
    "microcontrollers":  { domain: "Electronics & Embedded", name: "Microcontrollers & Embedded C",         level: "core",       hours: 60, desc: "GPIO, timers, interrupts, ADC, UART/SPI/I2C on 8051, AVR or ARM." },
    "sensors":           { domain: "Electronics & Embedded", name: "Sensors & Interfacing",                 level: "core",       hours: 30, desc: "Reading real-world signals, conditioning, calibration and datasheets." },
    "arduino-rpi":       { domain: "Electronics & Embedded", name: "Arduino & Raspberry Pi Projects",       level: "core",       hours: 30, desc: "Rapid prototyping hardware ideas end-to-end with cheap boards." },
    "rtos":              { domain: "Electronics & Embedded", name: "RTOS Concepts",                         level: "advanced",   hours: 35, desc: "Tasks, scheduling, semaphores, queues and real-time deadlines with FreeRTOS." },
    "iot-protocols":     { domain: "Electronics & Embedded", name: "IoT & Communication Protocols",         level: "advanced",   hours: 30, desc: "MQTT, CoAP, BLE, LoRa and getting a device onto the cloud safely." },
    "pcb-design":        { domain: "Electronics & Embedded", name: "PCB Design",                            level: "advanced",   hours: 35, desc: "Schematic capture, routing, DRC and getting a board fabricated." },
    "matlab":            { domain: "Electronics & Embedded", name: "MATLAB / Simulink",                     level: "advanced",   hours: 30, desc: "Modelling, simulation and signal processing for core-engineering roles." }
  };

  /* ── Career tracks ────────────────────────────────────────────────────── */
  /* Every track gets UNIVERSAL appended automatically by buildPlan().       */
  var UNIVERSAL = ["comm-english", "git", "ai-tools", "aptitude", "teamwork-agile", "resume-portfolio", "interview-prep"];

  var TRACKS = [
    { id: "sde", label: "Software Engineer (SDE)", group: "Engineering",
      blurb: "Product-company interviews: DSA depth, one strong language, and system design.",
      skills: ["cs-basics","prog-basics","oop","complexity","dsa-basic","dbms","sql","os","cn","linux","dsa-advanced","system-design-lo","system-design-hi","docker","ci-cd"] },

    { id: "frontend", label: "Frontend Developer", group: "Engineering",
      blurb: "Ship interfaces people use — markup, JavaScript, React and performance.",
      skills: ["html-css","responsive","javascript","git","react","typescript","routing-forms","state-mgmt","rest-api","a11y","web-perf","nextjs","frontend-testing"] },

    { id: "backend", label: "Backend Developer", group: "Engineering",
      blurb: "APIs, databases and the parts of a product that must not fall over.",
      skills: ["prog-basics","oop","linux","sql","dbms","nodejs","backend-python","backend-java","rest-api","db-design","auth-security","cn","nosql","dsa-basic","system-design-lo","docker","ci-cd","system-design-hi","microservices","observability"] },

    { id: "fullstack", label: "Full-Stack Developer", group: "Engineering",
      blurb: "End-to-end: frontend, backend, database and deployment of one real product.",
      skills: ["html-css","responsive","javascript","react","typescript","state-mgmt","nodejs","rest-api","sql","db-design","auth-security","nosql","docker","ci-cd","cloud-basics","system-design-lo"] },

    { id: "mobile", label: "Mobile App Developer", group: "Engineering",
      blurb: "Android, iOS or cross-platform apps, shipped to a real store.",
      skills: ["prog-basics","oop","mobile-ui","flutter","mobile-state","rest-api","firebase","auth-security","react-native","kotlin-android","swift-ios","app-release"] },

    { id: "devops", label: "DevOps / Cloud Engineer", group: "Engineering",
      blurb: "Build the pipes: Linux, containers, cloud, automation and uptime.",
      skills: ["linux","cn","prog-basics","git","docker","ci-cd","cloud-basics","iac","kubernetes","observability","auth-security","sre-basics"] },

    { id: "data-analyst", label: "Data Analyst", group: "Data & AI",
      blurb: "Answer business questions with SQL, spreadsheets and dashboards.",
      skills: ["excel","sql","statistics","python-basics","pandas","data-cleaning","data-viz","bi-tools","ab-testing","data-storytelling"] },

    { id: "data-scientist", label: "Data Scientist", group: "Data & AI",
      blurb: "Statistics plus modelling — turning messy data into predictions and decisions.",
      skills: ["python-basics","statistics","sql","pandas","data-cleaning","data-viz","eng-math","ml-supervised","ml-unsupervised","feature-eng","model-eval","ab-testing","deep-learning","data-storytelling"] },

    { id: "ml-engineer", label: "AI / ML Engineer", group: "Data & AI",
      blurb: "Build and ship models — deep learning, LLM applications and MLOps.",
      skills: ["python-basics","eng-math","statistics","pandas","ml-supervised","feature-eng","model-eval","deep-learning","nlp","cv","genai-llm","rest-api","docker","mlops","ai-ethics"] },

    { id: "data-engineer", label: "Data Engineer", group: "Data & AI",
      blurb: "Pipelines and warehouses — make the data reliable before anyone analyses it.",
      skills: ["python-basics","sql","dbms","linux","db-design","pandas","data-pipelines","nosql","big-data","cloud-basics","docker","ci-cd","observability"] },

    { id: "cybersecurity", label: "Cybersecurity Analyst", group: "Security",
      blurb: "Find weaknesses before attackers do, and respond when something gets through.",
      skills: ["cs-basics","linux","cn","security-basics","network-security","cryptography","owasp","prog-basics","pentest-tools","soc-siem","vapt","forensics","grc"] },

    { id: "uiux", label: "UI/UX Designer", group: "Design & Product",
      blurb: "Research, wireframe, prototype and hand off interfaces that make sense.",
      skills: ["design-principles","figma","wireframing","user-research","prototyping","responsive","a11y","design-systems","usability-testing","ux-writing","design-portfolio"] },

    { id: "product-manager", label: "Product Manager", group: "Design & Product",
      blurb: "Decide what to build and why — user problems, metrics and trade-offs.",
      skills: ["product-sense","user-research","prd-writing","wireframing","prioritisation","sql","product-metrics","stakeholder-comm","ab-testing","gtm","domain-knowledge"] },

    { id: "business-analyst", label: "Business Analyst", group: "Design & Product",
      blurb: "Sit between business and tech — requirements, process and reporting.",
      skills: ["excel","sql","statistics","process-modeling","prd-writing","bi-tools","data-viz","stakeholder-comm","product-metrics","domain-knowledge"] },

    { id: "digital-marketing", label: "Digital Marketing", group: "Design & Product",
      blurb: "Get a product in front of people — search, social, ads and analytics.",
      skills: ["marketing-basics","copywriting","seo","content-marketing","web-analytics","email-crm","paid-ads","video-editing","excel","brand-strategy"] },

    { id: "embedded", label: "Embedded / IoT Engineer", group: "Core Engineering",
      blurb: "Code that runs on hardware — microcontrollers, sensors and real-time constraints.",
      skills: ["c-programming","digital-elec","cs-basics","microcontrollers","sensors","arduino-rpi","linux","rtos","iot-protocols","pcb-design","matlab"] },

    { id: "gate", label: "GATE / Higher Studies (CS)", group: "Exams & Academics",
      blurb: "The full GATE CS syllabus, sequenced the way the paper weights it.",
      skills: ["eng-math","discrete-math","prog-basics","dsa-basic","dsa-advanced","complexity","dbms","sql","os","cn","coa","toc","compiler","aptitude"] },

    { id: "exploring", label: "Still exploring", group: "Exams & Academics",
      blurb: "A sampler across code, data and design so you can find what fits before committing.",
      skills: ["cs-basics","prog-basics","html-css","javascript","python-basics","excel","sql","design-principles","figma","statistics","product-sense"] }
  ];

  /* ── Onboarding option lists ──────────────────────────────────────────── */
  var EDUCATION = [
    "Class 9–10", "Class 11–12", "Diploma / Polytechnic",
    "B.Tech / B.E.", "B.Sc", "BCA", "B.Com", "BBA", "BA",
    "M.Tech / M.E.", "MCA", "M.Sc", "MBA",
    "Working professional", "Self-taught / career break"
  ];

  var STREAMS = [
    "Computer Science / IT", "Electronics & Communication", "Electrical",
    "Mechanical", "Civil", "Chemical", "Biotech / Life Sciences",
    "Mathematics / Statistics", "Commerce / Finance", "Management",
    "Arts / Humanities", "Design", "Other / Not applicable"
  ];

  var YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Final semester", "Already graduated", "Not applicable"];

  var HOURS_PER_WEEK = [
    { value: 4,  label: "Under 5 hrs / week — alongside a heavy semester" },
    { value: 8,  label: "5–10 hrs / week — steady evenings" },
    { value: 14, label: "10–18 hrs / week — serious side focus" },
    { value: 25, label: "20+ hrs / week — this is my main thing right now" }
  ];

  var TIMELINES = [
    "3 months — placement season is close",
    "6 months — next hiring cycle",
    "1 year — building properly",
    "No fixed deadline — learning at my pace"
  ];

  var FORMATS = [
    "Short focused lectures (10–20 min)",
    "Full course playlists",
    "Recorded college lectures",
    "Reading docs and articles",
    "Project-first, learn as I build",
    "Practice problems and quizzes"
  ];

  var LANGUAGES = ["English", "Hindi", "Hinglish", "Tamil", "Telugu", "Marathi", "Bengali", "Kannada", "Gujarati"];

  var MOTIVATIONS = [
    "Campus placement", "Off-campus / product company", "Internship",
    "Freelancing", "Startup / my own product", "Higher studies",
    "Government / PSU exam", "Switching careers", "Curiosity"
  ];

  var LEVEL_META = {
    foundation: { label: "Foundation",  note: "Non-negotiable basics. Skipping these is why people stall later." },
    core:       { label: "Core",        note: "The skills the job title actually names. Most of your time goes here." },
    advanced:   { label: "Advanced",    note: "What separates a shortlist from an offer." },
    career:     { label: "Job-ready",   note: "Turning what you know into an interview, and an offer." }
  };

  var LEVEL_ORDER = ["foundation", "core", "advanced", "career"];

  /* ── Custom skills — the learner's own additions ───────────────────────────
     Stored as an array under CUSTOM_KEY and merged into SKILLS at load time,
     before anything else reads the catalogue. That ordering matters: readLog()
     validates session.skill against SKILLS, so a merge that ran late would
     silently orphan every hour logged against a custom skill.

     Custom skills are global, not per-track. They belong to the learner, so
     switching career goal must never make one disappear — trackSkillIds()
     appends them to whatever track is active.
     ─────────────────────────────────────────────────────────────────────── */
  var CUSTOM_KEY = "dronaskill_custom_skills";
  var MAX_CUSTOM_SKILLS = 40;
  var CUSTOM_DOMAIN = "My Own Skills";

  function slugify(name) {
    return String(name).toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32);
  }

  /* Never collides with a catalogue id: every custom id carries the prefix. */
  function makeCustomId(name, taken) {
    var base = "custom-" + (slugify(name) || "skill");
    var id = base, n = 2;
    while (SKILLS[id] || taken[id]) { id = base + "-" + n; n++; }
    return id;
  }

  function clampInt(value, min, max, fallback) {
    var n = Math.round(Number(value));
    if (!isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  /* Coerce one stored record into a valid skill, or null if it is beyond saving. */
  function normalizeCustom(raw) {
    if (!raw || typeof raw !== "object") return null;
    var name = String(raw.name || "").trim().slice(0, 60);
    if (name.length < 2) return null;
    var id = String(raw.id || "").trim();
    if (!/^custom-[a-z0-9-]+$/.test(id)) return null;

    return {
      id: id,
      name: name,
      domain: String(raw.domain || CUSTOM_DOMAIN).trim().slice(0, 40) || CUSTOM_DOMAIN,
      level: LEVEL_ORDER.indexOf(raw.level) === -1 ? "core" : raw.level,
      hours: clampInt(raw.hours, 1, 500, 20),
      desc: String(raw.desc || "").trim().slice(0, 220) ||
            "A skill you added yourself. Tick it off once you can build something small with it.",
      custom: true,
      added: /^\d{4}-\d{2}-\d{2}$/.test(raw.added) ? raw.added : todayISO()
    };
  }

  function readCustomSkills() {
    var raw = [];
    try { raw = JSON.parse(global.localStorage.getItem(CUSTOM_KEY) || "[]"); }
    catch (e) { raw = []; }
    if (!Array.isArray(raw)) return [];

    /* No clash check against SKILLS here: once merged, every custom skill IS in
       SKILLS, so testing that would make this return nothing and the next write
       would wipe the list. Built-ins are already unreachable — normalizeCustom
       only accepts ids matching /^custom-.../, and no catalogue id uses that. */
    var seen = {}, out = [];
    raw.forEach(function (entry) {
      var skill = normalizeCustom(entry);
      if (!skill || seen[skill.id]) return;
      seen[skill.id] = true;
      out.push(skill);
    });
    return out.slice(0, MAX_CUSTOM_SKILLS);
  }

  function writeCustomSkills(list) {
    try { global.localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); }
    catch (e) { /* storage full or blocked — the merged in-memory copy still works */ }
  }

  function isCustomSkill(id) {
    return !!(SKILLS[id] && SKILLS[id].custom);
  }

  function customSkillIds() {
    return Object.keys(SKILLS).filter(function (id) { return SKILLS[id].custom; });
  }

  /* Put every stored custom skill into SKILLS so all four pages resolve it
     by id exactly like a built-in one. */
  function mergeCustomSkills() {
    customSkillIds().forEach(function (id) { delete SKILLS[id]; });
    readCustomSkills().forEach(function (skill) { SKILLS[skill.id] = skill; });
  }

  /*
    addCustomSkill(input) -> { ok: true, skill } | { ok: false, error }
    Returns a reason instead of throwing, so the caller has one message to show.
  */
  function addCustomSkill(input) {
    input = input || {};
    var name = String(input.name || "").trim().slice(0, 60);
    if (name.length < 2) return { ok: false, error: "Give the skill a name of at least 2 characters." };

    var existing = readCustomSkills();
    if (existing.length >= MAX_CUSTOM_SKILLS) {
      return { ok: false, error: "You've reached the limit of " + MAX_CUSTOM_SKILLS + " custom skills. Remove one first." };
    }

    var lower = name.toLowerCase();
    var clash = Object.keys(SKILLS).some(function (id) {
      return SKILLS[id].name.toLowerCase() === lower;
    });
    if (clash) return { ok: false, error: "“" + name + "” is already on your list." };

    var taken = {};
    existing.forEach(function (s) { taken[s.id] = true; });

    var skill = normalizeCustom({
      id: makeCustomId(name, taken),
      name: name,
      domain: input.domain,
      level: input.level,
      hours: input.hours,
      desc: input.desc,
      added: todayISO()
    });
    if (!skill) return { ok: false, error: "That skill couldn't be saved. Check the name and hours." };

    existing.push(skill);
    writeCustomSkills(existing);
    SKILLS[skill.id] = skill;
    return { ok: true, skill: skill };
  }

  function updateCustomSkill(id, patch) {
    if (!isCustomSkill(id)) return { ok: false, error: "Only skills you added can be edited." };
    var list = readCustomSkills();
    var current = null;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) current = list[i];
    if (!current) return { ok: false, error: "That skill no longer exists." };

    patch = patch || {};
    var name = patch.name === undefined ? current.name : String(patch.name).trim().slice(0, 60);
    if (name.length < 2) return { ok: false, error: "Give the skill a name of at least 2 characters." };

    var lower = name.toLowerCase();
    var clash = Object.keys(SKILLS).some(function (other) {
      return other !== id && SKILLS[other].name.toLowerCase() === lower;
    });
    if (clash) return { ok: false, error: "“" + name + "” is already on your list." };

    var updated = normalizeCustom({
      id: id,
      name: name,
      domain: patch.domain === undefined ? current.domain : patch.domain,
      level: patch.level === undefined ? current.level : patch.level,
      hours: patch.hours === undefined ? current.hours : patch.hours,
      desc: patch.desc === undefined ? current.desc : patch.desc,
      added: current.added
    });
    if (!updated) return { ok: false, error: "That change couldn't be saved." };

    writeCustomSkills(list.map(function (s) { return s.id === id ? updated : s; }));
    SKILLS[id] = updated;
    return { ok: true, skill: updated };
  }

  /*
    Removes the skill and its completion tick. Logged study sessions are left
    alone on purpose — readLog() blanks an unknown skill id, so those hours
    survive as unassigned time rather than vanishing from the learner's totals.
  */
  function removeCustomSkill(id) {
    if (!isCustomSkill(id)) return { ok: false, error: "Only skills you added can be removed." };
    writeCustomSkills(readCustomSkills().filter(function (s) { return s.id !== id; }));
    delete SKILLS[id];

    var progress = readProgress();
    if (progress[id]) { delete progress[id]; writeProgress(progress); }
    return { ok: true };
  }

  /* ── Plan builder ─────────────────────────────────────────────────────── */
  function getTrack(id) {
    for (var i = 0; i < TRACKS.length; i++) if (TRACKS[i].id === id) return TRACKS[i];
    return null;
  }

  /* Every skill id a track touches — universal and learner-added ones
     included — de-duplicated. Custom skills ride along with every track. */
  function trackSkillIds(trackId) {
    var track = getTrack(trackId);
    var ids = (track ? track.skills : []).concat(UNIVERSAL).concat(customSkillIds());
    var seen = {}, out = [];
    ids.forEach(function (id) {
      if (SKILLS[id] && !seen[id]) { seen[id] = true; out.push(id); }
    });
    return out;
  }

  /*
    buildPlan(profile) -> { trackId, trackLabel, groups, totalHours, remainingHours,
                            weeksToFinish, items }
    profile: { career_goal, known_skills: [id], hours_per_week }
    Items are ordered foundation -> core -> advanced -> job-ready, which is also
    the order the dashboard walks the learner through.
  */
  function buildPlan(profile) {
    profile = profile || {};
    var trackId = profile.career_goal || "exploring";
    var track = getTrack(trackId) || getTrack("exploring");
    var known = {};
    (profile.known_skills || []).forEach(function (id) { known[id] = true; });

    var items = trackSkillIds(track.id).map(function (id) {
      var s = SKILLS[id];
      return {
        id: id, name: s.name, desc: s.desc, level: s.level,
        domain: s.domain, hours: s.hours, done: !!known[id],
        custom: !!s.custom
      };
    });

    items.sort(function (a, b) {
      return LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
    });

    var groups = LEVEL_ORDER.map(function (level) {
      return {
        level: level,
        label: LEVEL_META[level].label,
        note: LEVEL_META[level].note,
        items: items.filter(function (it) { return it.level === level; })
      };
    }).filter(function (g) { return g.items.length; });

    var totalHours = 0, remainingHours = 0, doneCount = 0;
    items.forEach(function (it) {
      totalHours += it.hours;
      if (it.done) doneCount++; else remainingHours += it.hours;
    });

    var perWeek = profile.hours_per_week || 8;

    return {
      trackId: track.id,
      trackLabel: track.label,
      trackBlurb: track.blurb,
      items: items,
      groups: groups,
      doneCount: doneCount,
      totalCount: items.length,
      totalHours: totalHours,
      remainingHours: remainingHours,
      weeksToFinish: Math.ceil(remainingHours / perWeek)
    };
  }

  /* ── Progress store ───────────────────────────────────────────────────────
     Shape: { skillId: "YYYY-MM-DD" } — the date the skill was ticked off.
     Storing the date (not just `true`) is what makes the activity heatmap and
     the burn-up chart on analysis.html possible. Older saves used `true`; those
     are migrated to the profile's onboarding date on first read.
     ─────────────────────────────────────────────────────────────────────── */
  function todayISO(d) {
    d = d || new Date();
    return d.getFullYear() + "-" +
           String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0");
  }

  function readProgress() {
    var raw = {};
    try { raw = JSON.parse(global.localStorage.getItem(PROGRESS_KEY) || "{}") || {}; }
    catch (e) { raw = {}; }

    /* Legacy `true` values: date them from the onboarding day, not today, so a
       migrated profile doesn't show a fake spike on the heatmap's last cell. */
    var fallback = todayISO();
    try {
      var profile = JSON.parse(global.localStorage.getItem(STORAGE_KEY) || "null");
      if (profile && profile.completed_at) fallback = profile.completed_at.slice(0, 10);
    } catch (e) { /* keep today */ }

    var migrated = false, clean = {};
    Object.keys(raw).forEach(function (id) {
      var v = raw[id];
      if (!v) return;
      if (v === true) { clean[id] = fallback; migrated = true; }
      else if (typeof v === "string") { clean[id] = v.slice(0, 10); }
    });
    if (migrated) writeProgress(clean);
    return clean;
  }

  function writeProgress(progress) {
    try { global.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); }
    catch (e) { /* storage full or blocked — the in-memory copy still works */ }
  }

  /* Toggle one skill, stamping today's date when it turns on. */
  function setSkillDone(progress, id, done) {
    if (done) progress[id] = todayISO();
    else delete progress[id];
    writeProgress(progress);
    return progress;
  }

  /* ── Study log ────────────────────────────────────────────────────────────
     Shape: { "YYYY-MM-DD": [ { hours, skill, note } ] } — real sessions the
     learner logged, keyed by day so the heatmap can look a date up directly.
     `skill` is a skill id, or "" for a session that isn't tied to one.

     This is the *measured* counterpart to the progress store's *estimated*
     hours (a completed skill's catalogue estimate). analysis.html keeps the two
     apart and never mixes them in one chart — see its "Hours" source toggle.
     ─────────────────────────────────────────────────────────────────────── */
  var MAX_SESSION_HOURS = 16;

  function roundQuarter(n) { return Math.round(n * 4) / 4; }

  function readLog() {
    var raw = {};
    try { raw = JSON.parse(global.localStorage.getItem(LOG_KEY) || "{}") || {}; }
    catch (e) { raw = {}; }

    /* Coerce anything malformed rather than trusting localStorage. */
    var clean = {};
    Object.keys(raw).forEach(function (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(raw[date])) return;
      var sessions = raw[date].map(function (s) {
        var hours = roundQuarter(Number(s && s.hours));
        if (!isFinite(hours) || hours <= 0) return null;
        return {
          hours: Math.min(hours, MAX_SESSION_HOURS),
          skill: (s.skill && SKILLS[s.skill]) ? s.skill : "",
          note: typeof s.note === "string" ? s.note.slice(0, 140) : ""
        };
      }).filter(Boolean);
      if (sessions.length) clean[date] = sessions;
    });
    return clean;
  }

  function writeLog(log) {
    try { global.localStorage.setItem(LOG_KEY, JSON.stringify(log)); }
    catch (e) { /* storage full or blocked — the in-memory copy still works */ }
  }

  /* Returns null when the session is invalid, so callers can show one message. */
  function addSession(log, session) {
    session = session || {};
    var date = /^\d{4}-\d{2}-\d{2}$/.test(session.date) ? session.date : todayISO();
    if (date > todayISO()) return null;                 /* no logging into the future */

    var hours = roundQuarter(Number(session.hours));
    if (!isFinite(hours) || hours <= 0 || hours > MAX_SESSION_HOURS) return null;

    if (!log[date]) log[date] = [];
    log[date].push({
      hours: hours,
      skill: (session.skill && SKILLS[session.skill]) ? session.skill : "",
      note: typeof session.note === "string" ? session.note.trim().slice(0, 140) : ""
    });
    writeLog(log);
    return log;
  }

  function removeSession(log, date, index) {
    if (!log[date] || !log[date][index]) return log;
    log[date].splice(index, 1);
    if (!log[date].length) delete log[date];
    writeLog(log);
    return log;
  }

  /* { "YYYY-MM-DD": totalHours } — what the heatmap colours by. */
  function logHoursByDay(log) {
    var out = {};
    Object.keys(log).forEach(function (date) {
      out[date] = log[date].reduce(function (s, x) { return s + x.hours; }, 0);
    });
    return out;
  }

  /* { skillId: totalHours } — powers the per-skill "x of y hrs logged" bars. */
  function logHoursBySkill(log) {
    var out = {};
    Object.keys(log).forEach(function (date) {
      log[date].forEach(function (s) {
        if (s.skill) out[s.skill] = (out[s.skill] || 0) + s.hours;
      });
    });
    return out;
  }

  function totalLoggedHours(log) {
    var total = 0;
    Object.keys(log).forEach(function (date) {
      log[date].forEach(function (s) { total += s.hours; });
    });
    return total;
  }

  /* Flat, newest-first list for the history table. `index` is the position
     within that day, which is what removeSession() needs. */
  function sessionList(log) {
    var out = [];
    Object.keys(log).forEach(function (date) {
      log[date].forEach(function (s, i) {
        out.push({ date: date, index: i, hours: s.hours, skill: s.skill, note: s.note });
      });
    });
    out.sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.index - a.index;
    });
    return out;
  }

  /* Pretty-print 1.5 as "1h 30m" — used in every log surface. */
  function formatHours(h) {
    var whole = Math.floor(h);
    var mins = Math.round((h - whole) * 60);
    if (!whole) return mins + "m";
    return whole + "h" + (mins ? " " + mins + "m" : "");
  }

  var STORAGE_KEY = "dronaskill_learner_profile";
  var PROGRESS_KEY = "dronaskill_skill_progress";
  var LOG_KEY = "dronaskill_study_log";

  /* Merge before anything is exported: every reader below — buildPlan,
     readLog, readProgress — must already see custom skills in SKILLS. */
  mergeCustomSkills();

  global.DRONA = {
    SKILLS: SKILLS,
    TRACKS: TRACKS,
    UNIVERSAL: UNIVERSAL,
    EDUCATION: EDUCATION,
    STREAMS: STREAMS,
    YEARS: YEARS,
    HOURS_PER_WEEK: HOURS_PER_WEEK,
    TIMELINES: TIMELINES,
    FORMATS: FORMATS,
    LANGUAGES: LANGUAGES,
    MOTIVATIONS: MOTIVATIONS,
    LEVEL_META: LEVEL_META,
    LEVEL_ORDER: LEVEL_ORDER,
    STORAGE_KEY: STORAGE_KEY,
    PROGRESS_KEY: PROGRESS_KEY,
    LOG_KEY: LOG_KEY,
    CUSTOM_KEY: CUSTOM_KEY,
    CUSTOM_DOMAIN: CUSTOM_DOMAIN,
    MAX_SESSION_HOURS: MAX_SESSION_HOURS,
    MAX_CUSTOM_SKILLS: MAX_CUSTOM_SKILLS,
    readCustomSkills: readCustomSkills,
    customSkillIds: customSkillIds,
    isCustomSkill: isCustomSkill,
    addCustomSkill: addCustomSkill,
    updateCustomSkill: updateCustomSkill,
    removeCustomSkill: removeCustomSkill,
    getTrack: getTrack,
    trackSkillIds: trackSkillIds,
    buildPlan: buildPlan,
    todayISO: todayISO,
    readProgress: readProgress,
    writeProgress: writeProgress,
    setSkillDone: setSkillDone,
    readLog: readLog,
    writeLog: writeLog,
    addSession: addSession,
    removeSession: removeSession,
    logHoursByDay: logHoursByDay,
    logHoursBySkill: logHoursBySkill,
    totalLoggedHours: totalLoggedHours,
    sessionList: sessionList,
    formatHours: formatHours
  };
})(window);
