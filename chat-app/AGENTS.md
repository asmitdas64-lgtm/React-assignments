# AGENTS.md: AI entry point

Read these before writing any code. They are the source of truth; if they ever disagree, `01` wins.

1. `docs/01_REQUIREMENTS_CHECKLIST.md`: **what** to build ([CORE], [SIDEBAR], [CORE+], [SECURITY], [TDD], [QUALITY])
2. `docs/02_PROJECT_CONTEXT.md`: **how**: rules, stack, folder structure, constants, data model, security architecture, TDD strategy, socket contract
3. `docs/03_UI_DESIGN_SPEC.md`: **look**: visual spec from `docs/assets/reference/*.jpg` including validation states and alert badges
4. `docs/04_IMPLEMENTATION_PHASES.md`: **order & TDD execution**: Phases 0–10, strict Red → Green → Refactor cycle
5. `docs/05_AI_SYSTEM_PROMPT.md`: full prompt template with TDD and security guidelines

Assets: `docs/assets/design-tokens.css`, `docs/assets/constants.js`, `docs/assets/schemas.js`, `docs/assets/icons/*.svg`, `docs/assets/reference/*.jpg`.

## Scope (final)
Everything below is **mandatory**:
- **[CORE]** (brief): React SPA · textbox + **Send button** · message shows above input · random username per message from `user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"]` · **like button at right end** with counter next to it.
- **[SIDEBAR]** (added): profile card (`CURRENT_USER`, display only) · channel list (Poland Office, Introductions, India Office) with active highlight and per-channel messages · "+" add channel · chat header · mobile drawer below 900px.
- **[CORE+]** (brief's stretch goals, promoted): emoji picker (emoji-mart, dark) · `@mentions` · Express + socket.io server with channel rooms (exact 11-event contract).
- **[SECURITY]** (added): Zod v4 validation across client & server · zero `dangerouslySetInnerHTML` · XSS & injection prevention · rate limits & size caps · Helmet headers.
- **[TDD]** (engineering standard): Test-Driven Development across all phases using Vitest + React Testing Library (client) and Vitest (server). Red → Green → Refactor for every step.

## Non-negotiables
- Strict TDD: Write the test first (Red), implement to pass (Green), then refactor.
- Build order: [CORE] → [SIDEBAR] → [CORE+]; [CORE] and [SIDEBAR] must work in local mode without the server.
- JavaScript + plain CSS (tokens) only: no TypeScript, Tailwind, UI kits, Redux, or router.
- `CURRENT_USER` never becomes a message author; never change `user_list`.
- Never bypass Zod schema validation; never use `dangerouslySetInnerHTML`.
