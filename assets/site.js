(() => {
    "use strict";

    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const rand = (a, b) => a + Math.random() * (b - a);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = matchMedia("(pointer: fine)").matches;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);

    /* ------------------------------------------------------------------ */
    /* Content                                                             */
    /* ------------------------------------------------------------------ */

    const FILES = {
        agent: {
            lang: "py",
            label: "Python 3.12",
            src: `# agent.py — roughly what I ship at Workato
from agents import Agent, Retriever, tool, redact

class Varshith(Agent):
    """Senior Software Engineer · Agentic AI"""
    focus = ["agentic support", "RAG", "PII safety"]

    def __init__(self):
        self.kb = Retriever(index="support-kb", top_k=8)

    @tool
    async def resolve(self, ticket: Ticket) -> Answer:
        context = await self.kb.search(redact(ticket.question))
        draft = await self.llm.reason(ticket, context)
        if draft.confidence < 0.85:
            return self.handoff(ticket, to="human")
        return draft.cite(context).send()

Varshith().serve()`
        },
        whoami: {
            lang: "json",
            label: "JSON",
            src: `{
  "name": "Muthya Varshith Vankamamidi",
  "role": "Senior Software Engineer, Agentic AI",
  "company": "Workato",
  "building": ["AgentX Support", "Zendesk Copilot", "PII service"],
  "conversations_per_day": 1000000,
  "previously": ["DeepConverse", "HackerRank"],
  "experience_years": 6,
  "based_in": "Hyderabad, India",
  "stack": ["Python", "Elasticsearch", "AWS", "Kubernetes"],
  "open_to_chat": true,
  "email": "me@iamvarshith.dev"
}`
        }
    };

    const TICKETS = [
        {id: 48213, q: "SSO login loop after Okta update", conf: 0.93, cites: 3,
            steps: [["embed query", 12], ["retrieve 8 chunks", 41], ["rerank → top 3", 18], ["reason · llm", 920]]},
        {id: 48219, q: "How do I retry a failed recipe job?", conf: 0.97, cites: 2,
            steps: [["embed query", 11], ["retrieve 8 chunks", 37], ["rerank → top 2", 16], ["reason · llm", 640]]},
        {id: 48224, q: "Invoice shows a duplicate charge", conf: 0.61, cites: 1,
            steps: [["embed query", 13], ["retrieve 8 chunks", 44], ["rerank → top 1", 19], ["reason · llm", 810]]},
        {id: 48230, q: "Webhook trigger not firing in sandbox", conf: 0.89, cites: 4,
            steps: [["embed query", 12], ["retrieve 8 chunks", 39], ["tool · fetch_job_logs", 210], ["reason · llm", 1040]]}
    ];


    const LANG_COLORS = {
        Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26",
        CSS: "#663399", Go: "#00ADD8", Ruby: "#701516", Shell: "#89e051", Java: "#b07219"
    };

    const FALLBACK_REPOS = [
        {name: "Grokking-the-Coding-Interview-Patterns-for-Coding-Questions", language: "Python", stargazers_count: 12,
            description: "Coding-interview patterns with worked Python solutions."},
        {name: "neetcode-submissions", language: "Python", stargazers_count: 0,
            description: "My NeetCode.io problem submissions."},
        {name: "jamboreepalace", language: "HTML", stargazers_count: 1,
            description: "A platform for partitioning large venues into small bookable spaces."}
    ];

    /* ------------------------------------------------------------------ */
    /* Nav, progress, reveal                                               */
    /* ------------------------------------------------------------------ */

    const nav = $("#nav");
    const progress = $(".progress span");
    const topo = $("#topo");
    const rails = $$(".co__roles");
    const hudElev = $("#hudElev");
    const hud = $(".hud");

    function onScroll() {
        const y = scrollY;
        const max = document.documentElement.scrollHeight - innerHeight;
        nav.classList.toggle("is-scrolled", y > 10);
        progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
        const p = max > 0 ? y / max : 0;
        hudElev.textContent = p > 0.995 ? "8,848 m · summit" : `${Math.round(p * 8848).toLocaleString("en-US")} m`;
        hud.classList.toggle("is-hidden", max - y < 140);

        for (const rail of rails) {
            const r = rail.getBoundingClientRect();
            const fill = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
            rail.style.setProperty("--fill", fill.toFixed(3));
        }
    }

    addEventListener("scroll", onScroll, {passive: true});
    addEventListener("resize", onScroll);
    onScroll();

    const menuBtn = $("#navMenu");
    const navLinks = $("#navLinks");
    menuBtn.addEventListener("click", () => {
        const open = navLinks.classList.toggle("is-open");
        menuBtn.setAttribute("aria-expanded", open);
    });
    navLinks.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
            navLinks.classList.remove("is-open");
            menuBtn.setAttribute("aria-expanded", "false");
        }
    });

    const linkFor = new Map($$("a", navLinks).map((a) => [a.getAttribute("href").slice(1), a]));
    const sectionObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            linkFor.forEach((a) => a.classList.remove("is-active"));
            linkFor.get(e.target.id)?.classList.add("is-active");
        });
    }, {rootMargin: "-45% 0px -50% 0px"});
    $$("main section[id]").forEach((s) => sectionObs.observe(s));

    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("in");
            e.target.querySelectorAll("[data-scramble]").forEach(scramble);
            e.target.querySelectorAll("[data-count]").forEach(countUp);
            revealObs.unobserve(e.target);
        });
    }, {threshold: 0.12, rootMargin: "0px 0px -40px 0px"});

    function observeReveals(root = document) {
        $$(".reveal:not(.in)", root).forEach((el) => revealObs.observe(el));
    }
    observeReveals();

    function scramble(el) {
        if (reduced || el.dataset.done) return;
        el.dataset.done = "1";
        const final = el.textContent;
        const glyphs = "!<>-_\\/[]{}—=+*^?#01";
        let frame = 0;
        const total = 26;
        const tick = () => {
            const progress = frame / total;
            el.textContent = [...final].map((ch, i) => {
                if (ch === " ") return " ";
                return i / final.length < progress ? ch : glyphs[(Math.random() * glyphs.length) | 0];
            }).join("");
            if (frame++ < total) requestAnimationFrame(tick);
            else el.textContent = final;
        };
        tick();
    }

    function countUp(el) {
        const target = +el.dataset.count;
        if (reduced) { el.textContent = target; return; }
        const start = performance.now();
        const dur = 1400;
        const step = (t) => {
            const k = Math.min(1, (t - start) / dur);
            el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
            if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    document.addEventListener("pointermove", (e) => {
        const card = e.target.closest?.(".card");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, {passive: true});

    /* ------------------------------------------------------------------ */
    /* Background: topographic terrain, with a peak that follows the cursor */
    /* ------------------------------------------------------------------ */

    (function terrain() {
        const ctx = topo.getContext("2d");
        const CELL = 18, LEVELS = 22, STEP = 0.09, BASE = -0.85;
        const perm = new Uint8Array(512);
        const p = Array.from({length: 256}, (_, i) => i);
        let seed = 20180801;
        for (let i = 255; i > 0; i--) {
            seed = (seed * 16807) % 2147483647;
            const j = seed % (i + 1);
            [p[i], p[j]] = [p[j], p[i]];
        }
        for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
        const G = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
        const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
        function noise(x, y) {
            const X = Math.floor(x), Y = Math.floor(y);
            const xf = x - X, yf = y - Y, xi = X & 255, yi = Y & 255;
            const d = (h, dx, dy) => { const g = G[h & 7]; return g[0] * dx + g[1] * dy; };
            const aa = d(perm[xi + perm[yi]], xf, yf);
            const ba = d(perm[xi + 1 + perm[yi]], xf - 1, yf);
            const ab = d(perm[xi + perm[yi + 1]], xf, yf - 1);
            const bb = d(perm[xi + 1 + perm[yi + 1]], xf - 1, yf - 1);
            const u = fade(xf), v = fade(yf);
            return (aa + u * (ba - aa)) * (1 - v) + (ab + u * (bb - ab)) * v;
        }

        let w = 0, h = 0, cols = 0, rows = 0, vals = new Float32Array(0), raf = 0, frame = 0;
        const mouse = {x: -9999, y: -9999, tx: -9999, ty: -9999, amp: 0, target: 0};

        function resize() {
            const dpr = Math.min(devicePixelRatio || 1, 2);
            w = innerWidth; h = innerHeight;
            topo.width = w * dpr; topo.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            cols = Math.ceil(w / CELL) + 2; rows = Math.ceil(h / CELL) + 2;
            vals = new Float32Array(cols * rows);
        }

        function sample(t) {
            const s = 1 / 420, drift = t * 0.000012, sy = scrollY * 0.22;
            const sigma2 = 2 * 150 * 150;
            for (let j = 0; j < rows; j++) {
                const py = j * CELL;
                for (let i = 0; i < cols; i++) {
                    const px = i * CELL;
                    const nx = px * s + drift, ny = (py + sy) * s - drift * 0.6;
                    let v = noise(nx, ny) * 0.72 + noise(nx * 2.1 + 7.3, ny * 2.1 + 3.1) * 0.28;
                    if (mouse.amp > 0.001) {
                        const dx = px - mouse.x, dy = py - mouse.y;
                        v += mouse.amp * Math.exp(-(dx * dx + dy * dy) / sigma2);
                    }
                    vals[j * cols + i] = v;
                }
            }
        }

        const lerp = (a, b, l) => (l - a) / (b - a || 1e-6);
        function contour(level) {
            for (let j = 0; j < rows - 1; j++) {
                for (let i = 0; i < cols - 1; i++) {
                    const a = vals[j * cols + i], b = vals[j * cols + i + 1];
                    const c = vals[(j + 1) * cols + i + 1], d = vals[(j + 1) * cols + i];
                    const k = (a > level) << 3 | (b > level) << 2 | (c > level) << 1 | (d > level);
                    if (k === 0 || k === 15) continue;
                    const x = i * CELL, y = j * CELL;
                    const e = [
                        () => [x + lerp(a, b, level) * CELL, y],
                        () => [x + CELL, y + lerp(b, c, level) * CELL],
                        () => [x + lerp(d, c, level) * CELL, y + CELL],
                        () => [x, y + lerp(a, d, level) * CELL]
                    ];
                    const seg = (m, n) => {
                        const [x1, y1] = e[m](), [x2, y2] = e[n]();
                        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                    };
                    switch (k) {
                        case 1: case 14: seg(3, 2); break;
                        case 2: case 13: seg(2, 1); break;
                        case 3: case 12: seg(3, 1); break;
                        case 4: case 11: seg(0, 1); break;
                        case 6: case 9: seg(0, 2); break;
                        case 7: case 8: seg(3, 0); break;
                        case 5: seg(3, 2); seg(0, 1); break;
                        case 10: seg(0, 3); seg(1, 2); break;
                    }
                }
            }
        }

        function draw(t) {
            mouse.x += (mouse.tx - mouse.x) * 0.12;
            mouse.y += (mouse.ty - mouse.y) * 0.12;
            mouse.amp += (mouse.target - mouse.amp) * 0.05;
            sample(t);
            ctx.clearRect(0, 0, w, h);
            const lit = mouse.amp > 0.01;
            const glow = (inner, outer) => {
                if (!lit) return outer;
                const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 340);
                g.addColorStop(0, inner); g.addColorStop(1, outer);
                return g;
            };
            const minor = glow("rgba(94,234,212,.34)", "rgba(148,163,184,.075)");
            const major = glow("rgba(94,234,212,.6)", "rgba(94,234,212,.14)");
            for (let n = 0; n < LEVELS; n++) {
                const isMajor = n % 5 === 0;
                ctx.beginPath();
                contour(BASE + n * STEP);
                ctx.strokeStyle = isMajor ? major : minor;
                ctx.lineWidth = isMajor ? 1.2 : 0.8;
                ctx.stroke();
            }
        }

        function loop(t) {
            if (frame++ % 2 === 0) draw(t);
            raf = requestAnimationFrame(loop);
        }

        resize();
        addEventListener("resize", () => { resize(); if (reduced) draw(0); });
        if (reduced) {
            draw(0);
            let pending = false;
            addEventListener("scroll", () => {
                if (pending) return;
                pending = true;
                requestAnimationFrame(() => { draw(0); pending = false; });
            }, {passive: true});
            return;
        }

        if (finePointer) {
            let idle = 0;
            addEventListener("pointermove", (e) => {
                if (mouse.x < -999) { mouse.x = e.clientX; mouse.y = e.clientY; }
                mouse.tx = e.clientX; mouse.ty = e.clientY; mouse.target = 0.55;
                clearTimeout(idle);
                idle = setTimeout(() => { mouse.target = 0.3; }, 2500);
            }, {passive: true});
            document.documentElement.addEventListener("pointerleave", () => { mouse.target = 0; });
        }
        document.addEventListener("visibilitychange", () => {
            cancelAnimationFrame(raf);
            if (!document.hidden) raf = requestAnimationFrame(loop);
        });
        raf = requestAnimationFrame(loop);
    })();

    /* ------------------------------------------------------------------ */
    /* Cursor: a Counter-Strike crosshair that spreads when you move        */
    /* ------------------------------------------------------------------ */

    (function crosshair() {
        if (!finePointer || !matchMedia("(hover: hover)").matches) return;
        const el = $("#xhair");
        const label = $(".xhair__label", el);
        document.documentElement.classList.add("has-xhair");

        let x = -100, y = -100, lx = x, ly = y, spread = 0, base = 4, raf = 0, hovered = null;

        function labelFor(t) {
            if (t.dataset.cursor) return t.dataset.cursor;
            if (t.matches("summary")) return t.parentElement.open ? "collapse" : "expand";
            if (t.matches("[data-cert]")) return "view";
            if (t.matches(".tab")) return "open file";
            if (t.id === "copyMail") return "copy";
            if (t.id === "toggleAll") return t.textContent.trim();
            if (t.matches("[data-open-terminal]")) return "⌘K";
            const href = t.getAttribute("href") || "";
            if (href.startsWith("mailto:")) return "say hi";
            if (href.startsWith("#")) return "jump";
            if (href.endsWith(".pdf")) return "resume ↗";
            if (t.matches("a")) return "open ↗";
            return "click";
        }

        function setHover(t) {
            hovered = t;
            el.classList.toggle("is-hover", !!t);
            base = t ? 9 : 4;
            label.textContent = t ? labelFor(t) : "";
            kick();
        }

        function tick() {
            const v = Math.hypot(x - lx, y - ly);
            lx = x; ly = y;
            spread = Math.min(16, spread * 0.84 + (reduced ? 0 : v * 0.1));
            el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            el.style.setProperty("--gap", `${(base + spread).toFixed(2)}px`);
            raf = spread > 0.05 || v > 0 ? requestAnimationFrame(tick) : 0;
        }
        const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

        addEventListener("pointermove", (e) => {
            if (e.pointerType !== "mouse") return;
            x = e.clientX; y = e.clientY;
            el.classList.add("is-on");
            kick();
        }, {passive: true});

        document.addEventListener("pointerover", (e) => {
            const native = e.target.closest?.("input, textarea, .term__body, .editor");
            el.classList.toggle("is-off", !!native);
            const t = native ? null : e.target.closest?.("a, button, summary, [data-cursor]");
            if (t !== hovered) setHover(t);
        });
        document.documentElement.addEventListener("pointerleave", () => el.classList.remove("is-on"));
        addEventListener("pointerdown", () => { if (!reduced) spread += 9; kick(); });
        addEventListener("click", () => { if (hovered) requestAnimationFrame(() => setHover(hovered)); });
    })();

    /* ------------------------------------------------------------------ */
    /* Career: elevation profile                                           */
    /* ------------------------------------------------------------------ */

    (function climb() {
        const svg = $("#climbSvg");
        if (!svg) return;
        const X = (t) => 50 + (t - 2018.3) / (2027 - 2018.3) * 1010;
        const C = {mint: "94,234,212", amber: "251,191,36", green: "74,222,128", sky: "125,211,252", rose: "251,113,133", violet: "167,139,250"};
        const CAMPS = [
            {t: 2018.6, y: 236, name: "NIIT University", sub: "B.Tech · 2018", c: "violet", href: "#co-early", up: true},
            {t: 2020.0, y: 212, name: "Freelance", sub: "first clients · 2020", c: "rose", href: "#co-early", up: true},
            {t: 2021.1, y: 192, name: "Bar-At", sub: "legal search · 2021", c: "sky", href: "#co-barat", up: false},
            {t: 2022.0, y: 170, name: "HackerRank", sub: "intern · 2022", c: "green", href: "#co-hackerrank", up: true},
            {t: 2022.45, y: 154, step: true},
            {t: 2023.5, y: 126, step: true},
            {t: 2024.7, y: 104, name: "DeepConverse", sub: "acquired · 2024", c: "amber", href: "#co-workato", up: false},
            {t: 2024.95, y: 90, name: "Workato", sub: "AgentX Support · 2024", c: "mint", href: "#co-workato", up: true},
            {t: 2026.17, y: 62, name: "Senior SWE", sub: "agentic AI · 2026", c: "mint", href: "#co-workato", up: false},
        ];
        const SUMMIT = {t: 2026.87, y: 46};
        const pts = [[22, 262], ...CAMPS.map((c) => [X(c.t), c.y]), [X(SUMMIT.t), SUMMIT.y]];

        let s = 7;
        const jitter = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - 0.5; };
        const ridge = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
            const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
            const n = Math.max(1, Math.round((x1 - x0) / 34));
            for (let k = 1; k < n; k++) {
                const f = k / n;
                ridge.push([x0 + (x1 - x0) * f + jitter() * 8, y0 + (y1 - y0) * f + jitter() * 22]);
            }
            ridge.push([x1, y1]);
        }
        const d = "M" + ridge.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(" L");
        const end = ridge[ridge.length - 1];

        const stops = CAMPS.filter((c) => !c.step).map((c) => `<stop offset="${((X(c.t) - 22) / (end[0] - 22)).toFixed(3)}" stop-color="rgb(${C[c.c]})"/>`).join("");
        const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) =>
            `<g class="climb__year"><line x1="${X(yr)}" x2="${X(yr)}" y1="18" y2="262"/><text x="${X(yr)}" y="276">${yr}</text></g>`).join("");
        const contours = [16, 32, 48, 64, 80].map((o, i) =>
            `<path class="climb__contour" d="${d}" transform="translate(0 ${o})" style="opacity:${(0.9 - i * 0.16).toFixed(2)}"/>`).join("");

        const camps = CAMPS.map((c, i) => {
            const cx = X(c.t), delay = `--d:${(0.3 + i * 0.32).toFixed(2)}s`;
            if (c.step) return `<circle class="step" cx="${cx}" cy="${c.y}" r="3.5" style="${delay}"/>`;
            const ty = c.up ? c.y - 36 : c.y + 30;
            const stem = c.up ? `M${cx} ${c.y - 8} V${c.y - 24}` : `M${cx} ${c.y + 8} V${c.y + 16}`;
            const anchor = cx > 900 ? "end" : cx < 90 ? "start" : "middle";
            return `<a class="camp" href="${c.href}" style="--c:${C[c.c]};${delay}" aria-label="${c.name}, ${c.sub}">
                <path class="camp__stem" d="${stem}"/>
                <circle cx="${cx}" cy="${c.y}" r="5.5"/>
                <text class="camp__t" x="${cx}" y="${ty}" text-anchor="${anchor}">${c.name}</text>
                <text class="camp__s" x="${cx}" y="${ty + 14}" text-anchor="${anchor}">${c.sub}</text>
            </a>`;
        }).join("");

        svg.innerHTML = `
            <defs>
                <linearGradient id="gClimbRidge" gradientUnits="userSpaceOnUse" x1="22" x2="${end[0]}" y1="0" y2="0">${stops}</linearGradient>
                <linearGradient id="gClimbFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="rgba(94,234,212,.16)"/><stop offset="1" stop-color="rgba(94,234,212,0)"/>
                </linearGradient>
            </defs>
            ${years}
            <path class="climb__fill" d="${d} L${end[0]} 280 L22 280 Z"/>
            ${contours}
            <path id="climbPath" class="climb__ridge" pathLength="1" d="${d}"/>
            ${camps}
            <line class="climb__pole" x1="${end[0]}" y1="${end[1]}" x2="${end[0]}" y2="${end[1] - 30}"/>
            <path class="climb__flag" d="M${end[0]} ${end[1] - 30} l18 6 -18 6z"/>
            <text class="climb__here" x="${end[0] - 8}" y="${end[1] - 20}">HEAD · now</text>
            <circle class="climb__me" r="4.5"><animateMotion id="climbWalk" dur="3.2s" begin="indefinite" fill="freeze"><mpath href="#climbPath"/></animateMotion></circle>`;

        const box = $("#climb");
        const io = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            io.disconnect();
            const scroller = $(".climb__scroll", box);
            scroller.scrollLeft = scroller.scrollWidth;
            setTimeout(() => {
                const walk = $("#climbWalk");
                if (reduced) { walk.setAttribute("begin", "0s"); walk.setAttribute("dur", "0.01s"); }
                walk.beginElement?.();
            }, 150);
        }, {threshold: 0.3});
        io.observe(box);
    })();

    /* ------------------------------------------------------------------ */
    /* Hero: Muthya Varshith → Varsh, and everything else I am            */
    /* ------------------------------------------------------------------ */

    (function heroName() {
        const name = $("#heroName");
        const parts = $$(".nm", name);
        parts.forEach((part) => {
            const text = part.firstChild;
            const chars = [...text.textContent].map((c) => {
                const span = document.createElement("span");
                span.className = "ch";
                span.textContent = c;
                return span;
            });
            text.replaceWith(...chars);
        });
        const drop = [...$$(".nm--drop", name)].reverse().flatMap((p) => [...$$(".ch", p)].reverse());
        drop.forEach((ch, i) => ch.style.setProperty("--dl", `${(i * 0.045).toFixed(3)}s`));
        $(".sp", name).style.setProperty("--dl", `${(drop.length * 0.045).toFixed(3)}s`);

        const shorten = () => name.classList.add("is-short");
        if (reduced) shorten(); else setTimeout(shorten, 1700);
        name.addEventListener("pointerenter", () => name.classList.remove("is-short"));
        name.addEventListener("pointerleave", shorten);

        const roles = $("#roles");
        const words = $$(".rw", roles);
        let i = 0;
        const fit = () => { roles.style.width = `${words[i].offsetWidth}px`; };
        fit();
        document.fonts?.ready.then(fit);
        addEventListener("resize", fit);
        if (reduced) return;
        setInterval(() => {
            if (document.hidden) return;
            const prev = words[i];
            i = (i + 1) % words.length;
            prev.classList.remove("is-on");
            prev.classList.add("is-out");
            words[i].classList.remove("is-out");
            words[i].classList.add("is-on");
            fit();
            setTimeout(() => prev.classList.remove("is-out"), 600);
        }, 2200);
    })();

    (function photos() {
        const stack = $("#photos");
        if (!stack) return;
        let busy = false;
        const shuffle = () => {
            if (busy) return;
            busy = true;
            const cards = $$(".pol", stack);
            const top = cards.find((c) => c.dataset.pos === "0");
            top.classList.add("is-flying");
            setTimeout(() => {
                cards.forEach((c) => { c.dataset.pos = String((+c.dataset.pos + cards.length - 1) % cards.length); });
                top.classList.remove("is-flying");
                setTimeout(() => { busy = false; }, 350);
            }, reduced ? 0 : 320);
        };
        stack.addEventListener("click", shuffle);
        stack.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); shuffle(); }
        });
    })();

    $$("a[data-jump]").forEach((a) => a.addEventListener("click", (e) => {
        const target = $(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        scrollTo({top: target.getBoundingClientRect().top + scrollY - 80, behavior: "instant"});
        window.history.pushState(null, "", a.getAttribute("href"));
    }));

    /* ------------------------------------------------------------------ */
    /* Hero: a ridgeline mountain with the career route climbing it        */
    /* ------------------------------------------------------------------ */

    (function summit() {
        const hero = $("#summit");
        const cv = $("#summitCanvas");
        const ctx = cv.getContext("2d");
        const camps = $$(".summit__camp", hero).map((el) => ({el, k: +el.dataset.k}));
        const N = 46;
        let w = 0, h = 0, g = null, raf = 0, frame = 0, visible = true;
        const mouse = {x: -1e4, y: -1e4, tx: -1e4, ty: -1e4};

        const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
        const smooth = (x, z) => {
            const xi = Math.floor(x), f = x - xi, u = f * f * (3 - 2 * f);
            return hash(xi + z * 57) * (1 - u) + hash(xi + 1 + z * 57) * u;
        };

        function resize() {
            const dpr = Math.min(devicePixelRatio || 1, 2);
            w = cv.clientWidth; h = cv.clientHeight;
            cv.width = w * dpr; cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const mob = w < 760;
            g = {
                top: h * (mob ? 0.68 : 0.46), span: h * (mob ? 0.32 : 0.52), A: h * (mob ? 0.14 : 0.34),
                px: w * (mob ? 0.62 : 0.64), sx: w * (mob ? 0.24 : 0.15), zc: N * 0.32,
                start: w * (mob ? 0.1 : 0.3)
            };
        }

        const baseY = (z) => g.top + (z / (N - 1)) * g.span;
        function height(x, z, t) {
            const {A, px, sx, zc} = g;
            const dx = x - px, dz = z - zc;
            let v = A * Math.exp(-(dx * dx) / (2 * sx * sx) - (dz * dz) / 98);
            v += A * 0.45 * Math.exp(-((x - w * 0.88) ** 2) / (2 * (w * 0.07) ** 2) - ((z - N * 0.5) ** 2) / 60);
            v += A * 0.3 * Math.exp(-((x - w * 0.4) ** 2) / (2 * (w * 0.08) ** 2) - ((z - N * 0.6) ** 2) / 80);
            v += (smooth(x / 38 + t * 0.0004, z) * 14 + smooth(x / 11, z + 9) * 4) * (0.25 + v / A);
            const dm = Math.hypot(x - mouse.x, (baseY(z) - v - mouse.y) * 1.4);
            return v + 26 * Math.exp(-(dm * dm) / 9800);
        }
        function route(k, t) {
            const x = g.start + (g.px - g.start) * k, z = (N - 2) + (g.zc - (N - 2)) * k;
            return [x, baseY(z) - height(x, z, t)];
        }

        function draw(t) {
            mouse.x += (mouse.tx - mouse.x) * 0.15;
            mouse.y += (mouse.ty - mouse.y) * 0.15;
            ctx.clearRect(0, 0, w, h);
            for (let z = 0; z < N; z++) {
                const y0 = baseY(z), major = z % 6 === 0, a = 0.12 + (z / (N - 1)) * 0.5;
                ctx.beginPath();
                ctx.moveTo(-10, y0);
                for (let x = -10; x <= w + 10; x += 6) ctx.lineTo(x, y0 - height(x, z, t));
                ctx.lineTo(w + 10, h + 10); ctx.lineTo(-10, h + 10); ctx.closePath();
                ctx.fillStyle = "#06070b"; ctx.fill();
                ctx.strokeStyle = major ? `rgba(94,234,212,${a})` : `rgba(148,163,184,${a * 0.75})`;
                ctx.lineWidth = major ? 1.3 : 1;
                ctx.stroke();
            }

            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = "rgba(255,159,110,.9)"; ctx.lineWidth = 1.6;
            ctx.beginPath();
            for (let k = 0; k <= 1.0001; k += 0.02) {
                const [x, y] = route(k, t);
                if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            for (const c of camps) {
                const [x, y] = route(c.k, t);
                if (c.k < 1) {
                    ctx.fillStyle = "#06070b"; ctx.strokeStyle = "#ff9f6e"; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    c.el.style.transform = `translate(${(x + 12).toFixed(1)}px, ${y.toFixed(1)}px) translateY(-50%)`;
                } else {
                    ctx.strokeStyle = "#e7eaf3"; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 34); ctx.stroke();
                    ctx.fillStyle = "#5eead4";
                    ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x + 20 + Math.sin(t / 260) * 2, y - 27); ctx.lineTo(x, y - 20); ctx.fill();
                    c.el.style.transform = `translate(${x.toFixed(1)}px, ${(y - 40).toFixed(1)}px) translate(-50%, -100%)`;
                }
            }
        }

        function loop(t) {
            if (frame++ % 2 === 0) draw(t);
            raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
        }
        const start = () => { if (!raf && !reduced) raf = requestAnimationFrame(loop); };

        resize();
        draw(0);
        hero.classList.add("is-ready");
        addEventListener("resize", () => { resize(); draw(performance.now()); });
        if (reduced) return;

        if (finePointer) {
            hero.addEventListener("pointermove", (e) => {
                const r = cv.getBoundingClientRect();
                if (mouse.x < -999) { mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }
                mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
            }, {passive: true});
            hero.addEventListener("pointerleave", () => { mouse.tx = mouse.ty = -1e4; });
        }
        new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(hero);
        document.addEventListener("visibilitychange", start);
        start();
    })();

    /* ------------------------------------------------------------------ */
    /* Craft: editor                                                       */
    /* ------------------------------------------------------------------ */

    const PY_KW = new Set(("from import class def async await return if else elif for in while with as try " +
        "except finally raise not and or is lambda pass yield").split(" "));
    const PY_CONST = new Set(["None", "True", "False"]);

    function tokenize(src, lang) {
        const out = [];
        const push = (t, c) => out.push({t, c});

        if (lang === "json") {
            const re = /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?)|(true|false|null)|([{}[\],:])|(\s+)|(.)/g;
            let m;
            while ((m = re.exec(src))) {
                if (m[1]) push(m[1], "prop");
                else if (m[2]) push(m[2], "str");
                else if (m[3]) push(m[3], "num");
                else if (m[4]) push(m[4], "bool");
                else if (m[5]) push(m[5], "punc");
                else push(m[0], null);
            }
            return out;
        }

        const re = /(#.*)|("""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(@\w+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z_\d])/g;
        let m, prevWord = "";
        while ((m = re.exec(src))) {
            const [tok, com, str, deco, num, ident, ws] = m;
            if (com) push(tok, "com");
            else if (str) push(tok, "str");
            else if (deco) push(tok, "deco");
            else if (num) push(tok, "num");
            else if (ident) {
                const after = src.slice(re.lastIndex).match(/^\s*(.)/)?.[1];
                const before = src[m.index - 1];
                let c = null;
                if (PY_KW.has(tok)) c = "kw";
                else if (PY_CONST.has(tok)) c = "bool";
                else if (tok === "self") c = "self";
                else if (prevWord === "class" || /^[A-Z]/.test(tok)) c = "cls";
                else if (prevWord === "def" || after === "(") c = "fn";
                else if (before === ".") c = "prop";
                push(tok, c);
                prevWord = tok;
            } else if (ws) push(tok, null);
            else push(tok, "punc");
        }
        return out;
    }

    const editor = $("#editor");
    const codeEl = $("#code");
    const gutter = $("#gutter");
    const posEl = $("#cursorPos");
    const langEl = $("#langLabel");
    const tabs = $$(".tab", editor);

    let typingRun = 0;
    let finishNow = null;
    const typedOnce = new Set();
    let traceStarted = false;

    function setGutter(lines, current) {
        if (gutter.children.length !== lines) {
            gutter.innerHTML = Array.from({length: lines}, (_, i) => `<span>${i + 1}</span>`).join("");
        }
        $$(".is-current", gutter).forEach((s) => s.classList.remove("is-current"));
        gutter.children[current - 1]?.classList.add("is-current");
    }

    function renderInstant(tokens) {
        codeEl.innerHTML = tokens.map(({t, c}) => c ? `<span class="tk-${c}">${esc(t)}</span>` : esc(t)).join("") +
            '<span class="caret"></span>';
        const lines = tokens.reduce((n, {t}) => n + (t.match(/\n/g) || []).length, 1);
        const lastLine = codeEl.textContent.split("\n").pop();
        setGutter(lines, lines);
        posEl.textContent = `Ln ${lines}, Col ${lastLine.length + 1}`;
    }

    async function openFile(key) {
        const run = ++typingRun;
        finishNow = null;
        const file = FILES[key];
        const tokens = tokenize(file.src, file.lang);

        tabs.forEach((t) => {
            const on = t.dataset.file === key;
            t.classList.toggle("is-active", on);
            t.setAttribute("aria-selected", on);
        });
        langEl.textContent = file.label;

        if (reduced || typedOnce.has(key)) {
            renderInstant(tokens);
            editor.classList.add("is-done");
            onFileDone(key);
            return;
        }

        editor.classList.remove("is-done");
        codeEl.innerHTML = "";
        const caret = document.createElement("span");
        caret.className = "caret";
        codeEl.appendChild(caret);
        let line = 1, col = 1;
        setGutter(1, 1);

        let skip = false;
        finishNow = () => { skip = true; };

        for (const {t, c} of tokens) {
            if (run !== typingRun) return;
            if (skip) break;
            let node;
            if (c) {
                node = document.createElement("span");
                node.className = `tk-${c}`;
            } else {
                node = document.createTextNode("");
            }
            codeEl.insertBefore(node, caret);

            const fast = c === "com" || /^\s+$/.test(t);
            let i = 0;
            while (i < t.length) {
                if (run !== typingRun) return;
                if (skip) break;
                const n = fast ? 4 : (Math.random() < 0.7 ? 2 : 1);
                const chunk = t.slice(i, i + n);
                i += chunk.length;
                node.textContent += chunk;
                for (const ch of chunk) {
                    if (ch === "\n") { line++; col = 1; } else col++;
                }
                if (chunk.includes("\n")) setGutter(line, line);
                posEl.textContent = `Ln ${line}, Col ${col}`;
                if (/^\s+$/.test(chunk) && !chunk.includes("\n")) continue;
                await sleep(chunk.includes("\n") ? rand(60, 140) : rand(14, 34));
            }
        }

        if (run !== typingRun) return;
        finishNow = null;
        renderInstant(tokens);
        typedOnce.add(key);
        editor.classList.add("is-done");
        onFileDone(key);
    }

    function onFileDone(key) {
        if (key === "agent" && !traceStarted) {
            traceStarted = true;
            runTrace();
        }
    }

    tabs.forEach((t) => t.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = t.dataset.file;
        if (!t.classList.contains("is-active")) {
            if (finishNow) typedOnce.add([...tabs].find((x) => x.classList.contains("is-active")).dataset.file);
            openFile(key);
            if (key !== "agent" && !traceStarted) { traceStarted = true; runTrace(); }
        }
    }));
    editor.addEventListener("click", () => finishNow && finishNow());

    let editorVisible = true;
    new IntersectionObserver(([e]) => { editorVisible = e.isIntersecting; }).observe(editor);
    const whenVisible = async () => { while (!editorVisible || document.hidden) await sleep(400); };

    const editorStart = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        editorStart.disconnect();
        setTimeout(() => openFile("agent"), reduced ? 0 : 400);
    }, {threshold: 0.35});
    editorStart.observe(editor);

    if (finePointer && !reduced) {
        const stage = $("#demo");
        stage.addEventListener("pointermove", (e) => {
            const r = stage.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            editor.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);
            editor.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
        });
        stage.addEventListener("pointerleave", () => {
            editor.style.setProperty("--ry", "0deg");
            editor.style.setProperty("--rx", "0deg");
        });
    }

    /* ------------------------------------------------------------------ */
    /* Craft: simulated agent trace                                        */
    /* ------------------------------------------------------------------ */

    async function runTrace() {
        const log = $("#traceLog");
        const status = $("#traceStatus");
        const sResolved = $("#statResolved");
        const sHandoff = $("#statHandoff");
        const sAvg = $("#statAvg");
        let resolved = 0, handoff = 0, totalMs = 0, runs = 0;

        const line = (html, cls = "") => {
            const p = document.createElement("p");
            if (cls) p.className = cls;
            p.innerHTML = html;
            log.appendChild(p);
            return p;
        };

        status.classList.add("is-running");
        status.lastChild.textContent = "running";

        for (let k = 0; ; k = (k + 1) % TICKETS.length) {
            await whenVisible();
            const tk = TICKETS[k];
            log.innerHTML = "";
            line(`<span class="t-dim">▸</span> ticket #${tk.id}`, "t-ticket");
            line(`  "${esc(tk.q)}"`, "t-q");
            await sleep(reduced ? 0 : 500);

            let ms = 0;
            for (let s = 0; s < tk.steps.length; s++) {
                const [name, t] = tk.steps[s];
                const branch = s === tk.steps.length - 1 ? "└─" : "├─";
                const p = line(`<span>${branch} ${esc(name)} </span><b class="spin"></b>`, "t-step");
                await sleep(reduced ? 0 : Math.min(1200, 260 + t * 0.7));
                const b = p.querySelector("b");
                b.classList.remove("spin");
                b.textContent = `${t}ms`;
                ms += t;
            }

            runs++;
            totalMs += ms;
            const secs = (ms / 1000).toFixed(1);
            if (tk.conf >= 0.85) {
                resolved++;
                line(`✓ confidence ${tk.conf.toFixed(2)} · ${tk.cites} citations\n✓ resolved in ${secs}s`, "t-ok");
            } else {
                handoff++;
                line(`! confidence ${tk.conf.toFixed(2)} &lt; 0.85\n↪ handed to a human, with context`, "t-warn");
            }
            sResolved.textContent = resolved;
            sHandoff.textContent = handoff;
            sAvg.textContent = `${(totalMs / runs / 1000).toFixed(1)}s`;
            await sleep(reduced ? 6000 : 2800);
        }
    }

    /* ------------------------------------------------------------------ */
    /* Projects (GitHub)                                                   */
    /* ------------------------------------------------------------------ */

    function timeAgo(iso) {
        if (!iso) return "";
        const days = (Date.now() - new Date(iso)) / 864e5;
        if (days < 1) return "today";
        if (days < 30) return `${Math.round(days)}d ago`;
        if (days < 365) return `${Math.round(days / 30)}mo ago`;
        return `${Math.round(days / 365)}y ago`;
    }

    function renderRepos(list) {
        const el = $("#repos");
        el.innerHTML = list.map((r, i) => {
            const color = LANG_COLORS[r.language] || "#8b93a7";
            const url = r.html_url || `https://github.com/iamvarshith/${r.name}`;
            return `
            <a class="card repo reveal" style="--d:${(i % 3) * 0.06}s" href="${esc(url)}" target="_blank" rel="noopener">
                <div class="repo__top">
                    <span class="repo__icon">iamvarshith /</span>
                    <span class="repo__arrow">↗</span>
                </div>
                <h3>${esc(r.name)}</h3>
                <p>${esc(r.description || "No description. The code speaks for itself.")}</p>
                <div class="repo__meta">
                    ${r.language ? `<span class="repo__lang" style="--c:${color}"><i></i>${esc(r.language)}</span>` : ""}
                    <span>★ ${r.stargazers_count ?? 0}</span>
                    ${r.pushed_at ? `<span>${timeAgo(r.pushed_at)}</span>` : ""}
                </div>
            </a>`;
        }).join("");
        observeReveals(el);
    }

    let repoCache = FALLBACK_REPOS;

    fetch("https://api.github.com/users/iamvarshith/repos?per_page=100&sort=pushed")
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data) => {
            const own = data
                .filter((r) => !r.fork && !r.archived && r.name !== "iamvarshith")
                .sort((a, b) => (b.stargazers_count - a.stargazers_count) ||
                    (new Date(b.pushed_at) - new Date(a.pushed_at)))
                .slice(0, 6);
            repoCache = own.length ? own : FALLBACK_REPOS;
            renderRepos(repoCache);
        })
        .catch(() => renderRepos(FALLBACK_REPOS));

    /* ------------------------------------------------------------------ */
    /* Terminal                                                            */
    /* ------------------------------------------------------------------ */

    const term = $("#term");
    const termBody = $("#termBody");
    const termOut = $("#termOut");
    const termIn = $("#termIn");
    const history = [];
    let hIdx = 0;

    const link = (href, text = href) =>
        `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

    const COMMANDS = {
        help: () => `available commands:

  <span class="t-mint">whoami</span>        who is this
  <span class="t-mint">about</span>         the short version
  <span class="t-mint">work</span>          career, newest first
  <span class="t-mint">stack</span>         tools I reach for
  <span class="t-mint">certs</span>         awards and certificates
  <span class="t-mint">projects</span>      open-source repos
  <span class="t-mint">contact</span>       ways to reach me
  <span class="t-mint">resume</span>        open my résumé
  <span class="t-mint">blog</span>          read my writing
  <span class="t-mint">cat agent.py</span>  the code from the top of the page
  <span class="t-mint">ls</span>            list files
  <span class="t-mint">clear</span>         clear the screen

