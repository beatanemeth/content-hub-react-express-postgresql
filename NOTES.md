# Notes

This file is the build log: the commands, files and checks, in the order the project was built.

<br>

## Goal

The project teaches how an **Express** server is set up in **TypeScript** by building a small JSON REST API. The data is stored in **PostgreSQL**, and a **React** frontend comes later.

<br>

## Out of scope

- **Sign-in and sign-up:** there is none; every staff member may create, edit and delete posts.
- **Protected routes:** no page or endpoint checks who is calling.
- **Detailed input validation:** the browser checks only that each field is filled in (`required`), and the API checks only that `title`, `summary` and `body` are non-empty strings and that `author_id`, `category_ids` and `tag_ids` hold numbers (otherwise it answers `400`). A non-numeric post id is not validated; it matches no post and returns `404`. The database still enforces its own rules, such as unique labels and required columns.
- **Error screens:** the UI shows the API's error message as plain text. There are no error pages, toast messages or retry buttons.
- **Pages beyond the blog:** About, Events, Contact and the footer links show the not-found page.
- **Mobile layout:** the UI is designed for desktop screens only.
- **Automated tests:** the endpoints are checked by hand with `blog.http`.
- **Deployment:** the app runs only on a local machine.

<br>

**Build log steps in development order**

## 1. Local Git setup

Run once after cloning, so local merges into `main` create a merge commit (like merging a PR on GitHub) while `git pull` still fast-forwards:

```bash
git config merge.ff false   # merges always create a merge commit
git config pull.ff only     # pulls only fast-forward, with no extra merge commits
npm install                 # sets core.hooksPath to .husky/_ (see step 3)
```

The `prepare-commit-msg` hook rewrites merge messages to `chore: merge branch '<name>'`. It started in `.githooks/` and moved to `.husky/` during coding guidance setup.

**Notes:**

- **File name:** Git runs a hook only if its file name matches the hook name exactly, with hyphens (`prepare-commit-msg`). Git ignores a file named `prepare_commit_msg` and shows no error.
- **Location:** Git looks for hooks in `.git/hooks/` by default. `core.hooksPath` points it to another folder, here `.husky/_/`.
- **Permissions:** Git runs a hook file only if it is executable (`chmod +x`). Husky's wrappers in `.husky/_/` are executable; they run the scripts in `.husky/` with `sh`, so those scripts need no executable bit.

<br>

## 2. Add project guide for Claude Code

<br>

## 3. Coding guidelines

The project uses **ESLint**, **Prettier**, **Husky** and **lint-staged** to keep the code consistent. Every commit is linted and formatted automatically.

See the set-up manual: [Coding guidelines](docs/notes/manual_coding_guidelines.md).

- **Files:** `package.json`, `.prettierrc.json`, `.prettierignore`, `eslint.config.js`, `.husky/pre-commit` and `.husky/prepare-commit-msg`.
- **Hook move:** `prepare-commit-msg` moved from `.githooks/` to `.husky/`. The `prepare` script (`husky`) sets `core.hooksPath` to `.husky/_` on every `npm install`.
- **Checks:** `npm run prettier`, `npm run lint`, `npm run lint:prettier-conflicts`, `npx lint-staged` and `git config core.hooksPath`. The manual lists the expected output of each.
- **Known audit warning:** `npm audit` reports 7 moderate warnings from one `minimatch` advisory inside `typescript-eslint`. It affects only a local dev tool. `npm audit fix --force` would downgrade `typescript-eslint` to 8.36.0, so it is not run.
