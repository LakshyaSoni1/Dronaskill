/* ══════════════════════════════════════════════════════════════════════════
   Dronaskill — lecture library
   ──────────────────────────────────────────────────────────────────────────
   Plain classic script (no modules) so lectures.html can load it over file://
   with <script src="lectures-data.js"></script> and read window.DRONA_LECTURES.
   Load it AFTER skills-data.js — DRONA.SKILLS is read lazily inside functions,
   so a wrong script order degrades instead of throwing.

   CURATED  : skill id -> ordered lecture list. Hand-picked, never generated.
   Overrides: the learner can hide, edit, reorder and add their own lectures.
              Those live in localStorage and are layered over CURATED at read
              time, so newly curated videos still reach someone who has edited
              that skill, and "reset" is just dropping their patch.

   ── ADDING A CURATED VIDEO ────────────────────────────────────────────────
   Every id below returned HTTP 200 from
     https://www.youtube.com/oembed?format=json&url=https://youtu.be/<id>
       200 = exists AND is embeddable
       401 = exists but embedding is DISABLED  -> reject, it renders
             "Video unavailable" in the player and we cannot detect that in JS
       404 = dead id                            -> reject
   Check that before adding anything here. Durations are read off the watch
   page (oEmbed does not return them) — a wrong duration directly corrupts the
   hours we auto-log, so do not estimate them.
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  /* ── Curated library ──────────────────────────────────────────────────── */
  var CURATED = {
    /* Professional English & Communication — Employability */
    "comm-english": [
      { videoId: "91ptZp3Si0s", title: "Premium Spoken English Course — Full Course/Practice/Video/In Hindi — Learn English Speaking Course", minutes: 214, channel: "Dear Sir" },
      { videoId: "A0BMyN3Eofk", title: "Complete Communication Skills Course — Free Communication Skills Course — Simplilearn", minutes: 53, channel: "Simplilearn" }
    ],
    /* Aptitude & Logical Reasoning — Employability */
    "aptitude": [
      { videoId: "S-Ji7aayH3A", title: "TCS Numerical Ability Preparation One Shot — Aptitude Prep for TCS NQT & TCS Ignite Smart Hiring", minutes: 711, channel: "KG Placement with Yash Sir" },
      { videoId: "rRABH8uiGDU", title: "full aptitude course in one video — aptitude for placement preparation", minutes: 378, channel: "The Coding Icons" }
    ],
    /* Git & GitHub — Employability */
    "git": [
      { videoId: "zTjRZNkhiEU", title: "Learn Git — Full Course for Beginners", minutes: 224, channel: "freeCodeCamp.org" },
      { videoId: "mAFoROnOfHs", title: "Git & GitHub Crash Course for Beginners [2026]", minutes: 81, channel: "freeCodeCamp.org and logicBase Labs" }
    ],
    /* Working With AI Tools — Employability */
    "ai-tools": [
      { videoId: "wlpBCazAY9Q", title: "AI-Assisted Coding Tutorial — OpenClaw, GitHub Copilot, Claude Code, CodeRabbit, Gemini CLI", minutes: 85, channel: "freeCodeCamp.org and Beau Carnes" },
      { videoId: "CBYfXlP7ppQ", title: "5 Ways to use AI in Coding (Copy these)!", minutes: 26, channel: "CodeWithHarry" }
    ],
    /* Resume, LinkedIn & Portfolio — Employability */
    "resume-portfolio": [
      { videoId: "y3R9e2L8I9E", title: "How to make Ultimate Resume ? Step by step guide for Software Engineers", minutes: 17, channel: "Apna College" }
    ],
    /* Interview Skills & Mock Practice — Employability */
    "interview-prep": [
      { videoId: "cPsCdOqqeJg", title: "Interview — Introduce Yourself — Questions And Answers/Tips/Preparation — How To Introduce Yourself", minutes: 24, channel: "Dear Sir" },
      { videoId: "4Ib9amXl4gI", title: "Top Java Interview Questions TO GET YOU HIRED in 2026 — Java Interview Preparation Guide — Intellipaat", minutes: 61, channel: "Intellipaat" }
    ],
    /* Teamwork & Agile Basics — Employability */
    "teamwork-agile": [
      { videoId: "SyIN_YMfoQs", title: "Scrum Master Full Course — Scrum Master Certifications Training — Scrum Master Tutorial — Simplilearn", minutes: 209, channel: "Simplilearn" },
      { videoId: "g5zHKHf2a88", title: "Scrum Master Full Course in 4 Hours — Scrum Master Certification — Scrum Master Training — Edureka", minutes: 245, channel: "edureka!" }
    ],
    /* Computer Fundamentals — CS Fundamentals */
    "cs-basics": [
      { videoId: "zOjov-2OZ0E", title: "Introduction to Programming and Computer Science - Full Course", minutes: 119, channel: "freeCodeCamp.org" }
    ],
    /* Programming Fundamentals — CS Fundamentals */
    "prog-basics": [
      { videoId: "nLRL_NcnK-4", title: "Harvard CS50's Introduction to Programming with Python — Full University Course", minutes: 958, channel: "freeCodeCamp.org and CS50" }
    ],
    /* Object-Oriented Programming — CS Fundamentals */
    "oop": [
      { videoId: "Ej_02ICOIgs", title: "Object Oriented Programming with Python - Full Course for Beginners", minutes: 133, channel: "freeCodeCamp.org" },
      { videoId: "-DP1i2ZU9gk", title: "8. Object Oriented Programming", minutes: 42, channel: "MIT OpenCourseWare" }
    ],
    /* DSA — Arrays to Trees — CS Fundamentals */
    "dsa-basic": [
      { videoId: "RBSGKlAvoiM", title: "Data Structures Easy to Advanced Course - Full Tutorial from a Google Engineer", minutes: 483, channel: "freeCodeCamp.org" },
      { videoId: "Z_c4byLrNBU", title: "Data Structure and Algorithm Patterns for LeetCode Interviews — Tutorial", minutes: 75, channel: "freeCodeCamp.org and AlgoMonster" }
    ],
    /* DSA — Graphs, DP & Greedy — CS Fundamentals */
    "dsa-advanced": [
      { videoId: "tWVWeAqZ0WU", title: "Graph Algorithms for Technical Interviews - Full Course", minutes: 132, channel: "freeCodeCamp.org" },
      { videoId: "pcKY4hjDrxk", title: "5.1 Graph Traversals - BFS & DFS -Breadth First Search and Depth First Search", minutes: 19, channel: "Abdul Bari" }
    ],
    /* Time & Space Complexity — CS Fundamentals */
    "complexity": [
      { videoId: "vgSKOMsjLbc", title: "Time Complexity and Big O Notation (with notes)", minutes: 33, channel: "CodeWithHarry" },
      { videoId: "FPu9Uld7W-E", title: "Time and Space Complexity - Strivers A2Z DSA Course", minutes: 35, channel: "take U forward" }
    ],
    /* DBMS Concepts — CS Fundamentals */
    "dbms": [
      { videoId: "jzuzxEFoiss", title: "Complete DBMS Database Management System in One Shot 5 Hours — Semester Exam — Hindi", minutes: 337, channel: "5 Minutes Engineering" }
    ],
    /* SQL — CS Fundamentals */
    "sql": [
      { videoId: "HXV3zeQKqGY", title: "SQL Tutorial - Full Database Course for Beginners", minutes: 261, channel: "freeCodeCamp.org" },
      { videoId: "7S_tz1z_5bA", title: "SQL Course for Beginners [Full Course]", minutes: 190, channel: "Programming with Mosh" }
    ],
    /* Operating Systems — CS Fundamentals */
    "os": [
      { videoId: "A4G0hOI6XyQ", title: "Complete OS Operating System in One Shot 7 Hours — Semester Exam — Hindi", minutes: 421, channel: "5 Minutes Engineering" }
    ],
    /* Computer Networks — CS Fundamentals */
    "cn": [
      { videoId: "qiQR5rTSshw", title: "Computer Networking Course - Network Engineering [CompTIA Network+ Exam Prep]", minutes: 565, channel: "freeCodeCamp.org" },
      { videoId: "IPvYjXCsTg8", title: "Computer Networking Full Course - OSI Model Deep Dive with Real Life Examples", minutes: 247, channel: "Kunal Kushwaha" }
    ],
    /* Linux & Shell — CS Fundamentals */
    "linux": [
      { videoId: "ZtqBQ68cfJc", title: "The 50 Most Popular Linux & Terminal Commands - Full Course for Beginners", minutes: 300, channel: "freeCodeCamp.org" },
      { videoId: "sWbUDq4S6Y8", title: "Introduction to Linux — Full Course for Beginners", minutes: 368, channel: "freeCodeCamp.org and Beau Carnes" }
    ],
    /* Computer Organisation & Architecture — CS Fundamentals */
    "coa": [
      { videoId: "1rUevQ3bSEY", title: "Complete COA Computer Organization and Architecture in One Shot 6 Hours — Semester Exam — Hindi", minutes: 386, channel: "5 Minutes Engineering" }
    ],
    /* Theory of Computation — CS Fundamentals */
    "toc": [
      { videoId: "acCztqcZi_Q", title: "Complete TOC Theory of Computation in One Shot 6 Hours — Semester Exam — Hindi", minutes: 360, channel: "5 Minutes Engineering" }
    ],
    /* Compiler Design — CS Fundamentals */
    "compiler": [
      { videoId: "7ICf62fp_4I", title: "Complete Compiler Design One Shot 4 Hours — Semester Exam Hindi", minutes: 225, channel: "5 Minutes Engineering" }
    ],
    /* Discrete Mathematics — CS Fundamentals */
    "discrete-math": [
      { videoId: "G9JxuWk7BDA", title: "Discrete Mathematics Course for Beginners", minutes: 546, channel: "freeCodeCamp.org" },
      { videoId: "papVRQqtrgc", title: "Complete Discrete Maths in One Shot 4 Hours — Semester Exam — Hindi", minutes: 276, channel: "5 Minutes Engineering" }
    ],
    /* Engineering Mathematics — CS Fundamentals */
    "eng-math": [
      { videoId: "JnTa9XtvmfI", title: "Linear Algebra - Full College Course", minutes: 700, channel: "freeCodeCamp.org" }
    ],
    /* HTML & CSS — Frontend */
    "html-css": [
      { videoId: "a_iQb1lnAEQ", title: "Learn HTML & CSS — Full Course for Beginners", minutes: 322, channel: "freeCodeCamp.org" },
      { videoId: "qz0aGYrrlhU", title: "HTML Tutorial for Beginners: HTML Crash Course", minutes: 70, channel: "Programming with Mosh" }
    ],
    /* Responsive & Mobile-First Design — Frontend */
    "responsive": [
      { videoId: "srvUrASNj0s", title: "Introduction To Responsive Web Design - HTML & CSS Tutorial", minutes: 251, channel: "freeCodeCamp.org" },
      { videoId: "XsEnj-1hG2o", title: "Build a Responsive, Mobile First Website - HTML5 & CSS3", minutes: 48, channel: "Traversy Media" }
    ],
    /* JavaScript (ES6+) — Frontend */
    "javascript": [
      { videoId: "Zi-Q0t4gMC8", title: "JavaScript Course for Beginners", minutes: 216, channel: "freeCodeCamp.org" },
      { videoId: "PkZNo7MFNFg", title: "Learn JavaScript - Full Course for Beginners", minutes: 207, channel: "freeCodeCamp.org and Beau Carnes" }
    ],
    /* TypeScript — Frontend */
    "typescript": [
      { videoId: "30LWjhZzg50", title: "Learn TypeScript — Full Tutorial", minutes: 286, channel: "freeCodeCamp.org" },
      { videoId: "d56mG7DezGs", title: "TypeScript Tutorial for Beginners", minutes: 64, channel: "Programming with Mosh" }
    ],
    /* React — Frontend */
    "react": [
      { videoId: "x4rFhThSX04", title: "Learn React JS - Full Beginner's Tutorial & Practice Projects", minutes: 941, channel: "freeCodeCamp.org" },
      { videoId: "SqcY0GlETPk", title: "React Tutorial for Beginners", minutes: 80, channel: "Programming with Mosh" }
    ],
    /* State Management & Data Fetching — Frontend */
    "state-mgmt": [
      { videoId: "-bEzt5ISACA", title: "React State Management — Intermediate JavaScript Course", minutes: 167, channel: "freeCodeCamp.org" }
    ],
    /* Routing, Forms & Validation — Frontend */
    "routing-forms": [
      { videoId: "nDGA3km5He4", title: "React Router 6 — Full Course", minutes: 585, channel: "freeCodeCamp.org" },
      { videoId: "Ul3y1LXxzdU", title: "Learn React Router v6 In 45 Minutes", minutes: 46, channel: "Web Dev Simplified" }
    ],
    /* Next.js / SSR — Frontend */
    "nextjs": [
      { videoId: "1WmNXEVia8I", title: "Next.js for Beginners - Full Course", minutes: 158, channel: "freeCodeCamp.org" },
      { videoId: "ZVnjOPwW4ZA", title: "Next js Tutorial for Beginners — Nextjs 13 (App Router) with TypeScript", minutes: 63, channel: "Programming with Mosh" }
    ],
    /* Web Performance — Frontend */
    "web-perf": [
      { videoId: "qPto6cNPdzU", title: "Web Performance Ultimate Crash Course", minutes: 65, channel: "Frontend Master" }
    ],
    /* Accessibility (a11y) — Frontend */
    "a11y": [
      { videoId: "e2nkq3h1P68", title: "Learn Accessibility - Full a11y Tutorial", minutes: 93, channel: "freeCodeCamp.org" },
      { videoId: "2oiBKSjOOFE", title: "The Only Accessibility Video You Will Ever Need", minutes: 38, channel: "Web Dev Simplified" }
    ],
    /* Frontend Testing — Frontend */
    "frontend-testing": [
      { videoId: "8Xwq35cPwYg", title: "React Testing for Beginners: Start Here!", minutes: 77, channel: "Programming with Mosh" },
      { videoId: "OVNjsIto9xM", title: "React Testing Crash Course", minutes: 59, channel: "Traversy Media" }
    ],
    /* Node.js & Express — Backend & Infra */
    "nodejs": [
      { videoId: "Oe421EPjeBE", title: "Node.js and Express.js - Full Course", minutes: 497, channel: "freeCodeCamp.org" },
      { videoId: "TlB_eWDSMt4", title: "Node.js Tutorial for Beginners: Learn Node in 1 Hour", minutes: 78, channel: "Programming with Mosh" }
    ],
    /* Backend with Python (Django/FastAPI) — Backend & Infra */
    "backend-python": [
      { videoId: "F5mRW0jo-U4", title: "Python Django Web Framework - Full Course for Beginners", minutes: 226, channel: "freeCodeCamp.org" },
      { videoId: "rHux0gMZ3Eg", title: "Django Tutorial for Beginners — Build Powerful Backends", minutes: 63, channel: "Programming with Mosh" }
    ],
    /* Backend with Java (Spring Boot) — Backend & Infra */
    "backend-java": [
      { videoId: "5rNk7m_zlAg", title: "Spring Boot & Spring Data JPA — Complete Course", minutes: 762, channel: "freeCodeCamp.org" },
      { videoId: "gJrjgg1KVL4", title: "Spring Boot Tutorial for Beginners [2025]", minutes: 71, channel: "Programming with Mosh" }
    ],
    /* REST API Design — Backend & Infra */
    "rest-api": [
      { videoId: "WXsD0ZgxjRw", title: "APIs for Beginners - How to use an API (Full Course / Tutorial)", minutes: 187, channel: "freeCodeCamp.org" }
    ],
    /* Authentication & App Security — Backend & Infra */
    "auth-security": [
      { videoId: "F-sFp_AvHc8", title: "User Authentication in Web Apps (Passport.js, Node, Express)", minutes: 373, channel: "freeCodeCamp.org" }
    ],
    /* Database Design & Modelling — Backend & Infra */
    "db-design": [
      { videoId: "ztHopE5Wnpc", title: "Database Design Course - Learn how to design and plan a database for beginners", minutes: 487, channel: "freeCodeCamp.org" },
      { videoId: "WXk7yDqsKxs", title: "Harvard CS50's Intro to Databases with SQL — Full University Course", minutes: 669, channel: "freeCodeCamp.org and CS50" }
    ],
    /* NoSQL (MongoDB / Redis) — Backend & Infra */
    "nosql": [
      { videoId: "J6mDkcqU_ZE", title: "MongoDB Tutorial in 1 Hour (2024)", minutes: 83, channel: "CodeWithHarry" },
      { videoId: "ofme2o29ngU", title: "MongoDB Crash Course", minutes: 30, channel: "Web Dev Simplified" }
    ],
    /* Low-Level Design — Backend & Infra */
    "system-design-lo": [
      { videoId: "rylaiB2uH2A", title: "Master Design Patterns & SOLID Principles in C# - Full OOP Course for Beginners", minutes: 707, channel: "freeCodeCamp.org" },
      { videoId: "NU_1StN5Tkk", title: "Design Patterns in Plain English — Mosh Hamedani", minutes: 80, channel: "Programming with Mosh" }
    ],
    /* High-Level System Design — Backend & Infra */
    "system-design-hi": [
      { videoId: "F2FmTdLtb_4", title: "System Design Concepts Course and Interview Prep", minutes: 54, channel: "freeCodeCamp.org" },
      { videoId: "CuQmQpvw04I", title: "Complete System Design Roadmap 2025 — HLD & LLD by Shradha Ma'am", minutes: 21, channel: "Apna College" }
    ],
    /* Microservices & Message Queues — Backend & Infra */
    "microservices": [
      { videoId: "CqCDOosvZIk", title: ".NET Microservices — Full Course for Beginners", minutes: 427, channel: "freeCodeCamp.org" },
      { videoId: "rv4LlmLmVWk", title: "Microservices explained - the What, Why and How?", minutes: 19, channel: "TechWorld with Nana" }
    ],
    /* Docker & Containers — Backend & Infra */
    "docker": [
      { videoId: "rjjES5IsPdg", title: "Learn Docker — Full DevOps Course for Deploying Containerized Apps", minutes: 450, channel: "freeCodeCamp.org" },
      { videoId: "3c-iBn73dDE", title: "Docker Tutorial for Beginners [FULL COURSE in 3 Hours]", minutes: 166, channel: "TechWorld with Nana" }
    ],
    /* CI/CD Pipelines — Backend & Infra */
    "ci-cd": [
      { videoId: "Tz7FsunBbfQ", title: "GitHub Actions Certification — Full Course to PASS the Exam", minutes: 190, channel: "freeCodeCamp.org" },
      { videoId: "R8_veQiYBjI", title: "GitHub Actions Tutorial - Basic Concepts and CI/CD Pipeline with Docker", minutes: 33, channel: "TechWorld with Nana" }
    ],
    /* Cloud Fundamentals (AWS/Azure/GCP) — Backend & Infra */
    "cloud-basics": [
      { videoId: "3hLmDS179YE", title: "AWS Certified Cloud Practitioner Training 2020 - Full Course", minutes: 238, channel: "freeCodeCamp.org" },
      { videoId: "35JSBXkjuhk", title: "AWS Cloud Practitioner Training — AWS Cloud Practitioner Essentials — AWS Full Course — Simplillearn", minutes: 713, channel: "Simplilearn" }
    ],
    /* Kubernetes — Backend & Infra */
    "kubernetes": [
      { videoId: "d6WC5n9G_sM", title: "Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)", minutes: 178, channel: "freeCodeCamp.org" },
      { videoId: "X48VuDVv0do", title: "Kubernetes Tutorial for Beginners [FULL COURSE in 4 Hours]", minutes: 217, channel: "TechWorld with Nana" }
    ],
    /* Infrastructure as Code (Terraform) — Backend & Infra */
    "iac": [
      { videoId: "SLB_c_ayRMo", title: "Terraform Course - Automate your AWS cloud infrastructure", minutes: 141, channel: "freeCodeCamp.org" },
      { videoId: "l5k1ai_GBDE", title: "Terraform explained in 15 mins — Terraform Tutorial for Beginners", minutes: 18, channel: "TechWorld with Nana" }
    ],
    /* Monitoring & Observability — Backend & Infra */
    "observability": [
      { videoId: "h4Sl21AKiDg", title: "How Prometheus Monitoring works — Prometheus Architecture explained", minutes: 22, channel: "TechWorld with Nana" },
      { videoId: "9DqOMZrc4PA", title: "Monitoring With Prometheus & Grafana In Hindi — Grafana Tutorial For Beginners — Great Learning", minutes: 55, channel: "Great Learning" }
    ],
    /* Reliability & Incident Response — Backend & Infra */
    "sre-basics": [
      { videoId: "Kj5ik3UPBbA", title: "Site Reliability Engineer (SRE) Course 2026 — SRE Training — SRE Full Course Free — MindMajix", minutes: 403, channel: "MindMajix" },
      { videoId: "KChcfuG8KqY", title: "SRE & AIOps Fundamentals Masterclass — Site Reliability Engineering Core Principles", minutes: 53, channel: "Nextgen_AI" }
    ],
    /* Mobile UI & Layout — Mobile */
    "mobile-ui": [
      { videoId: "c9Wg6Cb_YlU", title: "UI / UX Design Tutorial — Wireframe, Mockup & Design in Figma", minutes: 86, channel: "freeCodeCamp.org" },
      { videoId: "MBblN98-5lg", title: "UI UX Design Course FREE — UI UX Design Full Course For Beginners (2025) — Intellipaat", minutes: 651, channel: "Intellipaat" }
    ],
    /* Flutter & Dart — Mobile */
    "flutter": [
      { videoId: "pTJJsmejUOQ", title: "Flutter Course - Full Tutorial for Beginners (Build iOS and Android Apps)", minutes: 106, channel: "freeCodeCamp.org" },
      { videoId: "o4YlqFRH00Q", title: "Earn by Building Apps with this Low Code Tool — FlutterFlow Tutorial", minutes: 33, channel: "CodeWithHarry" }
    ],
    /* React Native — Mobile */
    "react-native": [
      { videoId: "sm5Y7Vtuihg", title: "React Native Full Course for Beginners", minutes: 264, channel: "freeCodeCamp.org" },
      { videoId: "0-S5a0eXPoc", title: "React Native Tutorial for Beginners - Build a React Native App", minutes: 127, channel: "Programming with Mosh" }
    ],
    /* Android with Kotlin — Mobile */
    "kotlin-android": [
      { videoId: "Iz08OTTjR04", title: "Android Development Course - Build Native Apps with Kotlin Tutorial", minutes: 205, channel: "freeCodeCamp.org" },
      { videoId: "KAh2TOrtTq4", title: "The Android Developer Roadmap for 2024 (Right Way)", minutes: 21, channel: "CodeWithHarry" }
    ],
    /* iOS with Swift — Mobile */
    "swift-ios": [
      { videoId: "8Xg7E9shq0U", title: "Swift Programming Tutorial — Full Course for Beginners", minutes: 425, channel: "freeCodeCamp.org" },
      { videoId: "-VC3hIEL7eQ", title: "SwiftUI Course for Beginners — Create an iOS App from Scratch", minutes: 237, channel: "freeCodeCamp.org and Blossom Build" }
    ],
    /* Mobile State & Local Storage — Mobile */
    "mobile-state": [
      { videoId: "ELFORM9fmss", title: "Flutter Clean Architecture Full Course For Beginners - Bloc, Supabase, Hive, GetIt", minutes: 425, channel: "Rivaan Ranawat" },
      { videoId: "uCbHxLA9t9E", title: "Keeping it local: Managing a Flutter app's data", minutes: 45, channel: "Flutter" }
    ],
    /* Firebase / BaaS — Mobile */
    "firebase": [
      { videoId: "fgdpvwEWJ9M", title: "Firebase — Full Course for Beginners", minutes: 225, channel: "freeCodeCamp.org" },
      { videoId: "9kRgVxULbag", title: "Firebase - Ultimate Beginner's Guide", minutes: 22, channel: "Fireship" }
    ],
    /* App Store & Play Store Release — Mobile */
    "app-release": [
      { videoId: "Ormjb-BX1sw", title: "How to Publish App to Google Play Store - Complete Guide — Android Tutorial", minutes: 31, channel: "WsCube Tech" },
      { videoId: "2JbdGXxh1V0", title: "How to Publish Your Android App on Google Play Store in 2026 (Step-by-Step for Beginners)", minutes: 35, channel: "Saddam Kassim" }
    ],
    /* Python Programming — Data & Analytics */
    "python-basics": [
      { videoId: "rfscVS0vtbw", title: "Learn Python - Full Course for Beginners [Tutorial]", minutes: 267, channel: "freeCodeCamp.org" }
    ],
    /* Excel / Google Sheets — Data & Analytics */
    "excel": [
      { videoId: "Vl0H-qTclOg", title: "Microsoft Excel Tutorial for Beginners - Full Course", minutes: 146, channel: "freeCodeCamp.org" },
      { videoId: "LgXzzu68j7M", title: "Excel Tutorial for Beginners", minutes: 16, channel: "Kevin Stratvert" }
    ],
    /* Statistics & Probability — Data & Analytics */
    "statistics": [
      { videoId: "xxpc-HPKN28", title: "Statistics - A Full University Course on Data Science Basics", minutes: 495, channel: "freeCodeCamp.org" },
      { videoId: "LZzq1zSL1bs", title: "Complete Statistics For Data Science In 6 hours By Krish Naik", minutes: 329, channel: "Krish Naik" }
    ],
    /* NumPy & Pandas — Data & Analytics */
    "pandas": [
      { videoId: "LHBE6Q9XlzI", title: "Python for Data Science - Course for Beginners (Learn Python, Pandas, NumPy, Matplotlib)", minutes: 740, channel: "freeCodeCamp.org" },
      { videoId: "RhEjmHeDNoA", title: "Python Pandas Tutorial in Hindi", minutes: 65, channel: "CodeWithHarry" }
    ],
    /* Data Cleaning & EDA — Data & Analytics */
    "data-cleaning": [
      { videoId: "r-uOLxNrNk8", title: "Data Analysis with Python - Full Course for Beginners (Numpy, Pandas, Matplotlib, Seaborn)", minutes: 262, channel: "freeCodeCamp.org" },
      { videoId: "bDhvCp3_lYw", title: "Data Cleaning in Pandas — Python Pandas Tutorials", minutes: 39, channel: "Alex The Analyst" }
    ],
    /* Data Visualisation — Data & Analytics */
    "data-viz": [
      { videoId: "xXibS9832FM", title: "Matplotlib Python Full Course 2025 — Matplotlib in One Hour-Data Visualization Tutorial — Intellipaat", minutes: 51, channel: "Intellipaat" }
    ],
    /* Power BI / Tableau — Data & Analytics */
    "bi-tools": [
      { videoId: "FwjaHCVNBWA", title: "Power BI for Data Analytics - Full Course for Beginners", minutes: 505, channel: "Luke Barousse" },
      { videoId: "3u7MQz1EyPY", title: "Power BI Full Course - Learn Power BI in 4 Hours — Power BI Tutorial for Beginners — Edureka", minutes: 216, channel: "edureka!" }
    ],
    /* Data Storytelling — Data & Analytics */
    "data-storytelling": [
      { videoId: "xYMh4P_Ff1I", title: "Master Data Storytelling: From Raw Data to Powerful Narratives (Full Course + Certificate)", minutes: 219, channel: "BizatWeb" },
      { videoId: "poDs13xvbP0", title: "Storytelling with Data Full Course — Data Analytics — Data Science — Beginners 2022", minutes: 40, channel: "Tayyab Ali" }
    ],
    /* Experimentation & A/B Testing — Data & Analytics */
    "ab-testing": [
      { videoId: "KZe0C0Qq4p0", title: "Data Science Essentials — Crash Course in A/B Testing with Case Study", minutes: 153, channel: "freeCodeCamp.org" }
    ],
    /* Data Pipelines & ETL — Data & Analytics */
    "data-pipelines": [
      { videoId: "PHsC_t0j1dU", title: "Data Engineering Course for Beginners", minutes: 184, channel: "freeCodeCamp.org" },
      { videoId: "Y_vQyMljDsE", title: "Apache Airflow One Shot- Building End To End ETL Pipeline Using AirFlow And Astro", minutes: 52, channel: "Krish Naik" }
    ],
    /* Big Data (Spark) — Data & Analytics */
    "big-data": [
      { videoId: "_C8kWso4ne4", title: "PySpark Tutorial", minutes: 109, channel: "freeCodeCamp.org" },
      { videoId: "zC9cnh8rJd0", title: "Spark Tutorial — Spark Tutorial for Beginners — Apache Spark Full Course - Learn Apache Spark 2020", minutes: 464, channel: "Great Learning" }
    ],
    /* Supervised Learning — AI & ML */
    "ml-supervised": [
      { videoId: "hDKCxebp88A", title: "Machine Learning with Python and Scikit-Learn — Full Course", minutes: 1081, channel: "freeCodeCamp.org" },
      { videoId: "i_LwzRVP7bg", title: "Machine Learning for Everybody — Full Course", minutes: 234, channel: "freeCodeCamp.org and Kylie Ying" }
    ],
    /* Unsupervised Learning — AI & ML */
    "ml-unsupervised": [
      { videoId: "Aa4MACKaDC0", title: "Complete Unsupervised Machine Learning Tutorials In Hindi- K Means,DBSCAN, Hierarchical Clustering", minutes: 94, channel: "Krish Naik Hindi" },
      { videoId: "461Opp1TShk", title: "Live Day 6- Discussing KMeans,Hierarchical And DBScan Clustering Algorithms", minutes: 79, channel: "Krish Naik" }
    ],
    /* Feature Engineering — AI & ML */
    "feature-eng": [
      { videoId: "fHFOANOHwh8", title: "Complete Exploratory Data Analysis And Feature Engineering In 3 Hours — Krish Naik", minutes: 169, channel: "Krish Naik" },
      { videoId: "uw8aYvRIxn0", title: "Complete Feature Engineering in One Shot 5 Hours — Semester Exam — Hindi", minutes: 327, channel: "5 Minutes Engineering" }
    ],
    /* Model Evaluation & Validation — AI & ML */
    "model-eval": [
      { videoId: "Q20koyOzZS4", title: "2: Scikit-learn Creating Machine Learning Models — Evaluation, Hyperparameter Tuning & Deployment", minutes: 210, channel: "RStudios Inc." }
    ],
    /* Deep Learning — AI & ML */
    "deep-learning": [
      { videoId: "GIsg-ZUy0MY", title: "PyTorch for Deep Learning - Full Course / Tutorial", minutes: 582, channel: "freeCodeCamp.org" },
      { videoId: "wu8npoU37cI", title: "Become an AI Researcher Course — LLM, Math, PyTorch, Neural Networks, Transformers", minutes: 187, channel: "freeCodeCamp.org and Vuk Rosić" }
    ],
    /* Natural Language Processing — AI & ML */
    "nlp": [
      { videoId: "dIUTsFT2MeQ", title: "Natural Language Processing with spaCy & Python - Course for Beginners", minutes: 183, channel: "freeCodeCamp.org" },
      { videoId: "bPpwZxasJo0", title: "Lec-36: Natural Language Processing in Artificial Intelligence in Hindi — NLP with Demo and Examples", minutes: 17, channel: "Gate Smashers" }
    ],
    /* Computer Vision — AI & ML */
    "cv": [
      { videoId: "oXlwWbU8l2o", title: "OpenCV Course - Full Tutorial with Python", minutes: 222, channel: "freeCodeCamp.org" }
    ],
    /* Generative AI & LLM Apps — AI & ML */
    "genai-llm": [
      { videoId: "sVcwVQRHIc8", title: "Learn RAG From Scratch — Python AI Tutorial from a LangChain Engineer", minutes: 153, channel: "freeCodeCamp.org" },
      { videoId: "KGDe1QvfKJ8", title: "9: Generative AI — Large Language Models (LLMs) and Retrieval Augmented Generation (RAG)", minutes: 75, channel: "MIT OpenCourseWare" }
    ],
    /* MLOps & Model Deployment — AI & ML */
    "mlops": [
      { videoId: "-dJPoLm_gtE", title: "MLOps Course — Build Machine Learning Production Grade Projects", minutes: 181, channel: "freeCodeCamp.org" },
      { videoId: "biqYkVf-a7Y", title: "MLOps Explained - What It Is, Why You Need It and How It Works", minutes: 26, channel: "TechWorld with Nana" }
    ],
    /* Responsible AI — AI & ML */
    "ai-ethics": [
      { videoId: "qpp1G0iEL_c", title: "The Ethics of AI & Machine Learning [Full Course]", minutes: 102, channel: "freeCodeCamp.org" },
      { videoId: "i5Xy0yddb-A", title: "AI Ethics, Bias & Security in ML", minutes: 45, channel: "Mindflux Academy" }
    ],
    /* Security Fundamentals — Security */
    "security-basics": [
      { videoId: "9HOpanT0GRs", title: "Harvard CS50's Intro to Cybersecurity — Full University Course", minutes: 464, channel: "freeCodeCamp.org and CS50" },
      { videoId: "BLRFduFGrfI", title: "Complete CyberSecurity Roadmap 2025 (Beginner's Guide)", minutes: 15, channel: "CodeWithHarry" }
    ],
    /* Network Security — Security */
    "network-security": [
      { videoId: "FS_HLstmiNc", title: "Free Wireshark Crash Course — 1 Hour — Network and Security Engineer — by Jaimin Pathak", minutes: 76, channel: "Rajneesh Gupta" },
      { videoId: "NqgqJj9bpWc", title: "Network Security Full Course - Google's Course", minutes: 69, channel: "Computer Networks Decoded" }
    ],
    /* Applied Cryptography — Security */
    "cryptography": [
      { videoId: "kb_scuDUHls", title: "Cryptography for Beginners - Full Python Course (SHA-256, AES, RSA, Passwords)", minutes: 50, channel: "freeCodeCamp.org" },
      { videoId: "C7vmouDOJYM", title: "Cryptography Full Course — Cryptography And Network Security — Cryptography — Simplilearn", minutes: 135, channel: "Simplilearn" }
    ],
    /* Web Application Security (OWASP) — Security */
    "owasp": [
      { videoId: "F5KJVuii0Yw", title: "Web App Vulnerabilities - DevSecOps Course for Beginners", minutes: 89, channel: "freeCodeCamp.org" },
      { videoId: "j5PuYFCS0Iw", title: "Web Application Security and OWASP - Top 10 Security Flaws with Examples", minutes: 41, channel: "in28minutes" }
    ],
    /* Ethical Hacking Toolkit — Security */
    "pentest-tools": [
      { videoId: "fNzpcB7ODxQ", title: "Ethical Hacking in 12 Hours - Full Course - Learn to Hack!", minutes: 737, channel: "The Cyber Mentors" },
      { videoId: "4t4kBkMsDbQ", title: "Nmap Tutorial to find Network Vulnerabilities", minutes: 17, channel: "NetworkChuck" }
    ],
    /* VAPT & Reporting — Security */
    "vapt": [
      { videoId: "3Kq1MIfTWCE", title: "Full Ethical Hacking Course - Network Penetration Testing for Beginners (2019)", minutes: 891, channel: "freeCodeCamp.org" },
      { videoId: "LiDC2hLN6jg", title: "Penetration Testing Full Course — Network Penetration Testing For Absolute Beginners — Simplilearn", minutes: 301, channel: "Simplilearn" }
    ],
    /* SOC Operations & SIEM — Security */
    "soc-siem": [
      { videoId: "56NDgBOSpUg", title: "Security Operations (SOC) 101 Course - 10+ Hours of Content!", minutes: 711, channel: "The Cyber Mentors" }
    ],
    /* Digital Forensics & IR — Security */
    "forensics": [
      { videoId: "umB4WlfQ1JY", title: "A Practical Intro to Digital Forensics", minutes: 47, channel: "The Cyber Mentors" }
    ],
    /* GRC & Compliance — Security */
    "grc": [
      { videoId: "JswwHeEqBIc", title: "GRC Analyst Masterclass : Build Policies, Manage Risks, and Ensure Compliance", minutes: 134, channel: "Prabh Nair" },
      { videoId: "5oKMf9g-Bo4", title: "ISO27001:2022 Lead Implementor Course — Part-1 — Full Course 2022 Update", minutes: 85, channel: "INFOCUSIT" }
    ],
    /* Design Fundamentals — Design */
    "design-principles": [
      { videoId: "SnxFkHqN1RA", title: "Graphic Design Essentials: Free Course", minutes: 172, channel: "Flux Academy" }
    ],
    /* Figma — Design */
    "figma": [
      { videoId: "jwCmIBJ8Jtc", title: "Figma Tutorial for UI Design - Course for Beginners", minutes: 617, channel: "freeCodeCamp.org" },
      { videoId: "mT_Jjn8RJdo", title: "Learn Figma in 6 Hours — Full Course for 2026", minutes: 376, channel: "freeCodeCamp.org and Supercreator" }
    ],
    /* Wireframing & Information Architecture — Design */
    "wireframing": [
      { videoId: "j0y8YBhDjIA", title: "Full Workshop: Content Strategy & Information Architecture", minutes: 63, channel: "Flux Academy" },
      { videoId: "hN65NAkGOw4", title: "Visual Design And Wire Framing Full Course 2026 — Visual Design Wire Framing Tutorial — Simplilearn", minutes: 235, channel: "Simplilearn" }
    ],
    /* User Research — Design */
    "user-research": [
      { videoId: "xkXaPOb9Qxo", title: "User Research Full Course 2026 [FREE] — User Research UX Design Tutorial For Beginners — Simplilearn", minutes: 497, channel: "Simplilearn" }
    ],
    /* Prototyping & Interaction Design — Design */
    "prototyping": [
      { videoId: "Ef7t7xfBv-A", title: "Advanced Figma Course 2026 — Advanced Figma Tutorial — Figma Advanced Prototyping — Simplilearn", minutes: 109, channel: "Simplilearn" }
    ],
    /* Design Systems — Design */
    "design-systems": [
      { videoId: "RYDiDpW2VkM", title: "Create a Design System with Figma - Full Course", minutes: 459, channel: "freeCodeCamp.org" },
      { videoId: "PASsk7lxTrc", title: "2026 Figma Crash Course - Brand & UI/UX Design", minutes: 87, channel: "DesignCourse" }
    ],
    /* Usability Testing — Design */
    "usability-testing": [
      { videoId: "nYCJTea1AUQ", title: "Usability Testing Tips and Examples — Google UX Design Certificate", minutes: 64, channel: "Grow with Google" },
      { videoId: "zGY2ygfrQ0w", title: "How to Run Usability Tests in House", minutes: 59, channel: "Userlytics" }
    ],
    /* UX Writing — Design */
    "ux-writing": [
      { videoId: "hsMLqUFtPbU", title: "A Beginner's Guide To UX Writing (Full Guide)", minutes: 60, channel: "CareerFoundry" },
      { videoId: "txdhMz2AHP8", title: "Fundamentals of UX Writing — WANDR Lunch & Learn", minutes: 65, channel: "WANDR" }
    ],
    /* Case-Study Portfolio — Design */
    "design-portfolio": [
      { videoId: "N-34Q9mhwvs", title: "UX/UI Portfolio + Case Study FULL COURSE", minutes: 262, channel: "Malewicz" },
      { videoId: "PNG0Qvl-PdQ", title: "How I'd Build A JOB READY UI/UX Design Portfolio In 2026. [FULL GUIDE]", minutes: 19, channel: "Saptarshi Prakash" }
    ],
    /* Product Sense — Product & Business */
    "product-sense": [
      { videoId: "3sqCSrrlXy8", title: "Webinar: How to Build Strong Product Sense Foundations by PayPal Lead PM, Saurabh Pareek", minutes: 30, channel: "Product School" }
    ],
    /* PRDs & Requirement Writing — Product & Business */
    "prd-writing": [
      { videoId: "ydHLajgdT4c", title: "Webinar: How to Write Great Product Requirements by Amazon Sr PM, Elly Newell", minutes: 29, channel: "Product School" }
    ],
    /* Roadmapping & Prioritisation — Product & Business */
    "prioritisation": [
      { videoId: "1UbEXskACRc", title: "Product Roadmap & Prioritization — Product Management Basics — Part 4", minutes: 52, channel: "King Sidharth" },
      { videoId: "NLdzE2Qw37A", title: "Rice Prioritization Framework: Explanation with Examples", minutes: 32, channel: "dezkr" }
    ],
    /* Product Metrics & Analytics — Product & Business */
    "product-metrics": [
      { videoId: "N-Igkw7__z0", title: "Analytics for Product Managers Masterclass — Metrics - KPIs - Events - Mixpanel — HelloPM", minutes: 130, channel: "HelloPM" },
      { videoId: "5O4ST-R5ZVw", title: "One-Hour Product Analytics Tutorial", minutes: 59, channel: "Product Analytics Academy" }
    ],
    /* Stakeholder Communication — Product & Business */
    "stakeholder-comm": [
      { videoId: "98bmkeIjZjE", title: "Webinar: Effective Tips & Tools for Stakeholder Management by Peloton Sr PM, Lauren Peters", minutes: 29, channel: "Product School" },
      { videoId: "SPj-Luod9tI", title: "Project Stakeholder Management — Project Management — PMP Certification — PMP Tutorial — Edureka", minutes: 22, channel: "edureka!" }
    ],
    /* Process & Requirement Modelling — Product & Business */
    "process-modeling": [
      { videoId: "LktbfHdEm-U", title: "Business Analyst Training Full course (Step by Step Guide ) ( 100 % free course )in 10 hours", minutes: 555, channel: "Pradeepa -Career Coach" },
      { videoId: "OnwhPsfbMmU", title: "Business Analyst Course in 6 Hours — Business Analyst Training For Beginners", minutes: 375, channel: "ThePrefectBA" }
    ],
    /* Go-To-Market Basics — Product & Business */
    "gtm": [
      { videoId: "FmyI8jmLdEg", title: "Full Course: Go-To-Market Strategy & Product Launch Plan — Step-by-Step Guide", minutes: 114, channel: "Start & Grow Your Business" },
      { videoId: "sbukq1_V4Ms", title: "Lecture 39 : Go to Market Strategy", minutes: 35, channel: "NPTEL IIT Kharagpur" }
    ],
    /* Domain Knowledge — Product & Business */
    "domain-knowledge": [
      { videoId: "EJHPltmAULA", title: "Fundamentals of Finance & Economics for Businesses — Crash Course", minutes: 98, channel: "freeCodeCamp.org" }
    ],
    /* Marketing Fundamentals — Marketing */
    "marketing-basics": [
      { videoId: "nU-IIXBWlS4", title: "Digital Marketing Course Part - 1 — Digital Marketing Tutorial For Beginners — Simplilearn", minutes: 650, channel: "Simplilearn" },
      { videoId: "mLe7qWYwRU4", title: "Digital Marketing Full Course FREE (2026) — Intellipaat", minutes: 607, channel: "Intellipaat" }
    ],
    /* Copywriting — Marketing */
    "copywriting": [
      { videoId: "aOSGrr_LNQk", title: "FREE 4 Hour Copywriting Course For Beginners — $0-$10k/mo In 90 Days", minutes: 245, channel: "Tyson 4D" },
      { videoId: "vcQxkgHSPTc", title: "Copywriting Full Course for Beginners in 7 HOURS — Become Copywriter Without Experience", minutes: 461, channel: "WsCube Tech" }
    ],
    /* SEO — Marketing */
    "seo": [
      { videoId: "xsVTqzratPs", title: "Complete SEO Course for Beginners: Learn to Rank #1 in Google", minutes: 117, channel: "Ahrefs" },
      { videoId: "HJIwjXf9YFs", title: "SEO Full Course 2026 — SEO Tutorial for Beginners — SEO Training — SEO Explained — Simplilearn", minutes: 389, channel: "Simplilearn" }
    ],
    /* Content & Social Media Marketing — Marketing */
    "content-marketing": [
      { videoId: "osVm6UrwEYc", title: "Content Marketing Full Course — Content Marketing Tutorial For Beginners — Simplilearn", minutes: 126, channel: "Simplilearn" }
    ],
    /* Paid Ads (Google & Meta) — Marketing */
    "paid-ads": [
      { videoId: "C2O-WSHjRS0", title: "Meta Ads Full Course Tutorial 2026 in Hindi — #metaads #facebookads", minutes: 242, channel: "Marketing Fundas" },
      { videoId: "Mh-9srK5w54", title: "Google Ads Full Course 2026: Learn All Google Ads Campaigns in 3 Hours as a Beginner", minutes: 170, channel: "WsCube Tech" }
    ],
    /* Email Marketing & CRM — Marketing */
    "email-crm": [
      { videoId: "DvwUgqX3ZF4", title: "Email Marketing Full Course 2026 — Email Marketing Tutorial for Beginners — Simplilearn", minutes: 190, channel: "Simplilearn" }
    ],
    /* Web Analytics (GA4) — Marketing */
    "web-analytics": [
      { videoId: "e6ntvZDErQ4", title: "Google Analytics Tutorial 2026 — Google Analytics Course — Google Analytics — Simplilearn", minutes: 231, channel: "Simplilearn" }
    ],
    /* Short-Form Video & Editing — Marketing */
    "video-editing": [
      { videoId: "CVH6TKL12Wg", title: "Video Editing Complete Course — Adobe Premiere Pro Complete Tutorial", minutes: 226, channel: "HBA Services" },
      { videoId: "OgRo9abQD0c", title: "Adobe Premiere Pro Masterclass: Complete Editing Workflow (7+ Hours)", minutes: 422, channel: "Hammad Sayed" }
    ],
    /* Brand Strategy — Marketing */
    "brand-strategy": [
      { videoId: "jo5THshRG60", title: "How To Become A Brand Strategist", minutes: 69, channel: "The Futur" },
      { videoId: "cPOuOqpjHi4", title: "Branding Masterclass: How to Create a Brand Strategy for Your Business", minutes: 21, channel: "HubSpot Marketing" }
    ],
    /* C Programming — Electronics & Embedded */
    "c-programming": [
      { videoId: "KJgsSFOSQv0", title: "C Programming Tutorial for Beginners", minutes: 226, channel: "freeCodeCamp.org" },
      { videoId: "ZSPZob_1TOk", title: "C Language Tutorial For Beginners In Hindi (With Notes)", minutes: 913, channel: "CodeWithHarry" }
    ],
    /* Digital Electronics — Electronics & Embedded */
    "digital-elec": [
      { videoId: "9Tn9M98yER8", title: "Complete DE Digital Electronics in One Shot 6 Hours — Semester Exam — Hindi", minutes: 347, channel: "5 Minutes Engineering" }
    ],
    /* Microcontrollers & Embedded C — Electronics & Embedded */
    "microcontrollers": [
      { videoId: "vKyL43qXPpk", title: "Learn STM32 Microcontroller Programming - Full Course for EE/CS Students and Beginners Version 3", minutes: 663, channel: "BuildYourCNC" }
    ],
    /* Sensors & Interfacing — Electronics & Embedded */
    "sensors": [
      { videoId: "3Gz3sWsU5HQ", title: "Introduction to Arduino Uno programming wiring sensors actuators", minutes: 80, channel: "Minnesota Space Grant Consortium" }
    ],
    /* Arduino & Raspberry Pi Projects — Electronics & Embedded */
    "arduino-rpi": [
      { videoId: "zJ-LqeX_fLU", title: "Arduino Course for Beginners - Open-Source Electronics Platform", minutes: 244, channel: "freeCodeCamp.org" },
      { videoId: "fJWR7dBuc18", title: "Arduino Tutorial 1: Setting Up and Programming the Arduino for Absolute Beginners", minutes: 24, channel: "Paul McWhorter" }
    ],
    /* RTOS Concepts — Electronics & Embedded */
    "rtos": [
      { videoId: "w9UnrHldmX0", title: "STM32 FreeRTOS Complete Course: Tasks, Semaphores, Mutexes, Notifications and Stack Management", minutes: 147, channel: "ControllersTech" }
    ],
    /* IoT & Communication Protocols — Electronics & Embedded */
    "iot-protocols": [
      { videoId: "au6RlQ3atdk", title: "IoT Protocols - MQTT explained in details — Akshay Shinde — IoT Trainer", minutes: 39, channel: "Akshay Shinde" },
      { videoId: "uKL8isafZFg", title: "IoT Course 8: What is MQTT communication Protocol", minutes: 36, channel: "AI & IoT ONLINE" }
    ],
    /* PCB Design — Electronics & Embedded */
    "pcb-design": [
      { videoId: "KWIzhbQaZZk", title: "How to Make Custom ESP32 Board in Altium Designer — Full Tutorial", minutes: 491, channel: "Robert Feranec" }
    ],
    /* MATLAB / Simulink — Electronics & Embedded */
    "matlab": [
      { videoId: "7f50sQYjNRA", title: "MATLAB Crash Course for Beginners", minutes: 118, channel: "freeCodeCamp.org" }
    ]
  };

  /* ── Storage ──────────────────────────────────────────────────────────── */
  var LIBRARY_KEY = "dronaskill_lecture_library";
  var WATCH_KEY   = "dronaskill_lecture_progress";
  var PREFS_KEY   = "dronaskill_lecture_prefs";

  var MAX_ADDED_PER_SKILL = 50;
  var MAX_MINUTES = 1200;       /* full courses genuinely run past 10 hours */
  var MAX_TEXT = 120;

  /* ── Video id parsing and validation ──────────────────────────────────── */
  var ID_RE = /^[A-Za-z0-9_-]{11}$/;

  /* The (?![A-Za-z0-9_-]) lookahead matters: without it a pasted
     "watch?v=PkZNo7MFNFgEXTRA" silently truncates to a different but
     valid-looking id and loads the wrong video. Lookahead is ES3-safe;
     do not switch these to lookbehind. */
  var URL_PATTERNS = [
    /[?&]v=([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/,
    /youtu\.be\/([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/,
    /\/embed\/([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/,
    /\/shorts\/([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/,
    /\/live\/([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/,
    /\/v\/([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/
  ];

  function isValidVideoId(id) {
    return typeof id === "string" && ID_RE.test(id);
  }

  function parseVideoId(input) {
    if (typeof input !== "string") return null;
    var text = input.replace(/^\s+|\s+$/g, "");
    if (!text) return null;
    if (ID_RE.test(text)) return text;           /* bare id pasted */
    for (var i = 0; i < URL_PATTERNS.length; i++) {
      var m = text.match(URL_PATTERNS[i]);
      if (m && isValidVideoId(m[1])) return m[1];
    }
    return null;
  }

  /* True when the input looks like a playlist link with no video in it —
     lets the paste form say something specific instead of "invalid link". */
  function isPlaylistOnly(input) {
    if (typeof input !== "string") return false;
    return /[?&]list=/.test(input) && parseVideoId(input) === null;
  }

  /* Playlist ids vary more than video ids (10-64 chars covers PL/UU/OL/FL/RD
     and the handful of other prefixes YouTube uses) — this is a shape check,
     not a guarantee the playlist exists or is embeddable. A bad id just fails
     to load in the player, same as a bad curated video id already can. */
  var PLAYLIST_ID_RE = /^[A-Za-z0-9_-]{10,64}$/;

  function isValidPlaylistId(id) {
    return typeof id === "string" && PLAYLIST_ID_RE.test(id);
  }

  function parsePlaylistId(input) {
    if (typeof input !== "string") return null;
    var text = input.replace(/^\s+|\s+$/g, "");
    if (!text) return null;
    var m = text.match(/[?&]list=([A-Za-z0-9_-]{10,64})/);
    if (m && isValidPlaylistId(m[1])) return m[1];
    if (isValidPlaylistId(text)) return text;   /* bare id pasted */
    return null;
  }

  /* t=90 | t=90s | t=1m30s | t=1h2m3s | #t=90 -> seconds */
  function parseStart(input) {
    if (typeof input !== "string") return 0;
    var m = input.match(/[?&#]t=([0-9hms]+)/i);
    if (!m) return 0;
    var raw = m[1].toLowerCase();
    if (/^[0-9]+s?$/.test(raw)) return Math.min(86400, parseInt(raw, 10) || 0);
    var parts = raw.match(/^(?:([0-9]+)h)?(?:([0-9]+)m)?(?:([0-9]+)s)?$/);
    if (!parts) return 0;
    var secs = (parseInt(parts[1], 10) || 0) * 3600 +
               (parseInt(parts[2], 10) || 0) * 60 +
               (parseInt(parts[3], 10) || 0);
    return Math.min(86400, secs);
  }

  /* ── URLs ─────────────────────────────────────────────────────────────── */

  /* Returns "" for anything that fails validation. Callers must treat "" as
     "do not build an iframe" — this is the last gate before a src attribute. */
  function embedUrl(videoId, startSeconds) {
    if (!isValidVideoId(videoId)) return "";
    var url = "https://www.youtube-nocookie.com/embed/" + videoId +
              "?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1";
    var start = Math.max(0, Math.min(86400, Math.floor(Number(startSeconds) || 0)));
    if (start > 0) url += "&start=" + start;
    return url;
  }

  function watchUrl(videoId) {
    if (!isValidVideoId(videoId)) return "";
    return "https://www.youtube.com/watch?v=" + videoId;
  }

  function thumbUrl(videoId) {
    if (!isValidVideoId(videoId)) return "";
    return "https://i.ytimg.com/vi/" + videoId + "/mqdefault.jpg";
  }

  function searchUrl(query) {
    return "https://www.youtube.com/results?search_query=" + encodeURIComponent(String(query || ""));
  }

  function playlistWatchUrl(id) {
    if (!isValidPlaylistId(id)) return "";
    return "https://www.youtube.com/playlist?list=" + encodeURIComponent(id);
  }

  /* ── Small helpers ────────────────────────────────────────────────────── */
  function skillExists(skillId) {
    var D = global.DRONA;
    return !!(D && D.SKILLS && Object.prototype.hasOwnProperty.call(D.SKILLS, skillId));
  }

  function clean(text) {
    if (typeof text !== "string") return "";
    return text.replace(/^\s+|\s+$/g, "").slice(0, MAX_TEXT);
  }

  function cleanMinutes(value) {
    var n = Math.round(Number(value));
    if (!isFinite(n) || n < 0) return 0;
    return Math.min(MAX_MINUTES, n);
  }

  function formatMinutes(minutes) {
    var m = cleanMinutes(minutes);
    if (!m) return "Length not set";
    if (m < 60) return m + "m";
    var h = Math.floor(m / 60);
    var rest = m % 60;
    return rest ? h + "h " + rest + "m" : h + "h";
  }

  /* ── Library (override layer) ─────────────────────────────────────────── */

  /* Sanitises the same way skills-data.js readLog() does: anything that is not
     a real skill id or a valid video id is dropped rather than trusted. This
     store is hand-editable in devtools, so nothing here is assumed well-formed. */
  function readLibrary() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(LIBRARY_KEY) || "null"); } catch (e) { raw = null; }
    if (!raw || typeof raw !== "object") return {};

    var out = {};
    Object.keys(raw).forEach(function (skillId) {
      if (!skillExists(skillId)) return;
      var src = raw[skillId];
      if (!src || typeof src !== "object") return;

      var entry = { hidden: [], edits: {}, added: [], order: [] };

      if (Object.prototype.toString.call(src.hidden) === "[object Array]") {
        src.hidden.forEach(function (id) {
          if (isValidVideoId(id) && entry.hidden.indexOf(id) === -1) entry.hidden.push(id);
        });
      }

      if (src.edits && typeof src.edits === "object") {
        Object.keys(src.edits).forEach(function (id) {
          if (!isValidVideoId(id)) return;
          var patch = src.edits[id];
          if (!patch || typeof patch !== "object") return;
          var kept = {};
          if (typeof patch.title === "string") kept.title = clean(patch.title);
          if (typeof patch.channel === "string") kept.channel = clean(patch.channel);
          if (patch.minutes !== undefined) kept.minutes = cleanMinutes(patch.minutes);
          if (Object.keys(kept).length) entry.edits[id] = kept;
        });
      }

      if (Object.prototype.toString.call(src.added) === "[object Array]") {
        src.added.slice(0, MAX_ADDED_PER_SKILL).forEach(function (item) {
          if (!item || typeof item !== "object" || !isValidVideoId(item.videoId)) return;
          entry.added.push({
            videoId: item.videoId,
            title: clean(item.title) || "Untitled lecture",
            channel: clean(item.channel),
            minutes: cleanMinutes(item.minutes),
            start: Math.max(0, Math.min(86400, Math.floor(Number(item.start) || 0))),
            addedAt: clean(item.addedAt)
          });
        });
      }

      if (Object.prototype.toString.call(src.order) === "[object Array]") {
        src.order.forEach(function (id) {
          if (isValidVideoId(id) && entry.order.indexOf(id) === -1) entry.order.push(id);
        });
      }

      if (src.playlist && typeof src.playlist === "object" && isValidPlaylistId(src.playlist.id)) {
        var pl = {
          id: src.playlist.id,
          title: clean(src.playlist.title) || "Playlist",
          addedAt: clean(src.playlist.addedAt),
          meta: {},
          minutes: {}
        };
        if (src.playlist.meta && typeof src.playlist.meta === "object") {
          Object.keys(src.playlist.meta).forEach(function (vid) {
            if (!isValidVideoId(vid)) return;
            var m = src.playlist.meta[vid];
            if (!m || typeof m !== "object") return;
            var keptM = {};
            if (typeof m.title === "string" && clean(m.title)) keptM.title = clean(m.title);
            if (typeof m.channel === "string") keptM.channel = clean(m.channel);
            if (Object.keys(keptM).length) pl.meta[vid] = keptM;
          });
        }
        if (src.playlist.minutes && typeof src.playlist.minutes === "object") {
          Object.keys(src.playlist.minutes).forEach(function (vid) {
            if (!isValidVideoId(vid)) return;
            pl.minutes[vid] = cleanMinutes(src.playlist.minutes[vid]);
          });
        }
        entry.playlist = pl;
      }

      out[skillId] = entry;
    });
    return out;
  }

  /* Refuses null so a rejected mutator result can't silently wipe the store. */
  function writeLibrary(lib) {
    if (!lib || typeof lib !== "object") return lib;
    try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib)); } catch (e) { /* storage unavailable */ }
    return lib;
  }

  function ensureEntry(lib, skillId) {
    if (!lib[skillId]) lib[skillId] = { hidden: [], edits: {}, added: [], order: [] };
    var e = lib[skillId];
    if (!e.hidden) e.hidden = [];
    if (!e.edits) e.edits = {};
    if (!e.added) e.added = [];
    if (!e.order) e.order = [];
    return e;
  }

  function hasCurated(skillId) {
    return !!(CURATED[skillId] && CURATED[skillId].length);
  }

  /* Curated defaults + the learner's patch, resolved into one ordered list. */
  function lecturesFor(skillId, lib) {
    lib = lib || readLibrary();
    var ov = lib[skillId] || {};
    var hidden = ov.hidden || [];
    var edits = ov.edits || {};
    var list = [];

    (CURATED[skillId] || []).forEach(function (item) {
      if (hidden.indexOf(item.videoId) !== -1) return;
      var patch = edits[item.videoId] || {};
      list.push({
        videoId: item.videoId,
        title: patch.title !== undefined ? patch.title : item.title,
        channel: patch.channel !== undefined ? patch.channel : item.channel,
        minutes: patch.minutes !== undefined ? patch.minutes : item.minutes,
        start: 0,
        source: "curated"
      });
    });

    (ov.added || []).forEach(function (item) {
      var patch = edits[item.videoId] || {};
      list.push({
        videoId: item.videoId,
        title: patch.title !== undefined ? patch.title : item.title,
        channel: patch.channel !== undefined ? patch.channel : item.channel,
        minutes: patch.minutes !== undefined ? patch.minutes : item.minutes,
        start: item.start || 0,
        source: "custom"
      });
    });

    /* De-dupe by videoId, first wins — guards against pasting something
       that is already curated for this skill. */
    var seen = {};
    list = list.filter(function (item) {
      if (!isValidVideoId(item.videoId)) return false;   /* last validation gate */
      if (seen[item.videoId]) return false;
      seen[item.videoId] = true;
      return true;
    });

    if (ov.order && ov.order.length) {
      var rank = {};
      ov.order.forEach(function (id, i) { rank[id] = i; });
      list = list.map(function (item, i) { return { item: item, i: i }; })
        .sort(function (a, b) {
          var ra = rank[a.item.videoId], rb = rank[b.item.videoId];
          if (ra === undefined && rb === undefined) return a.i - b.i;
          if (ra === undefined) return 1;               /* unranked sinks to the end */
          if (rb === undefined) return -1;
          return ra - rb;
        })
        .map(function (w) { return w.item; });
    }

    list.forEach(function (item, i) { item.n = i + 1; });
    return list;
  }

  /* Mutators return the library on success, null on a rejected change. */
  function addLecture(lib, skillId, entry) {
    if (!skillExists(skillId) || !entry) return null;
    var videoId = parseVideoId(entry.videoId || entry.url || "");
    if (!videoId) return null;

    var existing = lecturesFor(skillId, lib);
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].videoId === videoId) return null;   /* duplicate */
    }

    var e = ensureEntry(lib, skillId);
    if (e.added.length >= MAX_ADDED_PER_SKILL) return null;

    /* Re-adding something previously hidden should bring it back, not
       stack a custom copy on top of a suppressed curated entry. */
    var hiddenAt = e.hidden.indexOf(videoId);
    if (hiddenAt !== -1) {
      e.hidden.splice(hiddenAt, 1);
      if (clean(entry.title)) {
        e.edits[videoId] = e.edits[videoId] || {};
        e.edits[videoId].title = clean(entry.title);
        if (entry.minutes !== undefined) e.edits[videoId].minutes = cleanMinutes(entry.minutes);
        if (clean(entry.channel)) e.edits[videoId].channel = clean(entry.channel);
      }
      return lib;
    }

    /* A pasted "?t=90" is honoured even when the caller didn't pull it out. */
    var start = Math.floor(Number(entry.start) || 0);
    if (!start) start = parseStart(entry.videoId || entry.url || "");

    e.added.push({
      videoId: videoId,
      title: clean(entry.title) || "Untitled lecture",
      channel: clean(entry.channel),
      minutes: cleanMinutes(entry.minutes),
      start: Math.max(0, Math.min(86400, start)),
      addedAt: (global.DRONA && global.DRONA.todayISO) ? global.DRONA.todayISO() : ""
    });
    return lib;
  }

  /* Only title / channel / minutes are editable. videoId is the identity key
     the watched store and de-dupe rely on — changing a video is remove + add. */
  function editLecture(lib, skillId, videoId, patch) {
    if (!skillExists(skillId) || !isValidVideoId(videoId) || !patch) return null;
    var e = ensureEntry(lib, skillId);
    var kept = e.edits[videoId] || {};
    if (patch.title !== undefined) kept.title = clean(patch.title) || "Untitled lecture";
    if (patch.channel !== undefined) kept.channel = clean(patch.channel);
    if (patch.minutes !== undefined) kept.minutes = cleanMinutes(patch.minutes);
    e.edits[videoId] = kept;

    /* Custom entries carry their own copy too, so an edit survives a
       library sanitise pass that drops orphaned patches. */
    e.added.forEach(function (item) {
      if (item.videoId !== videoId) return;
      if (kept.title !== undefined) item.title = kept.title;
      if (kept.channel !== undefined) item.channel = kept.channel;
      if (kept.minutes !== undefined) item.minutes = kept.minutes;
    });
    return lib;
  }

  function removeLecture(lib, skillId, videoId) {
    if (!skillExists(skillId) || !isValidVideoId(videoId)) return lib;
    var e = ensureEntry(lib, skillId);
    var before = e.added.length;
    e.added = e.added.filter(function (item) { return item.videoId !== videoId; });
    /* Curated entries can't be deleted from the data file, so hide them. */
    if (e.added.length === before && e.hidden.indexOf(videoId) === -1) e.hidden.push(videoId);
    e.order = e.order.filter(function (id) { return id !== videoId; });
    delete e.edits[videoId];
    return lib;
  }

  function resetSkill(lib, skillId) {
    delete lib[skillId];
    return lib;
  }

  /* ── Playlist mode ────────────────────────────────────────────────────────
     A skill can be pointed at a whole YouTube playlist instead of an
     individual-lecture list. We can't know a pasted playlist's members or
     durations up front without the (keyed, backend-only) Data API, so this
     store only ever holds what we've actually observed through the client-side
     IFrame Player API / oEmbed at runtime: per-video titles/channels in `meta`,
     and per-video watched length in `minutes`, filled in lazily as the learner
     plays through it. See lectures.html for the player wiring. */

  function setPlaylist(lib, skillId, opts) {
    if (!skillExists(skillId) || !opts) return null;
    var id = isValidPlaylistId(opts.id) ? opts.id : parsePlaylistId(opts.id || opts.url || "");
    if (!id) return null;
    var e = ensureEntry(lib, skillId);
    e.playlist = {
      id: id,
      title: clean(opts.title) || "Playlist",
      addedAt: (global.DRONA && global.DRONA.todayISO) ? global.DRONA.todayISO() : "",
      meta: {},
      minutes: {}
    };
    return lib;
  }

  function clearPlaylist(lib, skillId) {
    if (lib[skillId]) delete lib[skillId].playlist;
    return lib;
  }

  function playlistFor(skillId, lib) {
    lib = lib || readLibrary();
    var e = lib[skillId];
    return (e && e.playlist) ? e.playlist : null;
  }

  /* Title/channel learned from oEmbed once a video is seen in the playlist. */
  function setPlaylistMeta(lib, skillId, videoId, patch) {
    if (!skillExists(skillId) || !isValidVideoId(videoId)) return null;
    var e = ensureEntry(lib, skillId);
    if (!e.playlist) return null;
    var kept = e.playlist.meta[videoId] || {};
    if (patch && typeof patch.title === "string" && clean(patch.title)) kept.title = clean(patch.title);
    if (patch && typeof patch.channel === "string") kept.channel = clean(patch.channel);
    e.playlist.meta[videoId] = kept;
    return lib;
  }

  /* Real duration measured by the player once a video has actually played
     through — this is what auto-logging uses for playlist videos, since no
     curated estimate exists for them. */
  function setPlaylistMinutes(lib, skillId, videoId, minutes) {
    if (!skillExists(skillId) || !isValidVideoId(videoId)) return null;
    var e = ensureEntry(lib, skillId);
    if (!e.playlist) return null;
    e.playlist.minutes[videoId] = cleanMinutes(minutes);
    return lib;
  }

  /* ── Watched state ────────────────────────────────────────────────────── */

  /* { skillId: { videoId: "YYYY-MM-DD" } } — a date rather than true, mirroring
     the PROGRESS_KEY convention. The date is what lets the auto-log de-dupe. */
  function readWatched() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(WATCH_KEY) || "null"); } catch (e) { raw = null; }
    if (!raw || typeof raw !== "object") return {};

    var out = {};
    Object.keys(raw).forEach(function (skillId) {
      if (!skillExists(skillId)) return;
      var src = raw[skillId];
      if (!src || typeof src !== "object") return;
      var kept = {};
      Object.keys(src).forEach(function (videoId) {
        if (!isValidVideoId(videoId) || !src[videoId]) return;
        kept[videoId] = typeof src[videoId] === "string" ? src[videoId] : "";
      });
      if (Object.keys(kept).length) out[skillId] = kept;
    });
    return out;
  }

  function writeWatched(watched) {
    if (!watched || typeof watched !== "object") return watched;
    try { localStorage.setItem(WATCH_KEY, JSON.stringify(watched)); } catch (e) { /* storage unavailable */ }
    return watched;
  }

  function isWatched(watched, skillId, videoId) {
    return !!(watched[skillId] && watched[skillId][videoId]);
  }

  function setWatched(watched, skillId, videoId, done) {
    if (!isValidVideoId(videoId)) return watched;
    if (done) {
      if (!watched[skillId]) watched[skillId] = {};
      watched[skillId][videoId] =
        (global.DRONA && global.DRONA.todayISO) ? global.DRONA.todayISO() : "";
    } else if (watched[skillId]) {
      delete watched[skillId][videoId];
      if (!Object.keys(watched[skillId]).length) delete watched[skillId];
    }
    writeWatched(watched);
    return watched;
  }

  function watchedCount(watched, skillId, list) {
    var n = 0;
    (list || []).forEach(function (item) {
      if (isWatched(watched, skillId, item.videoId)) n++;
    });
    return n;
  }

  /* ── Preferences ──────────────────────────────────────────────────────── */
  var DEFAULT_PREFS = { autoLog: true, breakEvery: 50 };
  var BREAK_OPTIONS = [0, 25, 50, 90];

  function readPrefs() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(PREFS_KEY) || "null"); } catch (e) { raw = null; }
    var prefs = { autoLog: DEFAULT_PREFS.autoLog, breakEvery: DEFAULT_PREFS.breakEvery };
    if (raw && typeof raw === "object") {
      if (typeof raw.autoLog === "boolean") prefs.autoLog = raw.autoLog;
      if (BREAK_OPTIONS.indexOf(Number(raw.breakEvery)) !== -1) prefs.breakEvery = Number(raw.breakEvery);
    }
    return prefs;
  }

  function writePrefs(prefs) {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs || DEFAULT_PREFS)); } catch (e) { /* storage unavailable */ }
    return prefs;
  }

  /* ── Export ───────────────────────────────────────────────────────────── */
  global.DRONA_LECTURES = {
    CURATED: CURATED,
    LIBRARY_KEY: LIBRARY_KEY,
    WATCH_KEY: WATCH_KEY,
    PREFS_KEY: PREFS_KEY,
    BREAK_OPTIONS: BREAK_OPTIONS,
    MAX_ADDED_PER_SKILL: MAX_ADDED_PER_SKILL,

    isValidVideoId: isValidVideoId,
    parseVideoId: parseVideoId,
    parseStart: parseStart,
    isPlaylistOnly: isPlaylistOnly,
    isValidPlaylistId: isValidPlaylistId,
    parsePlaylistId: parsePlaylistId,

    embedUrl: embedUrl,
    watchUrl: watchUrl,
    thumbUrl: thumbUrl,
    searchUrl: searchUrl,
    playlistWatchUrl: playlistWatchUrl,

    readLibrary: readLibrary,
    writeLibrary: writeLibrary,
    lecturesFor: lecturesFor,
    hasCurated: hasCurated,
    addLecture: addLecture,
    editLecture: editLecture,
    removeLecture: removeLecture,
    resetSkill: resetSkill,

    setPlaylist: setPlaylist,
    clearPlaylist: clearPlaylist,
    playlistFor: playlistFor,
    setPlaylistMeta: setPlaylistMeta,
    setPlaylistMinutes: setPlaylistMinutes,

    readWatched: readWatched,
    writeWatched: writeWatched,
    isWatched: isWatched,
    setWatched: setWatched,
    watchedCount: watchedCount,

    readPrefs: readPrefs,
    writePrefs: writePrefs,

    formatMinutes: formatMinutes
  };
})(window);