<span class="t-dim">tip: ↑/↓ for history, tab to autocomplete. some commands are hidden.</span>`,

        whoami: () => `<b>Muthya Varshith Vankamamidi</b>
Senior Software Engineer, Agentic AI @ <span class="t-mint">Workato</span>
agentic support · RAG · PII-safe LLM systems · 6 years in`,

        about: () => `Hey, I'm Varshith. I build AI that helps support teams, and the
customers they talk to, have a better day.

Got hooked on building things in college, freelancing Flask and Django
apps before I'd graduated. Now I lead AgentX Support at Workato; before
that, almost three years building internal tools at HackerRank.

Off the keyboard: Counter-Strike (win rate: classified), the mountains,
travel, and cooking far too elaborately. Work hard, party harder.
<span class="t-dim">try</span> work <span class="t-dim">for the career log.</span>`,

        work: () => `<span class="t-amber">a7e3f91</span> <span class="t-mint">(HEAD → main)</span> Senior SWE, Agentic AI · Workato      <span class="t-dim">Mar 2026</span>
        <span class="t-green">+</span> PII service, 7 languages, 99.9998% accurate
        <span class="t-green">+</span> Zendesk Copilot: $500K+ ARR · voice/chat pipeline at 10K+ RPS
<span class="t-amber">c4d82e0</span> Software Engineer · Workato                         <span class="t-dim">Dec 2024</span>
        <span class="t-green">+</span> lead engineer, AgentX Support: shipped in 6 months
