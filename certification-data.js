/* ══════════════════════════════════════════════════════════════════════════
   Dronaskill — certification question bank + certificate store
   ──────────────────────────────────────────────────────────────────────────
   Plain classic script (no modules) so certification.html can load it over
   file:// with <script src="certification-data.js"></script> and read
   window.DRONA_CERT. Deliberately independent of skills-data.js's load order
   (DOMAINS is hardcoded here, not derived from DRONA.SKILLS at load time).

   QUESTION_BANK : one array per domain, 15-17 hand-written MCQs each. A test
                   samples 10 at random (sampleQuestions) so retakes see a
                   different subset, with each question's option order also
                   shuffled per render.
   Certificates  : only PASSING attempts (score >= 7) are persisted, under
                   dronaskill_certifications, following the same
                   readX()/writeX()/normalize pattern skills-data.js uses for
                   its own localStorage-backed stores.
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  var DOMAINS = [
    "Employability", "CS Fundamentals", "Frontend", "Backend & Infra",
    "Mobile", "Data & Analytics", "AI & ML", "Security", "Design",
    "Product & Business", "Marketing", "Electronics & Embedded"
  ];

  /* ── Question bank ─────────────────────────────────────────────────────
     Each question: { id, q, options: [4 strings], correct: <index 0-3>, explain }
     `correct` is the authoring-time index; sampleQuestions() reshuffles
     option order per draw and remaps it to a runtime `correctIndex`.
     ─────────────────────────────────────────────────────────────────────── */
  var QUESTION_BANK = {

    "Employability": [
      { id: "emp-01", q: "Which is the clearest way to open a professional email requesting a deadline extension?",
        options: ["“Hey, so basically I need more time lol”", "“I am writing to request a short extension on the March 5 deadline, and to explain why.”", "“URGENT!!! READ NOW!!!”", "“You should give me more time.”"],
        correct: 1, explain: "A clear, specific, professional opening states the ask and signals the reasoning will follow." },
      { id: "emp-02", q: "If all Zorbs are Flems, and some Flems are Quibs, which conclusion is definitely true?",
        options: ["All Zorbs are Quibs", "Some Zorbs are Quibs", "No valid conclusion can be drawn about Zorbs and Quibs", "All Quibs are Zorbs"],
        correct: 2, explain: "“Some Flems are Quibs” doesn't guarantee overlap with the specific Flems that are Zorbs — a classic syllogism trap where no valid conclusion follows." },
      { id: "emp-03", q: "A shop marks up a product's cost price by 25% and then offers a 20% discount on the marked price. What's the net effect on the original cost price?",
        options: ["5% profit", "No profit no loss", "5% loss", "10% profit"],
        correct: 1, explain: "100 → 125 (25% markup) → 125×0.8 = 100 (20% discount) — back to the original cost price, net zero." },
      { id: "emp-04", q: "What does `git rebase -i HEAD~3` let you do?",
        options: ["Delete the last 3 commits permanently with no trace", "Interactively edit, squash, or reorder the last 3 commits", "Push the last 3 commits to a new remote branch", "Merge the current branch into main"],
        correct: 1, explain: "Interactive rebase opens an editor listing the last 3 commits so you can reorder, squash, reword, or drop them before rewriting history." },
      { id: "emp-05", q: "What's the key difference between `git merge` and `git rebase` when combining branch histories?",
        options: ["merge is only for remote branches, rebase is only for local ones", "merge creates a new commit that ties two histories together, rebase replays commits onto a new base leaving a linear history", "There's no functional difference, only naming", "rebase deletes the original branch automatically"],
        correct: 1, explain: "merge preserves both histories with a merge commit; rebase rewrites commits on top of another base for a linear history." },
      { id: "emp-06", q: "When using an AI coding assistant like Claude or Copilot, what is the most reliable habit for avoiding subtle bugs?",
        options: ["Trust and paste any code it generates without reading it", "Never use AI tools at all", "Read and test AI-generated code before relying on it, the same as you would review a teammate's PR", "Only use AI tools for writing comments"],
        correct: 2, explain: "AI assistants are fast but sometimes confidently wrong — reviewing and testing output like a colleague's change catches issues before they ship." },
      { id: "emp-07", q: "What's generally the strongest way to describe an achievement on a resume bullet?",
        options: ["“Worked on backend stuff for the team project”", "“Responsible for backend”", "“Reduced API response time by 40% by adding Redis caching to the product search endpoint”", "“Very hardworking and dedicated backend developer”"],
        correct: 2, explain: "Specific, quantified, and shows the action taken plus its measurable result — far stronger than vague duty statements." },
      { id: "emp-08", q: "In the STAR method for behavioural interview answers, what does the “R” stand for?",
        options: ["Requirement", "Result", "Reason", "Review"],
        correct: 1, explain: "STAR = Situation, Task, Action, Result — ending on the measurable outcome is what makes the answer convincing." },
      { id: "emp-09", q: "In Scrum, what is the primary purpose of a daily standup?",
        options: ["To assign performance ratings to each team member", "For each person to briefly sync on progress, plans, and blockers, not to solve problems in the meeting", "To have a formal code review of yesterday's commits", "To plan the next quarter's roadmap"],
        correct: 1, explain: "Standups are a short sync — surfacing blockers so they can be resolved afterward, not a working session in themselves." },
      { id: "emp-10", q: "What is a “pull request” primarily used for in a team's workflow?",
        options: ["Downloading the latest code from a teammate's machine", "Proposing a set of changes for review and discussion before merging into the shared codebase", "Deleting old branches automatically", "Only for reporting bugs"],
        correct: 1, explain: "A PR packages a branch's changes for teammates to review, comment on, and approve before they become part of the shared history." },
      { id: "emp-11", q: "A pie chart shows a 200-person company's departments as Marketing 25%, Engineering 40%, Sales 20%, Other 15%. How many people work in Sales?",
        options: ["20", "30", "40", "50"],
        correct: 2, explain: "20% of 200 = 40 employees." },
      { id: "emp-12", q: "Which revision fixes the wordiness of: “Due to the fact that the server was down, we were unable to complete the deployment.”?",
        options: ["“Due to the fact the server was down we couldn't deploy”", "“Because the server was down, we couldn't complete the deployment.”", "“The server being down is the reason for non-completion of deployment”", "No changes needed"],
        correct: 1, explain: "“Because” replaces the wordy “due to the fact that,” making the sentence direct without losing meaning." },
      { id: "emp-13", q: "You accidentally committed a secret API key. What's the safest first step?",
        options: ["Just delete the file in a new commit", "Revoke/rotate the exposed key immediately, then clean it from history if needed", "Ignore it, git history is private anyway", "Force-push to hide it and never mention it"],
        correct: 1, explain: "Once a secret is committed, treat it as compromised — rotating the key removes the actual risk; scrubbing history only helps after that." },
      { id: "emp-14", q: "During a technical interview, what's the best move if you don't immediately know how to solve a problem?",
        options: ["Stay silent until you find the full solution", "Say you can't do it and ask for a different question", "Think out loud, clarify assumptions, and talk through your approach as you work toward a solution", "Guess a random answer quickly to save time"],
        correct: 2, explain: "Interviewers evaluate your problem-solving process, not just the final answer — narrating your thinking shows how you approach unfamiliar problems." },
      { id: "emp-15", q: "What best describes a “sprint” in Scrum?",
        options: ["An unplanned emergency fix", "A fixed, time-boxed period (commonly 1-2 weeks) during which a set amount of work is completed", "The final release to production", "A meeting held once per quarter"],
        correct: 1, explain: "A sprint is a time-boxed iteration with a committed scope, at the end of which the team reviews progress and plans the next one." }
    ],

    "CS Fundamentals": [
      { id: "csf-01", q: "In most modern computers, what does volatile memory (RAM) do when the power is turned off?",
        options: ["Retains its data indefinitely", "Loses its stored data", "Automatically backs up to disk", "Converts to non-volatile memory"],
        correct: 1, explain: "RAM needs continuous power to hold data; that's what “volatile” means — it clears when power is lost." },
      { id: "csf-02", q: "In a language with local (function) scoping, what does `print(f(), x)` output for `x = 5; def f(): x = 10; return x`?",
        options: ["10 10", "5 5", "10 5", "5 10"],
        correct: 2, explain: "The `x = 10` inside f() creates a local variable that shadows the outer x, so f() returns 10 but the outer x stays 5." },
      { id: "csf-03", q: "Which OOP concept allows a subclass to provide a specific implementation of a method already defined in its superclass?",
        options: ["Encapsulation", "Overriding (part of polymorphism)", "Abstraction", "Composition"],
        correct: 1, explain: "Overriding lets a subclass replace/extend inherited behaviour with its own implementation of the same method signature." },
      { id: "csf-04", q: "What is the time complexity of searching for an element in a balanced binary search tree?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
        correct: 2, explain: "A balanced BST halves the search space at each step, giving logarithmic height and thus logarithmic search time." },
      { id: "csf-05", q: "Which data structure naturally follows First-In-First-Out (FIFO) order?",
        options: ["Stack", "Queue", "Binary tree", "Hash map"],
        correct: 1, explain: "A queue removes elements in the order they were added — the first one in is the first one out." },
      { id: "csf-06", q: "Which technique is dynamic programming's key idea for improving on plain recursion?",
        options: ["Running recursive calls in parallel", "Storing/reusing results of overlapping subproblems instead of recomputing them", "Always using a greedy choice at each step", "Avoiding recursion entirely in favour of loops"],
        correct: 1, explain: "DP relies on memoizing (or tabulating) subproblem results so overlapping subproblems are computed once, not repeatedly." },
      { id: "csf-07", q: "For very large n, which is generally faster: an O(n^2) algorithm or an O(n log n) algorithm?",
        options: ["O(n^2), always", "O(n log n), because it grows more slowly than n^2 as n increases", "They are always identical in practice", "It depends only on constant factors, never the exponent"],
        correct: 1, explain: "n log n grows much more slowly than n^2 as n increases, so for sufficiently large inputs the O(n log n) algorithm wins despite constant-factor differences." },
      { id: "csf-08", q: "What does the “A” in the ACID properties of a database transaction stand for?",
        options: ["Availability", "Atomicity", "Authorization", "Aggregation"],
        correct: 1, explain: "Atomicity guarantees a transaction is all-or-nothing — either every operation in it commits, or none do." },
      { id: "csf-09", q: "What is database normalization primarily used to reduce?",
        options: ["Query execution time in every case", "Data redundancy and update anomalies", "The number of tables in a schema", "Index size"],
        correct: 1, explain: "Normalization organizes data to minimize duplicate/redundant data and the inconsistencies that come from updating the same fact in multiple places." },
      { id: "csf-10", q: "Which SQL clause is used to filter groups after a GROUP BY, based on an aggregate condition?",
        options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
        correct: 1, explain: "WHERE filters rows before grouping; HAVING filters the grouped results, which is required when the condition uses an aggregate like COUNT() or SUM()." },
      { id: "csf-11", q: "What is a “deadlock” in operating systems?",
        options: ["A process that has crashed", "A situation where two or more processes are each waiting on a resource held by the other, and neither can proceed", "A memory leak caused by unfreed pointers", "A scheduler bug that never assigns CPU time"],
        correct: 1, explain: "Deadlock is a circular wait — each process holds a resource the other needs, so none of them can make progress." },
      { id: "csf-12", q: "What is the primary difference between TCP and UDP?",
        options: ["TCP is connectionless, UDP is connection-oriented", "TCP guarantees ordered, reliable delivery with acknowledgments; UDP is faster but offers no such guarantees", "UDP always encrypts data, TCP never does", "They operate at completely different layers with no relation to IP"],
        correct: 1, explain: "TCP adds handshaking, ordering, and retransmission for reliability at the cost of overhead; UDP just sends packets with no delivery guarantee, trading reliability for speed." },
      { id: "csf-13", q: "In Linux, what does the command `chmod 755 script.sh` do?",
        options: ["Deletes the script", "Gives the owner read/write/execute, and group/others read/execute permissions", "Changes the file's owner to user 755", "Compresses the file"],
        correct: 1, explain: "755 in octal maps to rwxr-xr-x — owner gets full permissions, group and others get read+execute only." },
      { id: "csf-14", q: "What is the main purpose of a CPU cache?",
        options: ["To permanently store the operating system", "To hold frequently accessed data closer to the CPU, reducing average memory access time", "To replace RAM entirely", "To manage network requests"],
        correct: 1, explain: "Cache sits between the CPU and main memory, exploiting locality of reference so common data doesn't need a slow round trip to RAM every time." },
      { id: "csf-15", q: "In automata theory, what class of languages can a Deterministic Finite Automaton (DFA) recognize?",
        options: ["Context-free languages", "Regular languages", "Recursively enumerable languages", "Context-sensitive languages"],
        correct: 1, explain: "DFAs are exactly as powerful as regular expressions — they recognize the regular languages, no more, no less." },
      { id: "csf-16", q: "In graph theory, what is the sum of the degrees of all vertices in an undirected graph always equal to?",
        options: ["The number of vertices", "Twice the number of edges", "The number of edges", "Half the number of vertices"],
        correct: 1, explain: "Each edge contributes exactly 2 to the total degree count (one for each endpoint), so summing all degrees always gives 2×(number of edges) — the Handshaking Lemma." }
    ],

    "Frontend": [
      { id: "fe-01", q: "In CSS, which property controls how flex items are distributed along the main axis of a flex container?",
        options: ["align-items", "justify-content", "flex-wrap", "align-content"],
        correct: 1, explain: "justify-content aligns items along the main axis (e.g. space-between, center); align-items handles the cross axis instead." },
      { id: "fe-02", q: "What does `box-sizing: border-box` change about how width/height are calculated?",
        options: ["Width/height include only the content, excluding padding and border", "Width/height include content, padding, and border, so the element's declared size stays fixed regardless of padding", "It disables the box model entirely", "It only affects margins"],
        correct: 1, explain: "border-box folds padding and border into the declared width/height, so adding padding doesn't grow the element beyond the size you set." },
      { id: "fe-03", q: "What is the purpose of the CSS media query `@media (max-width: 600px)`?",
        options: ["To hide the page on screens smaller than 600px", "To apply styles only when the viewport is 600px wide or narrower", "To set a fixed page width of 600px", "To only apply on print, not screen"],
        correct: 1, explain: "max-width in a media query is a condition — the enclosed rules apply only when the viewport is at or below that width, the basis of responsive breakpoints." },
      { id: "fe-04", q: "What does `Array.prototype.map()` return in JavaScript?",
        options: ["The original array, mutated in place", "A single accumulated value", "A new array with the results of calling the callback on every element", "A boolean indicating if any element matches"],
        correct: 2, explain: "map() always returns a brand-new array of the same length, built by transforming each original element — it never mutates the source array." },
      { id: "fe-05", q: "What will `console.log(typeof null)` output in JavaScript?",
        options: ["“null”", "“undefined”", "“object”", "“boolean”"],
        correct: 2, explain: "This is a long-standing JavaScript quirk — typeof null returns “object” due to a bug preserved for backward compatibility since the language's earliest versions." },
      { id: "fe-06", q: "What's the key difference between `let` and `var` in JavaScript?",
        options: ["There is no difference, they're interchangeable", "`let` is block-scoped, `var` is function-scoped", "`var` cannot be reassigned, `let` can", "`let` only works inside classes"],
        correct: 1, explain: "`var` declarations are visible throughout the enclosing function (or globally), while `let` is confined to the nearest enclosing block, avoiding common scoping bugs." },
      { id: "fe-07", q: "What does the TypeScript type `string | number` mean for a variable?",
        options: ["The variable must be a string that contains a number", "The variable can be either a string or a number (a union type)", "The variable is a tuple of a string and a number", "This is invalid syntax"],
        correct: 1, explain: "The `|` creates a union type — the value is allowed to be any one of the listed types, checked at compile time." },
      { id: "fe-08", q: "In React, what triggers a functional component to re-render?",
        options: ["Only when the browser window resizes", "A change in its state or the props passed to it", "Only on the first mount, never again", "Manually calling document.reload()"],
        correct: 1, explain: "React re-runs a component function whenever its internal state changes (via a state setter) or when the props it receives from its parent change." },
      { id: "fe-09", q: "What is the purpose of the dependency array in `useEffect(() => {...}, [dep])`?",
        options: ["It lists variables the effect is allowed to modify", "It controls when the effect re-runs — only after a render where one of the listed values changed", "It has no functional effect, only documentation value", "It sets the component's initial state"],
        correct: 1, explain: "React compares the dependency array's values between renders and only re-runs the effect if at least one has changed, avoiding unnecessary work." },
      { id: "fe-10", q: "What problem does a client-side data-fetching library like React Query primarily solve?",
        options: ["It replaces the need for a backend entirely", "Caching, background refetching, and loading/error state management for server data", "It compiles JSX to JavaScript", "It handles CSS styling"],
        correct: 1, explain: "These libraries manage the lifecycle of server-state — caching responses, refetching when stale, and exposing loading/error states — instead of hand-rolling that with useState/useEffect." },
      { id: "fe-11", q: "In a client-side router (e.g. React Router), what does dynamic route matching like `/users/:id` allow?",
        options: ["Only exact static paths can ever be matched", "A single route definition to match many URLs, capturing the `:id` segment as a parameter", "Routing is disabled for that path", "The route only matches numeric ids"],
        correct: 1, explain: "The `:id` segment is a placeholder — the router matches any value in that position and makes it available to the component as a route parameter." },
      { id: "fe-12", q: "Which Core Web Vital measures how quickly the largest visible content element loads?",
        options: ["Cumulative Layout Shift (CLS)", "First Input Delay (FID)", "Largest Contentful Paint (LCP)", "Time to First Byte (TTFB)"],
        correct: 2, explain: "LCP specifically tracks when the largest image or text block in the viewport finishes rendering — a proxy for when the page feels “loaded” to the user." },
      { id: "fe-13", q: "What is the purpose of an `alt` attribute on an `<img>` tag?",
        options: ["To set the image's file size", "To provide a text alternative for screen readers and for when the image fails to load", "To apply a CSS filter", "It's purely decorative and has no functional purpose"],
        correct: 1, explain: "Screen readers announce the alt text in place of the image, and browsers display it if the image can't load — critical for both accessibility and graceful degradation." },
      { id: "fe-14", q: "In a testing pyramid, what typically makes unit tests preferable to run frequently over end-to-end (E2E) tests?",
        options: ["Unit tests are always more accurate", "Unit tests are faster and cheaper to run since they test isolated pieces of logic without a full browser/app stack", "E2E tests don't require any setup", "There is no meaningful difference in speed"],
        correct: 1, explain: "Unit tests exercise small isolated units of code directly, so they run in milliseconds; E2E tests spin up a real (or simulated) browser and full app, making them slower to run on every change." },
      { id: "fe-15", q: "What is one key benefit of server-side rendering (SSR) frameworks like Next.js for a public-facing website?",
        options: ["It makes all JavaScript run only in the browser", "Pages can be rendered to HTML on the server before reaching the browser, improving initial load and SEO crawlability", "It removes the need for any JavaScript", "It guarantees zero bugs in production"],
        correct: 1, explain: "SSR sends a fully rendered HTML page on first request instead of an empty shell JS fills in later, helping both perceived load speed and search engine crawlers that don't execute JS well." }
    ],

    "Backend & Infra": [
      { id: "bi-01", q: "In Node.js, what does the term “event loop” refer to?",
        options: ["A loop that runs synchronously and blocks until all code finishes", "The mechanism that lets Node handle non-blocking I/O by processing callbacks/tasks as they become ready, on a single thread", "A special type of for-loop syntax unique to Node", "A build tool for bundling JavaScript"],
        correct: 1, explain: "Node offloads I/O work and comes back to run callbacks via the event loop, allowing a single thread to handle many concurrent operations without blocking." },
      { id: "bi-02", q: "In Django/FastAPI-style frameworks, what is the role of an ORM (Object-Relational Mapper)?",
        options: ["It replaces the need for a database entirely", "It lets you interact with database tables using language objects/classes instead of writing raw SQL directly", "It only handles frontend rendering", "It compresses database files"],
        correct: 1, explain: "An ORM maps database rows to objects (and vice versa) so you can query and manipulate data using the host language's syntax instead of hand-writing SQL for every operation." },
      { id: "bi-03", q: "In Spring Boot, what does “dependency injection” primarily achieve?",
        options: ["It automatically writes unit tests", "It supplies a class's required objects (dependencies) from outside rather than having the class construct them itself, improving testability and decoupling", "It compresses the compiled JAR file", "It manages database migrations"],
        correct: 1, explain: "Instead of a class instantiating its own collaborators, the framework “injects” them — making it easy to swap in mocks for testing and reducing tight coupling." },
      { id: "bi-04", q: "In REST API design, what does the HTTP status code 404 indicate?",
        options: ["The server had an internal error", "The request succeeded", "The requested resource could not be found", "The user is not authorized"],
        correct: 2, explain: "404 Not Found specifically means the server couldn't locate a resource matching the requested URI — distinct from 401/403 (auth issues) or 500 (server error)." },
      { id: "bi-05", q: "What HTTP method is conventionally used for a request that should be idempotent and fully replace a resource?",
        options: ["POST", "PUT", "PATCH", "GET"],
        correct: 1, explain: "PUT is defined to fully replace the target resource with the request payload, and repeating it leaves the resource in the same end state (idempotent) — unlike POST, which typically creates a new resource each time." },
      { id: "bi-06", q: "What is the main purpose of hashing a user's password before storing it?",
        options: ["To make the password shorter for storage efficiency", "To store a one-way, irreversible representation so the plaintext password is never recoverable even if the database is breached", "To encrypt it so it can later be decrypted and emailed to the user", "To speed up login queries"],
        correct: 1, explain: "A good password hash (e.g. bcrypt/argon2) is intentionally one-way — even the app itself cannot recover the original password, limiting the damage of a database leak." },
      { id: "bi-07", q: "What does JWT stand for, and what is it commonly used for?",
        options: ["JavaScript Web Tool — bundling frontend assets", "JSON Web Token — a compact, signed token commonly used to carry authentication/authorization claims between parties", "Java Web Thread — a Java concurrency primitive", "Just Web Traffic — a network monitoring protocol"],
        correct: 1, explain: "A JWT is a signed (and optionally encrypted) JSON payload that can be verified without a database lookup, commonly used to represent “this user is authenticated” across requests." },
      { id: "bi-08", q: "What is a “foreign key” used for in relational database design?",
        options: ["It encrypts a column's values", "It enforces a link between a column (or columns) in one table and the primary key of another, maintaining referential integrity", "It automatically indexes every column in a table", "It renames a table"],
        correct: 1, explain: "A foreign key constraint ensures values in the referencing column must exist in the referenced table's key column, preventing orphaned rows that point to nothing." },
      { id: "bi-09", q: "What is a defining characteristic of a document database like MongoDB, compared to a relational database?",
        options: ["It requires a fixed schema for every document, identical to a SQL table", "It stores flexible, often nested JSON-like documents, without requiring a single fixed schema across all documents in a collection", "It cannot store nested/hierarchical data", "It doesn't support indexes"],
        correct: 1, explain: "Document databases store self-contained, often nested documents and don't require every document in a collection to share an identical rigid schema, unlike a SQL table's fixed columns." },
      { id: "bi-10", q: "Which SOLID principle states that a class should have only one reason to change?",
        options: ["Open/Closed Principle", "Single Responsibility Principle", "Liskov Substitution Principle", "Dependency Inversion Principle"],
        correct: 1, explain: "Single Responsibility says a class should be focused on one job/concern — mixing unrelated responsibilities makes a class change (and break) for multiple unrelated reasons." },
      { id: "bi-11", q: "What is the primary purpose of a load balancer in a system design?",
        options: ["To permanently store application data", "To distribute incoming traffic across multiple servers, improving availability and preventing any single server from being overwhelmed", "To compress images before serving them", "To handle DNS resolution only"],
        correct: 1, explain: "A load balancer sits in front of multiple backend instances and spreads requests across them, so no single server becomes a bottleneck or single point of failure." },
      { id: "bi-12", q: "What is a common purpose of a message queue (e.g. Kafka, RabbitMQ) in a microservices architecture?",
        options: ["To render the frontend UI", "To decouple services by letting one service publish events/messages that other services consume asynchronously, without a direct synchronous call", "To replace all databases", "To manage user authentication only"],
        correct: 1, explain: "A queue lets a producer service fire-and-forget a message while consumers process it independently and asynchronously, reducing coupling and improving resilience if a consumer is temporarily down." },
      { id: "bi-13", q: "What is the main difference between a Docker image and a Docker container?",
        options: ["They are the same thing with different names", "An image is a read-only template/blueprint; a container is a running (or stopped) instance created from that image", "A container can only run once and then must be rebuilt", "An image only exists on remote registries, never locally"],
        correct: 1, explain: "The image is the static packaged artifact (filesystem + config); a container is a live, running instance of that image, and you can spin up many containers from one image." },
      { id: "bi-14", q: "What is the main goal of a Continuous Integration (CI) pipeline?",
        options: ["To manually deploy code once a year", "To automatically build and test code changes frequently (e.g. on every push), catching integration issues early", "To replace version control entirely", "To write code automatically without developer input"],
        correct: 1, explain: "CI automates building and running tests every time code changes are pushed, so integration problems and regressions surface quickly instead of piling up until a big manual release." },
      { id: "bi-15", q: "In cloud computing, what does “IAM” (Identity and Access Management) primarily control?",
        options: ["The physical location of data centers", "Who (which users/services) can access which resources, and what actions they're allowed to perform", "The pricing tier of a virtual machine", "Network bandwidth allocation only"],
        correct: 1, explain: "IAM defines identities (users, roles, service accounts) and policies specifying exactly which resources and actions each identity is permitted to touch — the backbone of cloud security." },
      { id: "bi-16", q: "In Kubernetes, what is a “Pod”?",
        options: ["A physical server in the cluster", "The smallest deployable unit, typically wrapping one or more tightly coupled containers that share network/storage", "A configuration file format", "A type of load balancer"],
        correct: 1, explain: "A Pod is Kubernetes' smallest deployable unit — usually one container (sometimes a few tightly coupled ones) sharing the same network namespace and storage volumes." },
      { id: "bi-17", q: "In observability, what is the key difference between a “metric” and a “log”?",
        options: ["They are identical concepts with different names", "A metric is typically a numeric, aggregable measurement over time (e.g. request count); a log is a discrete, timestamped event record with contextual detail", "Logs can only be viewed by machines, never humans", "Metrics can only be collected once per day"],
        correct: 1, explain: "Metrics are numeric time-series good for trends/alerting (e.g. CPU %, error rate); logs are detailed individual event records useful for understanding exactly what happened during a specific incident." }
    ],

    "Mobile": [
      { id: "mob-01", q: "Why is a “safe area” an important concept in modern mobile UI design?",
        options: ["It refers to app permissions only", "It marks the region of the screen not obscured by notches, camera cutouts, or system bars, so content stays visible and untouched", "It's a security sandbox for app data", "It only matters for Android, never iOS"],
        correct: 1, explain: "Devices with notches, rounded corners, or home indicators need UI kept within the “safe area” so critical content and touch targets aren't clipped or hidden." },
      { id: "mob-02", q: "In Flutter, what is a “widget”?",
        options: ["A native Android-only UI component", "The basic building block of the UI — everything from layout to styling to app structure is expressed as a widget", "A backend API endpoint", "A database migration script"],
        correct: 1, explain: "Flutter's entire UI (and much of its structure) is composed of widgets, nested in a tree — from a single Text element up to the whole app." },
      { id: "mob-03", q: "What language is used to write Flutter apps?",
        options: ["Kotlin", "Swift", "Dart", "JavaScript"],
        correct: 2, explain: "Flutter apps are written in Dart, compiled to native code for each target platform (Android, iOS, web, desktop)." },
      { id: "mob-04", q: "What is the main value proposition of React Native for mobile development?",
        options: ["It only builds web apps, not mobile apps", "It lets developers write one codebase in React/JavaScript that compiles to native iOS and Android apps", "It replaces the need for any native code ever, with zero exceptions", "It is a design tool, not a development framework"],
        correct: 1, explain: "React Native lets teams reuse React knowledge and a largely shared codebase to target both iOS and Android, though native modules are still sometimes needed for platform-specific features." },
      { id: "mob-05", q: "In modern Android development, what is Jetpack Compose?",
        options: ["A build automation tool like Gradle", "A modern declarative UI toolkit for building native Android UI in Kotlin", "A cloud backend service", "An IDE, replacing Android Studio"],
        correct: 1, explain: "Jetpack Compose lets Android developers describe UI declaratively in Kotlin functions, rather than the older imperative XML-layout + View system." },
      { id: "mob-06", q: "What is SwiftUI primarily used for?",
        options: ["Managing iOS app backend infrastructure", "Declaratively building user interfaces for Apple platforms (iOS, macOS, etc.) in Swift", "Writing Android apps in Swift", "Database schema migrations"],
        correct: 1, explain: "SwiftUI is Apple's declarative UI framework, letting developers describe what the interface should look like for a given state, similar in spirit to Compose or React." },
      { id: "mob-07", q: "Why do mobile apps commonly implement “offline-first” data handling?",
        options: ["To reduce the app's install size only", "So the app remains usable (reading/writing local data) even without a network connection, syncing later when connectivity returns", "Because app stores require it for all apps", "To disable all network features permanently"],
        correct: 1, explain: "Mobile connectivity is often unreliable, so offline-first apps keep a local data copy the user can interact with immediately, syncing changes back once a connection is available." },
      { id: "mob-08", q: "What kind of database is Firebase's Firestore?",
        options: ["A traditional relational SQL database", "A NoSQL, document-based cloud database with real-time sync capabilities", "A local-only database with no cloud component", "A graph database"],
        correct: 1, explain: "Firestore stores data as documents grouped into collections (NoSQL), and can push real-time updates to connected clients when data changes." },
      { id: "mob-09", q: "What is the general purpose of a “staged rollout” when releasing a mobile app update?",
        options: ["To release the update to every user simultaneously", "To release the update to a small percentage of users first, monitoring for crashes/issues before expanding to everyone", "To delay the release indefinitely", "To only release on weekends"],
        correct: 1, explain: "A staged rollout limits the blast radius of a bad release — if crash rates spike after reaching a small percentage of users, the team can halt or roll back before it reaches everyone." },
      { id: "mob-10", q: "Which navigation pattern is most associated with switching between a small number of top-level sections in a mobile app?",
        options: ["A modal alert", "A bottom tab bar", "A single infinite-scroll list", "A context menu"],
        correct: 1, explain: "A bottom tab bar gives persistent, one-tap access to a handful of top-level destinations (e.g. Home, Search, Profile), the standard pattern for primary app navigation." },
      { id: "mob-11", q: "In React Native, how does styling generally differ from web CSS?",
        options: ["It is identical CSS, byte for byte", "Styles are written as JavaScript objects (often via StyleSheet.create), with a subset of CSS-like properties, not linked .css files", "React Native apps cannot be styled at all", "Only inline HTML style attributes are supported"],
        correct: 1, explain: "React Native styling uses JS objects with camelCase property names (similar to CSS but not identical), commonly organized with StyleSheet.create rather than external stylesheets." },
      { id: "mob-12", q: "What is the Android “Activity Lifecycle” concerned with?",
        options: ["How long an app takes to compile", "The sequence of states (created, started, resumed, paused, stopped, destroyed) an Activity moves through as the user navigates and the system manages resources", "Only how the app icon appears on the home screen", "Database transaction states"],
        correct: 1, explain: "The lifecycle callbacks tell the app when it's coming to the foreground, going to the background, or being torn down, so it can manage resources correctly." },
      { id: "mob-13", q: "What does Firebase Authentication primarily provide out of the box?",
        options: ["A complete backend database replacement for all data", "Ready-made sign-in flows (email/password, Google, phone, etc.) and user identity management, without building auth servers from scratch", "Push notification delivery only", "App Store submission automation"],
        correct: 1, explain: "Firebase Auth handles common sign-in methods and session/token management for you, so teams don't need to build and secure their own authentication backend from zero." },
      { id: "mob-14", q: "What's a common risk of storing sensitive data like auth tokens in plain local storage on a mobile device?",
        options: ["There is no risk, local storage is always encrypted by default on every platform", "On a compromised or rooted/jailbroken device, unencrypted local storage can be read by other processes or an attacker, exposing the data", "It slows down the app's build time", "It prevents the app from working offline"],
        correct: 1, explain: "Plain local storage isn't guaranteed to be encrypted at rest — sensitive values like tokens should go through a platform's secure storage (Keychain/Keystore) built to resist this kind of access." },
      { id: "mob-15", q: "Why do app stores require developers to digitally sign their app builds?",
        options: ["Signing is optional and rarely enforced", "To verify the app's authenticity and that it hasn't been tampered with since the developer built it", "Signing only affects the app icon", "To automatically translate the app into other languages"],
        correct: 1, explain: "A valid signature proves the build genuinely came from the developer's certificate and wasn't modified afterward, which is how stores (and the OS) establish trust in an installed app." }
    ],

    "Data & Analytics": [
      { id: "da-01", q: "In Python, what does `len([1, 2, [3, 4], 5])` return?",
        options: ["5", "4", "3", "An error"],
        correct: 1, explain: "len() on a list counts top-level elements only — the nested list [3, 4] counts as a single element, giving 4 total items." },
      { id: "da-02", q: "What is a Python list comprehension like `[x*2 for x in range(5) if x % 2 == 0]` used for?",
        options: ["It's invalid Python syntax", "A concise way to build a new list by transforming and filtering elements from an iterable in one line", "It only works on strings", "It sorts a list in place"],
        correct: 1, explain: "List comprehensions combine a transform (x*2) and an optional filter (if x % 2 == 0) into one compact expression that produces a new list." },
      { id: "da-03", q: "In Excel/Sheets, what does the VLOOKUP (or XLOOKUP) function primarily do?",
        options: ["Sums a range of numeric cells", "Searches for a value in one column/range and returns a corresponding value from another column in the same row", "Formats cells conditionally based on color", "Deletes duplicate rows automatically"],
        correct: 1, explain: "VLOOKUP/XLOOKUP look up a key value and pull back a related value from the same matched row in another column — the core tool for joining data across columns or sheets." },
      { id: "da-04", q: "What does a p-value of 0.03 typically suggest, at a common significance threshold of 0.05?",
        options: ["There is a 3% chance the null hypothesis is true", "The observed result would be unlikely (3% probability) under the null hypothesis, so it's often considered statistically significant at the 0.05 threshold", "The experiment definitely proves the alternative hypothesis", "The sample size was too small to matter"],
        correct: 1, explain: "A p-value is the probability of seeing a result this extreme (or more) if the null hypothesis were true — 0.03 is below the common 0.05 threshold, conventionally called statistically significant." },
      { id: "da-05", q: "What does “correlation does not imply causation” mean?",
        options: ["Two variables can never be correlated", "Two variables moving together statistically doesn't prove that one causes the other — a third factor or coincidence could explain it", "Correlation always implies causation in large datasets", "It only applies to categorical data"],
        correct: 1, explain: "A statistical association could arise from X causing Y, Y causing X, a shared underlying cause, or pure coincidence — correlation alone can't distinguish between these." },
      { id: "da-06", q: "In pandas, what does `df.groupby('col').mean()` do?",
        options: ["Removes the 'col' column from the dataframe", "Splits the dataframe into groups by unique values in 'col', then computes the mean of the other numeric columns per group", "Sorts the dataframe by 'col' without aggregating", "Deletes all rows where 'col' is missing"],
        correct: 1, explain: "groupby splits the data into buckets by the grouping column's values, and .mean() aggregates each bucket's numeric columns down to one average per group." },
      { id: "da-07", q: "When a dataset has missing values in a numeric column, which is generally NOT a valid handling strategy on its own?",
        options: ["Dropping rows with missing values", "Imputing with the mean/median of the column", "Ignoring the problem and assuming missing values are automatically treated as zero by every tool", "Flagging missingness with an indicator column and imputing"],
        correct: 2, explain: "Different tools/libraries handle missing values very differently — assuming a universal silent-zero behaviour is a common and dangerous mistake; missingness needs an explicit decision." },
      { id: "da-08", q: "Which chart type is generally best suited for showing the trend of a single numeric variable over time?",
        options: ["Pie chart", "Line chart", "Scatter plot with no time axis", "Stacked bar chart with categories unrelated to time"],
        correct: 1, explain: "A line chart's continuous connected points make it the natural fit for visualizing how a value changes across an ordered sequence like time." },
      { id: "da-09", q: "In Power BI or Tableau, what is the main purpose of building a “data model” before creating dashboards?",
        options: ["To physically move data to a different country for compliance", "To define relationships between tables (and calculated fields) so visuals can correctly join and aggregate data across sources", "Data models are purely cosmetic and don't affect dashboard accuracy", "To convert all data into images"],
        correct: 1, explain: "A well-defined data model tells the tool how tables relate (e.g. orders to customers), which is what allows dashboards to correctly slice and aggregate data pulled from multiple tables." },
      { id: "da-10", q: "What distinguishes good data storytelling from simply presenting a chart?",
        options: ["Data storytelling avoids using any charts", "It frames the data around a clear insight and recommendation for the audience, not just a raw visualization", "It requires removing all numbers from the presentation", "It's identical to a raw data dump"],
        correct: 1, explain: "A chart alone shows what happened; storytelling adds the “so what” — surfacing the insight and a recommended action so the audience can decide, not just observe." },
      { id: "da-11", q: "In an A/B test, what is a “guardrail metric” used for?",
        options: ["To measure the primary metric the experiment is trying to improve", "To monitor that the test isn't causing harm to another important metric, even if the primary metric improves", "To determine the test's sample size", "It's another name for the p-value"],
        correct: 1, explain: "A guardrail metric (e.g. page load time, unsubscribe rate) is watched alongside the primary success metric to catch unintended negative side effects, even when the main metric looks like a win." },
      { id: "da-12", q: "Why does an A/B test need a sufficiently large sample size before drawing conclusions?",
        options: ["Larger samples are only needed for legal reasons", "Small samples make it hard to distinguish a real effect from random noise, risking false conclusions", "Sample size has no effect on test reliability", "It's only relevant for tests involving money"],
        correct: 1, explain: "Statistical power depends on sample size — too few observations and random variation can easily masquerade as (or hide) a real effect, leading to unreliable conclusions." },
      { id: "da-13", q: "What is the general purpose of an ETL (Extract, Transform, Load) pipeline?",
        options: ["To design the frontend UI of a dashboard", "To pull data from source systems, clean/reshape it, and load it into a destination like a data warehouse on a repeatable schedule", "To train machine learning models", "To manage user permissions"],
        correct: 1, explain: "ETL is the standard pattern for reliably moving and reshaping data from operational systems into an analytics-ready destination, usually run on an automated schedule." },
      { id: "da-14", q: "Why might a team use a distributed processing framework like Spark instead of pandas for a dataset?",
        options: ["Spark is always faster regardless of data size", "When data is too large to fit in a single machine's memory, Spark can distribute processing across a cluster of machines", "Spark only works with images, not tabular data", "pandas cannot read CSV files"],
        correct: 1, explain: "pandas operates in a single machine's memory, which becomes a hard limit at large scale; Spark partitions data and computation across many machines, handling datasets far larger than one machine could hold." },
      { id: "da-15", q: "What does a “pivot table” let you do with raw tabular data?",
        options: ["Permanently delete rows that don't meet a condition", "Interactively summarize/aggregate and reshape data (e.g. sums by category) without writing formulas for every combination", "Convert the spreadsheet into a PDF", "Encrypt the underlying data"],
        correct: 1, explain: "A pivot table lets you drag fields into rows/columns/values to instantly recompute aggregates (sums, counts, averages) across different groupings, without hand-writing a formula per combination." },
      { id: "da-16", q: "What does “standard deviation” measure about a dataset?",
        options: ["The average value of the dataset", "The spread/dispersion of values around the mean", "The total count of data points", "The correlation between two variables"],
        correct: 1, explain: "Standard deviation quantifies how much individual data points typically deviate from the mean — low means data clusters tightly, high means it's spread out." }
    ],

    "AI & ML": [
      { id: "ai-01", q: "What defines “supervised learning” as opposed to unsupervised learning?",
        options: ["The model trains on labeled data, learning to map inputs to known correct outputs", "The model requires no data at all", "The model only works on images", "Supervised learning never uses numeric data"],
        correct: 0, explain: "Supervised learning trains on input-output pairs where the correct answer (label) is already known, so the model learns to predict that label for new inputs." },
      { id: "ai-02", q: "What is “overfitting” in a machine learning model?",
        options: ["The model performs equally well on training and unseen data", "The model learns the training data too closely, including its noise, and performs poorly on new, unseen data", "The model is too simple to capture patterns in the data", "Overfitting only happens with linear regression"],
        correct: 1, explain: "An overfit model has essentially memorized the training set's quirks rather than learning generalizable patterns, so it performs well on seen data but poorly on new data." },
      { id: "ai-03", q: "What is the goal of a clustering algorithm like K-means?",
        options: ["To predict a labeled numeric target value", "To group similar data points together based on their features, without using predefined labels", "To reduce the number of features in a dataset to exactly one", "To classify text sentiment specifically"],
        correct: 1, explain: "Clustering is unsupervised — it finds natural groupings in unlabeled data based on similarity, rather than predicting a target that was already labeled." },
      { id: "ai-04", q: "What is “feature scaling” (e.g. normalization/standardization) typically used for before training a model?",
        options: ["To reduce the number of rows in a dataset", "To bring features with different ranges/units onto a comparable scale, which many algorithms are sensitive to", "To remove all categorical variables", "It's purely cosmetic and has no effect on model training"],
        correct: 1, explain: "Features on very different scales can dominate distance calculations or destabilize gradient-based optimization unless scaled to comparable ranges." },
      { id: "ai-05", q: "What is “data leakage” in a machine learning pipeline?",
        options: ["A physical hardware failure during training", "When information from outside the training data (often from the future or the test set) improperly influences the model, making it look more accurate than it really is", "A synonym for missing values", "When a model is deployed to production"],
        correct: 1, explain: "Leakage happens when the model has indirect access to information it wouldn't have at real prediction time — inflating validation scores while hiding that the model won't generalize." },
      { id: "ai-06", q: "In a classification problem, what does “recall” measure?",
        options: ["The proportion of predicted positives that were actually positive", "The proportion of actual positives that the model correctly identified", "The overall accuracy of the model", "The model's training time"],
        correct: 1, explain: "Recall = true positives / (true positives + false negatives) — it answers “of all the actual positive cases, how many did we catch?”, distinct from precision." },
      { id: "ai-07", q: "Why is cross-validation used instead of a single train/test split?",
        options: ["It trains the model faster", "It gives a more reliable estimate of model performance by testing across multiple different train/test partitions, reducing the risk of a lucky/unlucky single split", "It eliminates the need for any test data", "It only applies to deep learning models"],
        correct: 1, explain: "A single split's performance estimate can be noisy depending on which rows happen to land in train vs. test; averaging across multiple folds gives a more stable estimate." },
      { id: "ai-08", q: "What is “backpropagation” used for in training a neural network?",
        options: ["To collect training data automatically", "To compute how much each weight contributed to the error, so weights can be updated to reduce that error", "To visualize the network's architecture", "To deploy the trained model to production"],
        correct: 1, explain: "Backpropagation applies the chain rule to efficiently compute the gradient of the loss with respect to every weight, which gradient descent then uses to update those weights." },
      { id: "ai-09", q: "What is the purpose of “tokenization” in NLP?",
        options: ["To encrypt text data", "To split raw text into smaller units (words, subwords, or characters) that a model can process", "To translate text between languages", "To remove all punctuation permanently with no other effect"],
        correct: 1, explain: "Models don't operate on raw strings — tokenization breaks text into discrete units (tokens) that get mapped to numeric IDs/embeddings the model can compute with." },
      { id: "ai-10", q: "In computer vision, what is a Convolutional Neural Network (CNN) particularly well-suited for?",
        options: ["Processing purely tabular/spreadsheet data", "Detecting spatial patterns (edges, textures, shapes) in image data through learned filters applied across the image", "Only generating random noise", "Sorting text alphabetically"],
        correct: 1, explain: "CNNs use convolutional filters that slide across an image, learning to detect spatially local patterns like edges and textures, which compose into higher-level features." },
      { id: "ai-11", q: "What does “RAG” (Retrieval-Augmented Generation) add to a large language model's workflow?",
        options: ["It fine-tunes the model's weights permanently on new data", "It retrieves relevant external documents/context at query time and feeds them into the model's prompt, grounding its answer in that retrieved information", "It removes the need for any prompt at all", "It compresses the model to run on smaller hardware"],
        correct: 1, explain: "RAG looks up relevant information from an external source and includes it in the context given to the model, letting it answer using information it wasn't necessarily trained on." },
      { id: "ai-12", q: "What is “prompt injection” a risk of, when building LLM-powered applications?",
        options: ["The model running out of GPU memory", "Untrusted input manipulating the model into ignoring its original instructions or performing unintended actions", "The model refusing to answer any question", "A bug in the tokenizer only"],
        correct: 1, explain: "If untrusted text is fed into the model's context, it can contain instructions designed to override the app's intended behaviour — a key security concern for LLM applications." },
      { id: "ai-13", q: "What is the purpose of “model versioning” in an MLOps workflow?",
        options: ["It's purely for aesthetic labeling of models", "To track which exact model artifact (with its training data, code, and parameters) is deployed, enabling reproducibility and safe rollback", "To automatically improve model accuracy", "It replaces the need for monitoring in production"],
        correct: 1, explain: "As models get retrained and redeployed over time, versioning lets a team know exactly which model produced which predictions, and roll back quickly if a new version underperforms." },
      { id: "ai-14", q: "Why is checking a model for bias across demographic groups an important part of responsible AI practice?",
        options: ["Bias checking is only a legal formality with no real impact", "A model trained on skewed or unrepresentative data can systematically produce worse or unfair outcomes for certain groups, even without explicit intent", "All models are automatically unbiased by design", "Bias only matters for image models, never text or tabular models"],
        correct: 1, explain: "Models learn patterns present in their training data — if that data reflects historical or sampling biases, the model can reproduce or amplify unfair outcomes, regardless of the developer's intent." },
      { id: "ai-15", q: "What is the “bias-variance tradeoff” in machine learning?",
        options: ["A tradeoff between training speed and inference speed", "The balance between a model being too simple to capture patterns (high bias/underfitting) and too complex, fitting noise (high variance/overfitting)", "It only applies to unsupervised learning", "It refers to hardware bias in GPUs"],
        correct: 1, explain: "A model too simple underfits (high bias, misses real patterns); a model too complex overfits (high variance, fits noise) — good model selection balances the two for the best generalization." }
    ],

    "Security": [
      { id: "sec-01", q: "What does the “CIA triad” in security stand for?",
        options: ["Confidentiality, Integrity, Availability", "Central Intelligence, Authorization, Auditing", "Cryptography, Identity, Access", "Compliance, Isolation, Authentication"],
        correct: 0, explain: "The CIA triad is the foundational security model — Confidentiality, Integrity, and Availability." },
      { id: "sec-02", q: "What is the primary function of a firewall?",
        options: ["To encrypt all data stored on a disk", "To filter network traffic based on defined rules, allowing or blocking connections", "To automatically patch software vulnerabilities", "To compress network packets for speed"],
        correct: 1, explain: "A firewall inspects traffic against a rule set (by port, protocol, IP, etc.) and permits or denies it accordingly — a core perimeter control, not an encryption or patching tool." },
      { id: "sec-03", q: "What does a VPN (Virtual Private Network) primarily provide?",
        options: ["Faster internet speeds in all cases", "An encrypted tunnel for traffic between a device and a remote network, protecting data in transit and often masking the origin", "Permanent protection against all malware", "Free unlimited bandwidth"],
        correct: 1, explain: "A VPN encrypts traffic between the client and the VPN endpoint, protecting data from eavesdropping on untrusted networks and masking the client's apparent origin." },
      { id: "sec-04", q: "What is the key difference between symmetric and asymmetric encryption?",
        options: ["Symmetric uses one shared key for both encryption and decryption; asymmetric uses a public/private key pair", "They are functionally identical", "Asymmetric encryption is always faster than symmetric", "Symmetric encryption cannot be broken"],
        correct: 0, explain: "Symmetric encryption uses the same secret key on both ends; asymmetric uses a mathematically linked public/private key pair, so the public key can be shared openly while only the private key decrypts." },
      { id: "sec-05", q: "What is the purpose of TLS (Transport Layer Security) in HTTPS?",
        options: ["To physically secure a data center", "To encrypt and authenticate data exchanged between a client and server over a network, preventing eavesdropping and tampering", "To compress webpages for faster loading only", "To manage DNS records"],
        correct: 1, explain: "TLS establishes an encrypted, authenticated channel between client and server — what upgrades plain HTTP to HTTPS and protects data like passwords from being read or altered in transit." },
      { id: "sec-06", q: "What is a SQL injection attack?",
        options: ["A denial-of-service attack that floods a server with requests", "An attack where malicious input is crafted to manipulate a database query, potentially exposing or altering data the attacker shouldn't access", "A physical attack on database server hardware", "A method of encrypting stored data"],
        correct: 1, explain: "If user input is concatenated directly into a SQL query instead of being parameterized, an attacker can inject SQL syntax that changes the query's logic — fixed by parameterized queries." },
      { id: "sec-07", q: "What does XSS (Cross-Site Scripting) allow an attacker to do?",
        options: ["Steal the physical server's hard drive", "Inject malicious scripts into a webpage viewed by other users, which then run in their browser session", "Only affects the attacker's own browser, never other users", "Bypass firewall rules directly"],
        correct: 1, explain: "XSS occurs when unsanitized user input is rendered as executable script in another user's browser, letting the attacker run code in that victim's context." },
      { id: "sec-08", q: "What is the primary purpose of a tool like Nmap in a penetration test?",
        options: ["To automatically fix vulnerabilities it finds", "To scan a network/host and discover open ports, running services, and other reconnaissance information", "To encrypt network traffic", "To generate phishing emails"],
        correct: 1, explain: "Nmap is a network scanning/reconnaissance tool — it maps out what's reachable and what services are listening, forming the recon phase before deeper testing." },
      { id: "sec-09", q: "What is the main deliverable at the end of a VAPT (Vulnerability Assessment and Penetration Testing) engagement?",
        options: ["A list of the target's employee names", "A report detailing discovered vulnerabilities, their severity/risk, evidence, and remediation recommendations", "A guarantee that the system can never be breached again", "Root access credentials handed to the client"],
        correct: 1, explain: "The point of a VAPT engagement is a clear, actionable report the client's team can use to prioritize and fix real weaknesses — not a guarantee, which no assessment can honestly offer." },
      { id: "sec-10", q: "What is the primary role of a SIEM (Security Information and Event Management) system?",
        options: ["To physically block network intrusions in real time like a firewall", "To aggregate and correlate logs/events from across an organization's systems, helping analysts detect and investigate suspicious activity", "To write application code", "To manage employee payroll"],
        correct: 1, explain: "A SIEM centralizes log/event data from many sources and applies correlation rules to surface suspicious patterns, giving SOC analysts one place to detect and investigate incidents." },
      { id: "sec-11", q: "In digital forensics, why is it critical to preserve a proper “chain of custody” for evidence?",
        options: ["It's just a paperwork formality with no practical impact", "It documents who handled evidence and when, so its integrity can be trusted and it remains admissible/credible later", "It only matters for physical evidence, never digital", "It speeds up data recovery"],
        correct: 1, explain: "Without a documented chain of custody, there's no way to prove evidence wasn't altered between collection and use — undermining its credibility in any later investigation." },
      { id: "sec-12", q: "What does GDPR primarily regulate?",
        options: ["Software licensing fees", "How organizations collect, process, and protect the personal data of individuals, particularly in the EU", "Only cybersecurity for government agencies", "International shipping of physical hardware"],
        correct: 1, explain: "GDPR is a data-protection regulation governing how personal data of individuals is collected, processed, stored, and protected, with significant obligations for organizations handling EU residents' data." },
      { id: "sec-13", q: "What is “defense in depth” as a security strategy?",
        options: ["Relying on a single very strong security control", "Layering multiple independent security controls, so if one fails, others still provide protection", "A strategy used only for physical building security", "Avoiding all security controls to reduce complexity"],
        correct: 1, explain: "Defense in depth assumes any single control can fail or be bypassed, so it stacks multiple layers so a single point of failure doesn't mean total compromise." },
      { id: "sec-14", q: "What does an Intrusion Detection System (IDS) do, as opposed to an Intrusion Prevention System (IPS)?",
        options: ["An IDS actively blocks malicious traffic; an IPS only logs it", "An IDS monitors and alerts on suspicious activity without necessarily blocking it; an IPS can actively block/prevent it in real time", "They are the exact same technology with different names", "Neither can detect network-based attacks"],
        correct: 1, explain: "An IDS is typically passive — it observes traffic and raises alerts; an IPS sits inline and can actively drop or block traffic it identifies as malicious." },
      { id: "sec-15", q: "What is the general principle behind “least privilege” in application security?",
        options: ["Giving every user and process full administrative access by default for convenience", "Granting users and processes only the minimum access necessary to perform their function, nothing more", "It only applies to database administrators", "Removing all access controls to simplify the system"],
        correct: 1, explain: "Least privilege limits the damage any single compromised account or process can do, by ensuring it never has more access than its actual job requires." }
    ],

    "Design": [
      { id: "des-01", q: "What does “visual hierarchy” in design refer to?",
        options: ["The order in which layers appear in a file", "Arranging elements (size, color, contrast, placement) so the viewer's attention is guided to what matters most, in the intended order", "A strict grid that must never be broken", "The folder structure of design files"],
        correct: 1, explain: "Visual hierarchy uses size, weight, color, and spacing to signal importance, so a viewer's eye naturally lands on the most important content first." },
      { id: "des-02", q: "Why is sufficient color contrast between text and background important?",
        options: ["It's only an aesthetic preference with no functional impact", "Low contrast can make text difficult or impossible to read for many users, including those with low vision — accessibility guidelines set minimum ratios for this reason", "Contrast only matters for print, not screens", "High contrast always looks unprofessional"],
        correct: 1, explain: "Insufficient contrast is a real accessibility barrier, not just a stylistic nitpick — WCAG defines minimum contrast ratios specifically because poor contrast excludes users with low vision." },
      { id: "des-03", q: "In Figma, what is the purpose of a “component” (and its instances)?",
        options: ["A component can only be used once per file", "A reusable, master UI element — instances automatically inherit updates made to the main component, keeping designs consistent", "It only affects the file's export settings", "Components cannot contain variants"],
        correct: 1, explain: "Editing a main component propagates that change to every instance placed throughout the file — exactly what keeps a large design file consistent." },
      { id: "des-04", q: "What does “auto-layout” in Figma do to a frame?",
        options: ["It automatically generates random colors", "It makes the frame resize and reflow its children automatically based on content and spacing rules, similar to flexbox", "It permanently locks the frame from being edited", "It converts the design to code automatically"],
        correct: 1, explain: "Auto-layout applies flexbox-like rules (direction, spacing, padding, alignment) so a frame's children reflow automatically as content changes." },
      { id: "des-05", q: "What is the main purpose of a low-fidelity wireframe early in a design process?",
        options: ["To finalize exact colors and fonts for development", "To quickly explore layout, structure, and flow without getting distracted by visual polish", "To replace the need for any user testing", "To generate production-ready assets"],
        correct: 1, explain: "Low-fidelity wireframes deliberately strip out color/typography/imagery so the team can focus on layout, structure, and flow — polish comes later once structure is validated." },
      { id: "des-06", q: "What is the main goal of conducting user interviews during research?",
        options: ["To confirm the design team's existing assumptions without challenge", "To understand real users' needs, behaviours, and pain points directly from them, informing design decisions with evidence", "To generate marketing copy", "To skip the need for usability testing later"],
        correct: 1, explain: "Interviews are meant to surface real user context and problems the team might not have anticipated — treating them as a rubber stamp defeats their purpose." },
      { id: "des-07", q: "What does “JTBD” (Jobs to be Done) framing focus a team on?",
        options: ["The specific features a competitor has shipped", "The underlying task or “job” a user is trying to accomplish, rather than just the product/feature itself", "The internal org chart of the design team", "Only the visual style of the interface"],
        correct: 1, explain: "JTBD reframes the question from “what feature should we build” to “what outcome is the user actually trying to achieve,” often revealing more fundamental needs." },
      { id: "des-08", q: "What distinguishes an interactive prototype from a static mockup?",
        options: ["A prototype cannot include any visuals", "A prototype simulates flows and interactions (clicking, transitions) so users/stakeholders can experience the product's behaviour, not just its look", "They are the same thing", "Prototypes can only be built in code, never in design tools"],
        correct: 1, explain: "A static mockup shows one screen's appearance; a prototype links multiple screens/states together so someone can click through and feel how the product actually behaves." },
      { id: "des-09", q: "What is the main purpose of a design system's design tokens (e.g. color, spacing values)?",
        options: ["To store user account data", "To centralize core design decisions as reusable, named values, so changing one token updates it consistently everywhere it's used", "They are only relevant to backend engineers", "Tokens are a synonym for components"],
        correct: 1, explain: "Tokens abstract raw values into named references used throughout the system — updating the token in one place propagates the change everywhere it's referenced." },
      { id: "des-10", q: "What is the main purpose of a “usability test” with real users?",
        options: ["To measure server response times", "To observe real users attempting tasks with the product, uncovering where they struggle or get confused", "To replace the need for any design work", "To test the marketing message only"],
        correct: 1, explain: "Usability testing puts the actual interface in front of real users completing real tasks, surfacing friction points the design team might be too close to the product to notice." },
      { id: "des-11", q: "Why does UX writing generally favor clear, specific microcopy over vague or clever phrasing?",
        options: ["Clever phrasing always performs better regardless of context", "Clear, specific copy reduces user confusion at critical moments (errors, empty states, confirmations), where ambiguity has a real cost", "Microcopy has no measurable impact on user behaviour", "UX writing should always match marketing tone exactly"],
        correct: 1, explain: "In functional moments like an error message, a user needs to quickly understand what happened and what to do next — cleverness that obscures that information works against the interface's job." },
      { id: "des-12", q: "What typically makes a case study in a design portfolio compelling to reviewers?",
        options: ["Only the final polished screens, with no context", "Showing the problem, process, key decisions and trade-offs, and the outcome — not just the final visuals", "A long list of software the designer knows", "Case studies should avoid mentioning any failures or iterations"],
        correct: 1, explain: "Reviewers evaluate a designer's thinking, not just their visual output — a case study that shows problem framing and decisions demonstrates process, not just a pretty final screen." },
      { id: "des-13", q: "What is the purpose of “white space” (negative space) in a layout?",
        options: ["It's wasted, unusable area that should always be minimized", "It gives elements room to breathe, improves readability, and helps establish visual grouping and hierarchy", "It only matters in print design", "It has no relationship to how content is perceived"],
        correct: 1, explain: "Deliberate white space isn't wasted — it reduces visual clutter, groups related elements, and gives the eye places to rest, all of which improve how easily a layout is scanned." },
      { id: "des-14", q: "What is a “sitemap” typically used for in the early stages of a product's information architecture?",
        options: ["To define exact pixel measurements for each screen", "To map out the overall structure and relationships between pages/sections of a product, before detailed screen design begins", "To generate the final visual design", "It's identical to a wireframe"],
        correct: 1, explain: "A sitemap operates one level above individual screens — it shows how sections/pages relate and nest, giving structural clarity before wireframing individual screens." },
      { id: "des-15", q: "What is the purpose of “variants” for a component in Figma?",
        options: ["To create entirely unrelated, separate components", "To group different states/versions of the same component (e.g. a button's default, hover, disabled states) under one manageable, swappable set", "Variants only affect font size", "Variants disable auto-layout"],
        correct: 1, explain: "Variants let related states of one component (say, a button's default/hover/disabled looks) live together as a single swappable set, instead of scattering them as separate components." }
    ],

    "Product & Business": [
      { id: "pb-01", q: "What does having good “product sense” primarily involve?",
        options: ["Memorizing every feature of every competitor's product", "Judging what problems are worth solving for users and evaluating trade-offs in how to solve them, grounded in user and business context", "Only knowing how to use design tools", "Writing code for every feature personally"],
        correct: 1, explain: "Product sense is about judgment — reasoning through which problems matter, for whom, and what trade-offs a given solution makes." },
      { id: "pb-02", q: "What is the main purpose of a PRD (Product Requirements Document)?",
        options: ["To document the marketing budget only", "To clearly define the problem, scope, requirements, and acceptance criteria for a feature so engineering, design, and stakeholders align before building", "To replace the need for any design work", "It's only used after a feature ships, as a retrospective"],
        correct: 1, explain: "A PRD gets everyone aligned on what's being built, why, and what “done” looks like, before significant work starts — reducing costly misalignment mid-build." },
      { id: "pb-03", q: "In the RICE prioritization framework, what does the “R” stand for?",
        options: ["Revenue", "Reach", "Risk", "Resources"],
        correct: 1, explain: "RICE = Reach, Impact, Confidence, Effort — Reach estimates how many users/customers an initiative will affect within a set time period." },
      { id: "pb-04", q: "What is a “north star metric” meant to represent for a product team?",
        options: ["The exact revenue target for the current quarter only", "A single metric that best captures the core value the product delivers to users, guiding team focus and trade-off decisions", "A metric only the CEO is allowed to see", "The number of employees on the team"],
        correct: 1, explain: "A north star metric is chosen because it correlates closely with genuine user value delivered, giving the whole team a shared, focusing measure of success." },
      { id: "pb-05", q: "In product analytics, what does “retention” typically measure?",
        options: ["How many new users signed up on day one", "The proportion of users who continue to come back and use the product over a given period after signing up", "The total revenue generated", "The number of bugs reported"],
        correct: 1, explain: "Retention tracks whether users who joined keep coming back over time — a product can have strong signups but weak retention if users try it once and never return." },
      { id: "pb-06", q: "When a product manager needs to say “no” to a stakeholder's feature request, what generally makes that conversation land better?",
        options: ["Simply refusing without any explanation", "Explaining the reasoning — trade-offs, priorities, and evidence — behind the decision, not just the decision itself", "Avoiding the stakeholder entirely", "Agreeing to build everything requested to avoid conflict"],
        correct: 1, explain: "Stakeholders are far more likely to accept a “no” when they understand the reasoning behind it rather than receiving a bare refusal with no context." },
      { id: "pb-07", q: "What is the purpose of an “as-is” vs. “to-be” process diagram in business analysis?",
        options: ["They document the same process twice for redundancy", "“As-is” documents the current process as it actually works today; “to-be” documents the desired future process, making the gap between them explicit", "“As-is” is only used for software, “to-be” only for hardware", "They are unrelated to process improvement work"],
        correct: 1, explain: "Mapping the current state alongside the desired future state makes exactly what needs to change concrete and visible, rather than leaving “improve the process” vague." },
      { id: "pb-08", q: "What does a “go-to-market” (GTM) strategy primarily plan for?",
        options: ["Only the internal engineering roadmap", "How a product will be positioned, priced, and brought to its target customers at launch", "The company's annual financial audit", "Employee onboarding procedures"],
        correct: 1, explain: "A GTM strategy covers the commercial side of a launch — who the target customer is, how the product is positioned and priced, and through which channels it reaches them." },
      { id: "pb-09", q: "Why is deep domain knowledge (e.g. understanding fintech or healthcare regulations) valuable for a product manager in that industry?",
        options: ["It's irrelevant as long as general PM skills are strong", "It helps the PM correctly judge which solutions are actually feasible, compliant, and valuable within that industry's specific constraints", "Domain knowledge is only useful for engineers, not PMs", "It replaces the need for talking to users"],
        correct: 1, explain: "Industries like fintech or healthcare carry real regulatory and operational constraints — a PM without that context risks designing solutions that look reasonable but are impractical or non-compliant." },
      { id: "pb-10", q: "What does the “MoSCoW” prioritization method's categories (Must, Should, Could, Won't) help a team communicate?",
        options: ["The exact ship date for every feature", "The relative priority/necessity of requirements for a given release, distinguishing essential scope from nice-to-haves", "The technical architecture to use", "The team's org chart"],
        correct: 1, explain: "MoSCoW gives stakeholders a shared vocabulary for scope conversations, clearly separating what's essential (“Must”) from what's desirable but cuttable (“Could”/“Won't”)." },
      { id: "pb-11", q: "Why do well-written PRDs typically include explicit edge cases?",
        options: ["Edge cases are only relevant for QA, never product definition", "Unaddressed edge cases often surface as bugs or confusing UX after launch, so specifying expected behaviour upfront reduces rework", "Including edge cases makes the document unnecessarily long with no benefit", "Edge cases are the same as acceptance criteria"],
        correct: 1, explain: "If the PRD stays silent on edge cases, engineering has to guess — which often means the eventual behaviour is inconsistent or wrong, discovered only after the feature ships." },
      { id: "pb-12", q: "When evaluating whether an idea is “worth building,” which of these is the most complete framing?",
        options: ["Consider only whether it's technically possible to build", "Weigh whether it solves a real, sufficiently important user problem, whether it's feasible to build well, and whether it makes sense for the business", "Build it if a single stakeholder asks for it", "Only consider what competitors have already shipped"],
        correct: 1, explain: "A genuinely good product decision sits at the intersection of desirability, feasibility, and viability — optimizing for just one of the three misses the others." },
      { id: "pb-13", q: "What is a common risk of a product manager avoiding difficult conversations with stakeholders about scope or timelines?",
        options: ["There is no downside — avoiding conflict is always the safer choice", "Unaddressed misalignment tends to surface later as a bigger, more costly conflict (e.g. at launch, when expectations clearly aren't met)", "It has no effect on the project's outcome", "It only affects the PM's personal reputation, never the project"],
        correct: 1, explain: "Disagreements about scope and timelines don't disappear when avoided — they resurface later, usually at a worse moment, when there's less room to adjust." },
      { id: "pb-14", q: "What does a “funnel” analysis typically help a team understand?",
        options: ["The company's total headcount by department", "Where users drop off across a sequence of steps toward a goal (e.g. signup, activation, purchase)", "The physical location of servers", "The color palette of the product"],
        correct: 1, explain: "A funnel breaks a multi-step user journey into stages and measures conversion between each, pinpointing exactly which step loses the most users." },
      { id: "pb-15", q: "What is “positioning” in a go-to-market context?",
        options: ["The physical placement of products on a retail shelf only", "How a product is framed relative to alternatives, in the mind of the target customer — what it is, who it's for, and why it's different", "The internal reporting structure of the marketing team", "A synonym for pricing"],
        correct: 1, explain: "Positioning defines the specific place a product occupies in a customer's mind relative to alternatives — distinct from pricing, though the two work together in a GTM plan." }
    ],

    "Marketing": [
      { id: "mkt-01", q: "In the classic “4Ps” of marketing, what do the four Ps stand for?",
        options: ["Product, Price, Place, Promotion", "People, Process, Physical evidence, Profit", "Plan, Pitch, Pursue, Profit", "Product, Personality, Positioning, Platform"],
        correct: 0, explain: "The original 4Ps marketing mix — Product, Price, Place, Promotion — frame the core decisions in bringing an offering to a market." },
      { id: "mkt-02", q: "What generally makes a headline effective at capturing attention?",
        options: ["Being as long and detailed as possible", "Clearly communicating a specific benefit or hook relevant to the reader, quickly", "Using as much industry jargon as possible", "Headlines have no measurable effect on engagement"],
        correct: 1, explain: "A strong headline earns the next few seconds of attention by making a specific, relevant promise to the reader immediately." },
      { id: "mkt-03", q: "What is the general purpose of keyword research in SEO?",
        options: ["To randomly select words to hide in a webpage's HTML", "To identify what terms and phrases the target audience actually searches for, so content can be created/optimized to match that intent", "To determine a website's server hosting location", "It only matters for paid advertising, not organic search"],
        correct: 1, explain: "Keyword research grounds content strategy in real search demand and intent — writing content nobody searches for won't earn organic traffic, however well-crafted." },
      { id: "mkt-04", q: "What does “technical SEO” primarily focus on, as distinct from content/on-page SEO?",
        options: ["Writing blog articles", "A site's crawlability, indexability, site speed, and structural factors that affect how search engines can access and understand it", "Social media posting schedules", "Email subject lines"],
        correct: 1, explain: "Technical SEO deals with the infrastructure side — making sure search engines can actually crawl, render, and index the site efficiently, separate from content quality." },
      { id: "mkt-05", q: "What is the purpose of a content calendar in a content marketing strategy?",
        options: ["To track only the company's financial expenses", "To plan and schedule what content gets published, when, and across which channels, keeping output consistent and aligned with goals", "It's only used for internal HR purposes", "A content calendar replaces the need for any strategy"],
        correct: 1, explain: "A content calendar turns a strategy into an executable, consistent publishing plan across channels — without it, output tends to become reactive and inconsistent." },
      { id: "mkt-06", q: "In paid advertising (e.g. Google/Meta Ads), what does “ROAS” (Return on Ad Spend) measure?",
        options: ["The total number of ad impressions served", "The revenue generated for every unit of currency spent on advertising", "The number of employees in the marketing team", "The click-through rate only"],
        correct: 1, explain: "ROAS = revenue / ad spend — it directly measures whether the money spent on ads is generating a proportionally worthwhile return." },
      { id: "mkt-07", q: "Why do marketers commonly A/B test ad creatives before scaling a campaign's budget?",
        options: ["A/B testing is only relevant for website design, not advertising", "Different creatives can perform very differently, so testing at small scale identifies the stronger performer before committing a larger budget to it", "It has no measurable impact on campaign performance", "It's required by law in every ad platform"],
        correct: 1, explain: "Creative performance can vary widely even for the same offer and audience — testing at small scale before scaling spend avoids pouring a large budget behind an underperforming ad." },
      { id: "mkt-08", q: "What is the purpose of “segmentation” in email marketing?",
        options: ["To send the exact same message to every subscriber, regardless of their behaviour or interests", "To group subscribers by shared traits/behaviour so messaging can be more relevant and targeted to each group", "Segmentation only affects the email's visual template", "It's a spam-filtering technique used by inboxes, not marketers"],
        correct: 1, explain: "Segmented, relevant messaging consistently outperforms one-size-fits-all blasts — grouping subscribers by behaviour or interest lets marketers tailor content." },
      { id: "mkt-09", q: "In GA4 (Google Analytics 4), what does a “conversion” event typically represent?",
        options: ["Any single page load, regardless of user action", "A specific action a business considers valuable (e.g. a purchase, signup, or form submission) that's been explicitly marked as a conversion", "The total number of visitors to a site", "The bounce rate of a session"],
        correct: 1, explain: "A conversion isn't automatic — it's a specific event a business has designated as meaningful, letting analytics distinguish valuable actions from ordinary browsing." },
      { id: "mkt-10", q: "Why is scripting/planning generally recommended before shooting short-form video content?",
        options: ["Planning has no impact on the final content quality", "A clear script/outline helps ensure the video communicates its point concisely and hooks viewers quickly, which matters especially in short-form formats", "Scripts are only needed for long-form documentaries", "Editors never use scripts, only raw footage"],
        correct: 1, explain: "Short-form platforms reward content that hooks viewers in the first few seconds and stays tightly focused — planning the structure beforehand makes that far more achievable." },
      { id: "mkt-11", q: "What does “brand consistency across touchpoints” mean?",
        options: ["Using the exact same advertisement on every single channel with no adaptation", "Maintaining a recognizable, coherent voice, look, and message across every place a customer encounters the brand, even as formats differ", "It only applies to the company logo", "Consistency is unimportant as long as each individual piece looks good"],
        correct: 1, explain: "A brand's voice and identity should feel recognizably the same whether a customer sees an ad, a support email, or the product itself — even as the format naturally differs." },
      { id: "mkt-12", q: "What is a “marketing funnel” generally used to describe?",
        options: ["The org chart of a marketing department", "The stages a potential customer moves through, from initial awareness to eventual purchase/conversion", "A single advertisement's design layout", "The company's annual budget breakdown"],
        correct: 1, explain: "The funnel metaphor models how a broad audience narrows down as people move from first awareness, through consideration, to an eventual purchase decision." },
      { id: "mkt-13", q: "What is the purpose of a clear “call to action” (CTA) in marketing copy?",
        options: ["To summarize the entire product's feature list", "To explicitly tell the reader the specific next step to take (e.g. “Sign up free”), reducing ambiguity about what to do next", "CTAs are optional and rarely affect conversion", "A CTA should always be vague to avoid seeming pushy"],
        correct: 1, explain: "Even highly engaged readers often won't act unless told exactly what to do next — a specific, clear CTA removes that ambiguity and directly influences conversion rate." },
      { id: "mkt-14", q: "What does “attribution” attempt to determine in marketing analytics?",
        options: ["The exact identity of every individual visitor", "Which marketing touchpoint(s) should get credit for leading to a conversion, when a customer interacted with multiple channels beforehand", "The total server cost of running analytics", "The visual design quality of an ad"],
        correct: 1, explain: "Customers often interact with several channels before converting — attribution models try to fairly assign credit for that conversion across those touchpoints, shaping budget decisions." },
      { id: "mkt-15", q: "What is a “backlink,” and why does it matter for SEO?",
        options: ["A link from a page to itself", "A link from another website pointing to yours — search engines often treat quality backlinks as a signal of trust/authority", "A broken link that returns a 404 error", "An internal navigation link within the same site"],
        correct: 1, explain: "Search engines historically use backlinks as a trust signal — a link from a reputable external site pointing to yours suggests other sites vouch for your content." }
    ],

    "Electronics & Embedded": [
      { id: "emb-01", q: "In C, what does a pointer variable store?",
        options: ["The literal value of another variable", "The memory address of another variable", "A function's return type", "The size of the data type only"],
        correct: 1, explain: "A pointer holds a memory address — dereferencing it accesses the value stored at that address, useful for indirect access and dynamic memory management." },
      { id: "emb-02", q: "What is a common risk of manually managing memory with `malloc`/`free` in C?",
        options: ["There is no risk, C manages memory automatically", "Forgetting to `free` allocated memory causes a memory leak; using memory after freeing it causes undefined behaviour", "malloc always allocates too much memory", "free() automatically prevents all bugs"],
        correct: 1, explain: "Unlike garbage-collected languages, C requires the programmer to explicitly release memory — forgetting leaks memory over time, and use-after-free leads to undefined, often exploitable, behaviour." },
      { id: "emb-03", q: "What does a NAND logic gate output when both of its inputs are 1?",
        options: ["1", "0", "It depends on a third input", "It oscillates continuously"],
        correct: 1, explain: "NAND is NOT-AND — AND of two 1s is 1, and NAND inverts that result, giving 0." },
      { id: "emb-04", q: "What distinguishes a sequential logic circuit from a combinational logic circuit?",
        options: ["Sequential circuits have no inputs at all", "A sequential circuit's output depends on both current inputs and its stored past state (memory); a combinational circuit's output depends only on current inputs", "Combinational circuits always run faster", "There is no real difference between them"],
        correct: 1, explain: "Combinational circuits are purely a function of current inputs; sequential circuits also depend on stored state from before, which is what gives them memory." },
      { id: "emb-05", q: "What is the purpose of a GPIO (General Purpose Input/Output) pin on a microcontroller?",
        options: ["It's a dedicated pin only for power supply", "A configurable pin that can be set as either a digital input (reading a signal) or output (driving a signal), used to interface with external hardware", "It can only ever function as an output", "GPIO pins are exclusive to the UART protocol"],
        correct: 1, explain: "GPIO pins are software-configurable as either input or output, making them the general-purpose building block for reading sensors/buttons or driving LEDs/relays." },
      { id: "emb-06", q: "Why are interrupts useful in embedded systems programming?",
        options: ["They make the CPU run at a fixed clock speed", "They let the microcontroller respond immediately to an event (e.g. a button press or timer) without constantly polling for it in a busy loop", "Interrupts are only used for debugging, never in production firmware", "They disable all other code from running, permanently"],
        correct: 1, explain: "Instead of wasting CPU cycles constantly polling whether an event happened, an interrupt lets the hardware immediately jump execution to a handler the moment the event occurs." },
      { id: "emb-07", q: "Why is sensor calibration often necessary before trusting a sensor's readings?",
        options: ["Calibration is purely optional and never affects accuracy", "Raw sensor output often has offsets/scaling errors specific to that unit or environment, and calibration corrects readings against a known reference", "Calibration only applies to temperature sensors", "Calibration replaces the need for any signal conditioning"],
        correct: 1, explain: "Individual sensor units and environmental conditions introduce small errors/offsets — calibrating against a known reference value corrects for that." },
      { id: "emb-08", q: "What is a key architectural difference between an Arduino board and a Raspberry Pi?",
        options: ["They are functionally identical for every use case", "An Arduino typically runs simple firmware directly on a microcontroller with no OS; a Raspberry Pi runs a full operating system (like Linux) on a more powerful processor", "Raspberry Pi cannot run any code, only Arduino can", "Arduino boards always have more processing power than a Raspberry Pi"],
        correct: 1, explain: "Arduino boards run code directly on a microcontroller with no OS, well suited to simple, real-time hardware control; a Raspberry Pi runs a full OS on a more capable processor." },
      { id: "emb-09", q: "What does an RTOS (Real-Time Operating System) guarantee that a general-purpose OS typically doesn't?",
        options: ["Unlimited processing power", "Predictable, bounded response times for time-critical tasks, meeting hard or soft real-time deadlines", "It guarantees zero power consumption", "It eliminates the need for any scheduling"],
        correct: 1, explain: "General-purpose OSes optimize for overall throughput and fairness, which can introduce unpredictable delays; an RTOS is designed so critical tasks meet their timing deadlines predictably." },
      { id: "emb-10", q: "Why is MQTT commonly used as a communication protocol for IoT devices?",
        options: ["It requires the most bandwidth of any protocol, ensuring reliability", "It's a lightweight publish/subscribe protocol well suited to constrained devices and unreliable networks, common conditions in IoT deployments", "MQTT can only be used for video streaming", "It replaces the need for any network connection at all"],
        correct: 1, explain: "MQTT's small message overhead and simple publish/subscribe model make it well suited for battery/bandwidth-constrained IoT devices operating over intermittent networks." },
      { id: "emb-11", q: "What is the purpose of DRC (Design Rule Check) in PCB design software?",
        options: ["To automatically generate the schematic from nothing", "To verify the board layout against manufacturing constraints (trace spacing, widths, clearances, etc.) before sending it for fabrication", "To calculate the final cost of the board only", "DRC only checks spelling in component labels"],
        correct: 1, explain: "DRC catches physical layout violations — traces too close together, clearances too tight for the fabrication process — before the design is sent to a manufacturer." },
      { id: "emb-12", q: "What is MATLAB/Simulink commonly used for in engineering contexts?",
        options: ["Building mobile apps for app stores", "Numerical computation, modeling, and simulation of systems (e.g. signal processing, control systems) before physical implementation", "Managing a company's payroll system", "Writing web page HTML/CSS"],
        correct: 1, explain: "MATLAB/Simulink are widely used in core/electrical engineering to mathematically model, simulate, and analyze system behaviour before committing to physical hardware." },
      { id: "emb-13", q: "What does the C keyword `static` do when applied to a local variable inside a function?",
        options: ["It makes the variable's value reset to its initial value every time the function is called", "The variable retains its value between function calls instead of being reinitialized each time", "It converts the variable into a global variable accessible everywhere", "It has no effect inside functions"],
        correct: 1, explain: "A static local variable is allocated once and persists its value across multiple calls to the function, unlike an ordinary local variable which is re-created fresh each call." },
      { id: "emb-14", q: "What is the purpose of a multiplexer (MUX) in digital logic?",
        options: ["To generate a clock signal", "To select one of several input signals and route it to a single output, based on selector/control lines", "To store data permanently", "To convert analog signals to digital"],
        correct: 1, explain: "A multiplexer acts like a digitally controlled switch — its select lines determine which one of multiple inputs gets passed through to the single output line." },
      { id: "emb-15", q: "What is the difference between an analog and a digital sensor output?",
        options: ["There is no meaningful difference", "An analog sensor outputs a continuous range of signal values; a digital sensor outputs discrete values (often already converted/encoded, e.g. via I2C)", "Digital sensors cannot measure physical quantities", "Analog sensors are always more accurate than digital ones"],
        correct: 1, explain: "An analog sensor's output varies continuously and typically needs an ADC to digitize; many modern sensors instead output already-digitized, discrete readings directly over a protocol like I2C or SPI." }
    ]
  };

  /* ── Sampling ─────────────────────────────────────────────────────────── */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Draws n questions from a domain's pool and reshuffles each question's
     option order, remapping `correct` to a runtime `correctIndex` so the
     same question never shows the same visual layout twice. */
  function sampleQuestions(domain, n) {
    var pool = QUESTION_BANK[domain] || [];
    return shuffle(pool).slice(0, n).map(function (q) {
      var order = shuffle([0, 1, 2, 3]);
      return {
        id: q.id,
        q: q.q,
        options: order.map(function (i) { return q.options[i]; }),
        correctIndex: order.indexOf(q.correct),
        explain: q.explain
      };
    });
  }

  function poolSize(domain) {
    return (QUESTION_BANK[domain] || []).length;
  }

  /* ── Certificate store ─────────────────────────────────────────────────
     Shape: { id, domain, name, score, total, dateISO, issuedAt }
     Only passing attempts are ever written here — a fail is not a
     certificate, so this stays a simple "certificates earned" list.
     ─────────────────────────────────────────────────────────────────────── */
  var CERT_KEY = "dronaskill_certifications";

  function todayISO(d) {
    d = d || new Date();
    return d.getFullYear() + "-" +
           String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0");
  }

  function domainCode(domain) {
    var words = String(domain).replace(/&/g, "and").split(/\s+/).filter(Boolean);
    var code = words.map(function (w) { return w[0]; }).join("").toUpperCase();
    return (code || "GEN").slice(0, 4);
  }

  function makeCertId(domain) {
    var stamp = Date.now().toString(36).toUpperCase();
    var rand = Math.floor(Math.random() * 1296).toString(36).toUpperCase(); /* 2 base36 chars */
    return "DS-" + domainCode(domain) + "-" + stamp + rand;
  }

  function normalizeCertification(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (DOMAINS.indexOf(raw.domain) === -1) return null;

    var name = String(raw.name || "").trim().slice(0, 60);
    if (name.length < 1) return null;

    var total = Number(raw.total);
    if (total !== 10) return null;

    var score = Math.round(Number(raw.score));
    if (!isFinite(score) || score < 7 || score > total) return null;

    var dateISO = /^\d{4}-\d{2}-\d{2}$/.test(raw.dateISO) ? raw.dateISO : todayISO();
    var id = /^DS-[A-Z0-9]{1,4}-[A-Z0-9]+$/.test(raw.id) ? raw.id : makeCertId(raw.domain);

    return {
      id: id,
      domain: raw.domain,
      name: name,
      score: score,
      total: total,
      dateISO: dateISO,
      issuedAt: typeof raw.issuedAt === "string" ? raw.issuedAt : new Date().toISOString()
    };
  }

  function readCertifications() {
    var raw = [];
    try { raw = JSON.parse(global.localStorage.getItem(CERT_KEY) || "[]"); }
    catch (e) { raw = []; }
    if (!Array.isArray(raw)) return [];

    return raw.map(normalizeCertification).filter(Boolean).sort(function (a, b) {
      return a.issuedAt < b.issuedAt ? 1 : -1; /* newest first */
    });
  }

  function writeCertifications(list) {
    try { global.localStorage.setItem(CERT_KEY, JSON.stringify(list)); }
    catch (e) { /* storage full or blocked — the in-memory copy still works */ }
  }

  /* addCertification(input) -> the stored record, or null if score < 7 */
  function addCertification(input) {
    input = input || {};
    if (Math.round(Number(input.score)) < 7) return null;

    var record = normalizeCertification({
      id: makeCertId(input.domain),
      domain: input.domain,
      name: input.name,
      score: input.score,
      total: input.total,
      dateISO: todayISO(),
      issuedAt: new Date().toISOString()
    });
    if (!record) return null;

    var list = readCertifications();
    list.unshift(record);
    writeCertifications(list);
    return record;
  }

  global.DRONA_CERT = {
    DOMAINS: DOMAINS,
    CERT_KEY: CERT_KEY,
    QUESTION_BANK: QUESTION_BANK,
    poolSize: poolSize,
    sampleQuestions: sampleQuestions,
    todayISO: todayISO,
    makeCertId: makeCertId,
    readCertifications: readCertifications,
    writeCertifications: writeCertifications,
    addCertification: addCertification
  };
})(window);
