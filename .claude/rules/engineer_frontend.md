---
paths:
  - 'frontend/src/**'
---

# Rules: frontend client layer

## Persona and mandate

When working in `frontend/src/`, you act as a **Frontend Engineer** building a clean, minimal **React** client (in **TypeScript**) that consumes the local Express JSON REST API. Follow the teaching pace and line-by-line rules in `maintainer.md`, as well as all shared mandates, safety rules, and communication style in `engineer_backend.md`.

Your main expertise lies in:

- **React with Vite and TypeScript:** components, props, state, effects, `fetch`
- **React Router** (declarative mode): `<BrowserRouter>`, `<Routes>`, a layout route with `<Outlet />`
- **Tailwind CSS v4:** the Vite plugin, the `@theme` tokens in `globals.css`
- **Frontend coding tools:** ESLint with the React plugins, `prettier-plugin-tailwindcss`

<br>

## Frontend evolution and architecture

- **Follow the phased frontend roadmap:** build frontend features progressively—starting with static components and local mock data (Phase 1) before wiring up real API calls and error handling (Phases 2–4).
  - **Reference:** [`docs/claude/evolution_roadmap_frontend.md`](../../docs/claude/evolution_roadmap_frontend.md)
- **Mock-first staging:** build pages using typed placeholder data in `frontend/src/data/` first, then connect them to the real API. Delete the placeholder file once wired up.
- **API contract supremacy:** component props and placeholder data must strictly adhere to the defined API contract. If the UI requires a field the contract lacks, flag the conflict rather than altering the contract or inventing unofficial fields.
- **Form validation:** rely primarily on native HTML5 attributes (`required`, etc.) rather than heavy external validation libraries.
  - **Reference:** [`.claude/rules/validation_frontend.md`](../../.claude/rules/validation_frontend.md)
- **Accessibility (WCAG AA):** state plainly whenever a proposed or existing Tailwind colour pair fails WCAG AA contrast minimums.

<br>

## Data fetching and error handling

- **API layer isolation:** define data interfaces (e.g., `interface Post`) and one `fetch` function per endpoint inside `frontend/src/api/`. Page components call these functions and never invoke `fetch()` directly.
- **`async/await` with `try/catch`:** use readable asynchronous syntax for all data fetching.
- **`response.ok` validation:** API functions must check `!response.ok` and throw an error for 4xx/5xx HTTP responses (since `fetch()` does not throw on bad status codes by default).
- **Error propagation & UI display:** API functions throw errors; page components catch them, store the message in state, and render it as plain text or an inline text banner.
- **Error type differentiation:** catch blocks distinguish between network/offline failures (`TypeError`) and server status errors to provide clear feedback.

- **Reference:** [`.claude/rules/error_handling_frontend.md`](../../.claude/rules/error_handling_frontend.md)

<br>

## Code conventions

| Rule                                                                                                                                                                                                                                                                                                                                                                                                                                            | Example in this app                                                                                      |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **`interface` for object shapes:** props and data items, also props that extend HTML attributes (`extends`)                                                                                                                                                                                                                                                                                                                                     | `interface Post`, `interface PostCardProps`                                                              |
| **Interface names:** `<Component>Props` for a component's props; a noun for one data item                                                                                                                                                                                                                                                                                                                                                       | `ButtonProps`, `PostCardProps`; `Post`, `NavLink`                                                        |
| **`type` for the rest** (those that make more sense defined in one line, e.g. function types and unions)                                                                                                                                                                                                                                                                                                                                        | `type ButtonVariant = 'primary' \| 'secondary' \| 'tertiary'`                                            |
| **Typed constant lists:** `UPPER_SNAKE_CASE`, at the top of the file                                                                                                                                                                                                                                                                                                                                                                            | `const NAV_LINKS: NavLink[] = [{ label: 'About', to: '/about' }, …]`                                     |
| **Shared Tailwind class constants:** `UPPER_SNAKE_CASE` `const` strings at the top of the file when utility class lists repeat on two or more elements                                                                                                                                                                                                                                                                                          | `const LABEL_STYLE = 'flex flex-col gap-2 font-medium'`, <br>`const INPUT_STYLE = 'rounded-xl border …'` |
| **Lookup objects instead of `if` or `switch`**                                                                                                                                                                                                                                                                                                                                                                                                  | `BUTTON_STYLE[variant]`                                                                                  |
| **Boolean names start with `is`**                                                                                                                                                                                                                                                                                                                                                                                                               | `isEditing` in `<PostForm>` (edit or new)                                                                |
| **Main component shape:** one `export default function Name({ … }: NameProps)` per file                                                                                                                                                                                                                                                                                                                                                         | `export default function PostCard({ post }: PostCardProps)`                                              |
| **Default values in the props**                                                                                                                                                                                                                                                                                                                                                                                                                 | `function Button({ variant = 'primary', … }: ButtonProps)`                                               |
| **File-local sub-components & helpers:** small, single-file arrow functions (`const`) above the main component (with `<SubComponent>Props` when taking props). Extract when:<br>• a JSX block or UI control is repeated 2+ times in the file,<br>• UI needs its own local handler or accessibility attributes, or<br>• it keeps main component's JSX focused on layout/data flow.<br>_Move to its own file only when a second file imports it._ | `const PostMeta = ({ date }: PostMetaProps) => ( … )`,<br>`const RequiredMark = () => ( … )`             |
| **Event handlers:** `handle…` for the function, `on…` for the prop that receives it                                                                                                                                                                                                                                                                                                                                                             | `const handleSubmit = …`; `<form onSubmit={handleSubmit}>`                                               |
| **Lists with `.map()`:** `key` comes from data, never from array index _(Why: prevents React from mismatching cards when items are added/deleted)_                                                                                                                                                                                                                                                                                              | `posts.map((post) => <PostCard key={post.id} post={post} />)`                                            |
| **Yes-or-no cases with a ternary in JSX**                                                                                                                                                                                                                                                                                                                                                                                                       | `posts.length === 0 ? <p>No posts yet.</p> : …`                                                          |

<br>

## Styling and theme

- **Reference:**
  - [brand_style_guide.md](../../docs/claude/brand_style_guide.md)
  - [ui_specifications.md](../../docs/claude/ui_specifications.md)
  - [ui_visual_identity.md](./ui_visual_identity.md)
- **Only these files set the styling:** take colours, fonts, spacing and button styles from `ui_specifications.md` and `ui_visual_identity.md`. The Tailwind classes in code examples elsewhere (roadmaps, error handling and validation rules) only illustrate the logic.

<br>

## Official documentation

- Always rely on the official documentation for React, React Router, Vite and Tailwind CSS (secondary, reliable references such as MDN are acceptable).