<span class="t-amber">8f1b7a3</span> <span class="t-amber">(merge)</span> Software Engineer · DeepConverse            <span class="t-dim">Sep 2024</span>
        <span class="t-green">+</span> migrated 32 microservices, ~1M conversations/day (Terraform, EKS → k8s)
<span class="t-amber">5c09b2d</span> Software Engineer II · HackerRank                   <span class="t-dim">Jul 2023</span>
        <span class="t-green">+</span> event-driven regression platform: release QA 1 week → hours
        <span class="t-green">+</span> Phoenix self-healing UI tests: 85% auto-fixed
<span class="t-amber">e41a8c7</span> Software Engineer · HackerRank                      <span class="t-dim">Jun 2022</span>
        <span class="t-green">+</span> Slack CI/CD tooling for ~300 engineers, 8 products
        <span class="t-green">+</span> environment re-creation days → minutes · 🏆 Kudos Award
<span class="t-amber">0d7f3e5</span> Software Engineer Intern · HackerRank               <span class="t-dim">Jan 2022</span>
<span class="t-amber">9b2c6a0</span> Full Stack Developer · Bar-At Technologies          <span class="t-dim">Feb 2021</span>
<span class="t-amber">3f8e1d4</span> Freelance Software Developer                        <span class="t-dim">Jan 2020</span>
<span class="t-amber">0000001</span> B.Tech Computer Science · NIIT University           <span class="t-dim">2018</span>`,

        stack: () => `<span class="t-mint">ai/</span>       LLMs, RAG, embeddings, vector search, agents, evals
<span class="t-violet">backend/</span>  Python, Ruby, FastAPI, Django, Flask, REST APIs
<span class="t-sky">infra/</span>    AWS, Lambda, Docker, Kubernetes, Jenkins, GitHub Actions
<span class="t-amber">data/</span>     PostgreSQL, MySQL, NoSQL, Elasticsearch, Kibana`,

        projects: () => repoCache.map((r) =>
            `${link(r.html_url || `https://github.com/iamvarshith/${r.name}`, esc(r.name))}  <span class="t-dim">★ ${r.stargazers_count ?? 0}${r.language ? " · " + esc(r.language) : ""}</span>`
        ).join("\n") + `\n\n<span class="t-dim">more:</span> ${link("https://github.com/iamvarshith")}`,

        contact: () => `email     ${link("mailto:me@iamvarshith.dev", "me@iamvarshith.dev")}
linkedin  ${link("https://www.linkedin.com/in/muthyavarshith/", "in/muthyavarshith")}
github    ${link("https://github.com/iamvarshith", "github.com/iamvarshith")}
x         ${link("https://twitter.com/varshithvmv", "@varshithvmv")}
blog      ${link("https://blog.iamvarshith.dev", "blog.iamvarshith.dev")}`,

        certs: () => `<span class="t-amber">🏆 Kudos Award</span>              HackerRank employee award
Tech Team Lead, siNUsoid v4     NIIT University · Nov 2020
Tech Team, siNUsoid v3          NIIT University · Nov 2019
REST API (Intermediate)         HackerRank · Sep 2021
Python (Basic)                  HackerRank · Sep 2021
CSS                             HackerRank · May 2021`,

        resume: () => { open("img/resume.pdf", "_blank", "noopener"); return "opening résumé.pdf in a new tab…"; },
        blog: () => { open("https://blog.iamvarshith.dev", "_blank", "noopener"); return "opening blog.iamvarshith.dev…"; },
        github: () => { open("https://github.com/iamvarshith", "_blank", "noopener"); return "opening github…"; },
        linkedin: () => { open("https://www.linkedin.com/in/muthyavarshith/", "_blank", "noopener"); return "opening linkedin…"; },

        ls: () => `<span class="t-sky">projects/</span>  about.md  agent.py  whoami.json  resume.pdf  contact.txt`,

        cat: (args) => {
            const f = args[0];
            if (!f) return `<span class="err">cat: missing file operand</span>`;
            if (f === "agent.py") return esc(FILES.agent.src);
            if (f === "whoami.json") return esc(FILES.whoami.src);
            if (f === "about.md") return COMMANDS.about();
            if (f === "contact.txt") return COMMANDS.contact();
            if (f === "resume.pdf") return `<span class="t-dim">binary file. try</span> resume`;
            if (f.startsWith("projects")) return `<span class="err">cat: ${esc(f)}: Is a directory</span>`;
            return `<span class="err">cat: ${esc(f)}: No such file or directory</span>`;
        },

        echo: (args) => esc(args.join(" ")),
        date: () => new Date().toString(),
        pwd: () => "/home/guest",
        history: () => history.map((h, i) => `${String(i + 1).padStart(4)}  ${esc(h)}`).join("\n"),
        clear: () => { termOut.innerHTML = ""; return null; },

        sudo: (args) => {
            if (args.join(" ").includes("hire")) {
                setTimeout(() => { location.href = "mailto:me@iamvarshith.dev?subject=Let's%20talk"; }, 900);
                return `<span class="t-mint">[sudo] permission granted.</span> opening your mail client…`;
            }
            return `guest is not in the sudoers file. this incident will be reported. 🙃\n<span class="t-dim">(psst: try</span> sudo hire-me<span class="t-dim">)</span>`;
        },
        rm: () => `<span class="err">nice try.</span> this site is deployed with --delete, but not by you.`,
        exit: () => `there's no exit. only ${link("mailto:me@iamvarshith.dev", "email")}.`,
        vim: () => `you'll never leave. try <span class="t-mint">nano</span>. (kidding, there's no nano either)`,
        coffee: () => `   ( (\n    ) )\n  ........\n  |      |]\n  \\      /\n   \`----'   brewing… ☕`,
        python: (args) => args[0] === "agent.py"
            ? `scroll to the top. it's already running. ↑`
            : `Python 3.12.0\n>>> <span class="t-dim">this is a portfolio, not a REPL. try</span> cat agent.py`
    };
    COMMANDS.experience = COMMANDS.work;
    COMMANDS.skills = COMMANDS.stack;
    COMMANDS.socials = COMMANDS.contact;
    COMMANDS.certificates = COMMANDS.certs;
    COMMANDS.hire = () => COMMANDS.sudo(["hire-me"]);

    const VISIBLE = ["help", "whoami", "about", "work", "stack", "certs", "projects", "contact", "resume", "blog", "ls",
        "clear", "cat"];

    function print(html, cls = "") {
        const d = document.createElement("div");
        if (cls) d.className = cls;
        d.innerHTML = html;
        termOut.appendChild(d);
        termBody.scrollTop = termBody.scrollHeight;
    }

    function run(raw) {
        const input = raw.trim();
        print(`<span class="t-mint">guest@varshith</span>:<span class="t-sky">~</span>$ <span class="cmd-echo">${esc(input)}</span>`);
        if (!input) return;
        history.push(input);
        hIdx = history.length;
        const [cmd, ...args] = input.split(/\s+/);
        const name = cmd.toLowerCase();
        const fn = Object.hasOwn(COMMANDS, name) ? COMMANDS[name] : null;
        const res = fn ? fn(args) : `<span class="err">zsh: command not found: ${esc(cmd)}</span>\n<span class="t-dim">type</span> help <span class="t-dim">to see what's available</span>`;
        if (res != null) print(res + "\n");
    }

    termIn.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            run(termIn.value);
            termIn.value = "";
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (hIdx > 0) termIn.value = history[--hIdx];
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            hIdx = Math.min(history.length, hIdx + 1);
            termIn.value = history[hIdx] || "";
        } else if (e.key === "Tab") {
            e.preventDefault();
            const v = termIn.value.trim().toLowerCase();
            if (!v) return;
            const matches = VISIBLE.filter((c) => c.startsWith(v));
            if (matches.length === 1) termIn.value = matches[0] + " ";
            else if (matches.length > 1) print(matches.join("  "));
        } else if (e.key === "l" && e.ctrlKey) {
            e.preventDefault();
            termOut.innerHTML = "";
        }
    });

    termBody.addEventListener("click", () => {
        if (!getSelection().toString()) termIn.focus({preventScroll: true});
    });
    termIn.addEventListener("focus", () => term.classList.add("is-focused"));
    termIn.addEventListener("blur", () => term.classList.remove("is-focused"));

    function openTerminal() {
        $("#terminal").scrollIntoView({behavior: reduced ? "auto" : "smooth", block: "center"});
        setTimeout(() => termIn.focus({preventScroll: true}), reduced ? 0 : 500);
    }

    $$("[data-open-terminal]").forEach((b) => b.addEventListener("click", openTerminal));

    addEventListener("keydown", (e) => {
        const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName);
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            openTerminal();
        } else if (e.key === "/" && !typing) {
            e.preventDefault();
            openTerminal();
        } else if (e.key === "Escape" && document.activeElement === termIn) {
            termIn.blur();
        }
    });

    print(`<span class="t-dim">Last login: ${new Date().toDateString()} on ttys001</span>
Welcome to <span class="t-mint">varshith</span>'s shell. Type <span class="t-mint">help</span> to get started.
`);

    /* ------------------------------------------------------------------ */
    /* Misc                                                                */
    /* ------------------------------------------------------------------ */

    const toast = $("#toast");
    let toastTimer;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add("is-on");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("is-on"), 1800);
    }

    $("#copyMail").addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText("me@iamvarshith.dev");
            showToast("✓ copied me@iamvarshith.dev");
        } catch {
            showToast("me@iamvarshith.dev");
        }
    });

    const toggleAll = $("#toggleAll");
    const roleDetails = $$("#career details");
    const syncToggle = () => {
        toggleAll.textContent = roleDetails.every((d) => d.open) ? "collapse all" : "expand all";
    };
    toggleAll.addEventListener("click", () => {
        const open = !roleDetails.every((d) => d.open);
        roleDetails.forEach((d) => { d.open = open; });
        syncToggle();
    });
    roleDetails.forEach((d) => d.addEventListener("toggle", syncToggle));

    const lightbox = $("#lightbox");
    const lightboxImg = $("#lightboxImg");
    $$("[data-cert]").forEach((btn) => btn.addEventListener("click", () => {
        lightboxImg.src = btn.dataset.cert;
        lightboxImg.alt = btn.dataset.title;
        $("#lightboxTitle").textContent = btn.dataset.title;
        lightbox.showModal();
    }));
    $("#lightboxClose").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });

    $("#year").textContent = new Date().getFullYear();
})();
