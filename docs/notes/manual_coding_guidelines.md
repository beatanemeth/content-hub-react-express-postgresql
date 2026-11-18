# Coding guidelines

Part of [NOTES.md](../../NOTES.md).

<br>

## Code style

The project uses **ESLint**, **Prettier**, **Husky** and **lint-staged** to keep the code consistent. Every commit is linted and formatted automatically.

This manual sets the tools up in the root `package.json`, next to Express, in the first layout. Since the [move to `backend/`](../../NOTES.md#8-move-the-backend-into-backend), ESLint, `eslint.config.js`, the `lint` scripts and the ESLint lint-staged task live in `backend/`; Prettier, Husky and lint-staged stay in the root.

<br>

## Tools and their purpose

| Package                                                                                               | Role              | Purpose                                                                                                |
| ----------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| [ESLint](https://eslint.org/)                                                                         | The logic police  | Finds code-quality problems and likely bugs, such as unused variables.                                 |
| [@eslint/js](https://www.npmjs.com/package/@eslint/js)                                                | Base rules        | ESLint's recommended JavaScript rules.                                                                 |
| [typescript-eslint](https://typescript-eslint.io/)                                                    | Translator        | Lets ESLint parse TypeScript and adds TypeScript-specific rules.                                       |
| [globals](https://www.npmjs.com/package/globals)                                                      | Environment       | Tells ESLint which Node.js global variables exist, such as `process` and `console`.                    |
| [eslint-plugin-unused-imports](https://www.npmjs.com/package/eslint-plugin-unused-imports)            | The clean-up crew | Warns about unused imports while coding; `eslint --fix` removes them on commit.                        |
| [Prettier](https://prettier.io/)                                                                      | The stylist       | Formats the code according to the rules in `.prettierrc.json`.                                         |
| [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier)                        | The mediator      | Turns off the ESLint rules that format code, so ESLint checks quality and Prettier handles formatting. |
| [prettier-plugin-organize-imports](https://github.com/simonhaenisch/prettier-plugin-organize-imports) | The librarian     | Sorts and groups import statements.                                                                    |
| [Husky](https://typicode.github.io/husky/)                                                            | The gatekeeper    | Runs scripts on Git hooks, such as `pre-commit`.                                                       |
| [lint-staged](https://www.npmjs.com/package/lint-staged)                                              | The sniper        | Runs ESLint and Prettier on staged files only.                                                         |

<br>

## Step 1: create the root `package.json`

The repository root has no `package.json` yet. Create it in the root:

```bash
npm init -y
```

Keep only the fields the project needs (`name`, `version`, `private`, `type`, `scripts`, `devDependencies`, `lint-staged`, `volta`).

- **`private`:** set it to `true`, so the package can never be published.
- **`type`:** set it to `"module"`, so Node.js treats `.js` files as ES modules. `npm init -y` writes `"commonjs"`.
- **`version`:** equal to the latest Git tag.
- **`volta`:** pin the Node.js version; Volta reads it from `package.json`:

```bash
volta pin node@24.14.0
```

<br>

## Step 2: configure Prettier and additional plugins

- install npm packages in the root:

```bash
npm install --save-dev --save-exact prettier prettier-plugin-organize-imports
```

- install TypeScript in the root:

```bash
npm install --save-dev typescript@~6.0.3
```

`prettier-plugin-organize-imports` sorts imports with TypeScript's language service. Without TypeScript installed, npm installs the latest version as a peer dependency (7.x), which has no `createLanguageService` function; the plugin then does nothing and shows no error. The same TypeScript 6 install serves ESLint (Step 3) and the Express code.

- create a `.prettierrc.json` file in the root and add [Prettier options](https://prettier.io/docs/en/options.html):

```json
{
  "singleQuote": true,
  "plugins": ["prettier-plugin-organize-imports"],
  "organizeImportsSkipDestructiveCodeActions": true
}
```

- create a `.prettierignore` file in the root; here, pass in the files Prettier should avoid when formatting your code. Prettier 3 already skips everything in `.gitignore`, such as `node_modules/`, `dist/` and `brainstorming/`.

```text
package-lock.json
```

- **`package-lock.json`:** npm writes it, so the next `npm install` would undo any formatting.

- add the scripts to `package.json`:

```json
"scripts": {
  "prettier": "prettier --check .",
  "prettier:format": "prettier --write ."
}
```

- format the existing files once, then commit the result on its own as `style: format files with Prettier`:

```bash
npm run prettier:format
```

A separate commit keeps the formatting changes apart from the configuration changes, so each diff stays readable.

**Notes:**

- `organizeImportsSkipDestructiveCodeActions` is enabled to prevent destructive code actions (like removing unused imports). Removing them is the job of `eslint-plugin-unused-imports`.
- `--save-exact` pins Prettier and its plugin to one version, because a new minor version can format the same code differently.

<br>

## Step 3: configure ESLint

- install the packages in the root:

```bash
npm install --save-dev eslint @eslint/js typescript-eslint globals eslint-config-prettier eslint-plugin-unused-imports
```

`typescript-eslint` parses `.ts` files with TypeScript's JavaScript API. TypeScript 7 has no such API, so the project stays on TypeScript 6 (Step 2).

- create `eslint.config.js` in the root:

```JavaScript
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
```

- add the scripts to `package.json`:

```json
"lint": "eslint .",
"lint:prettier-conflicts": "eslint-config-prettier src/server.ts"
```

**Notes:**

- `eslintConfigPrettier` must be the **last** entry, so it can turn off any formatting rule enabled before it.
- `globals.node` declares the Node.js globals.
- `args: 'after-used'` reports only the unused arguments after the last used one. An Express error handler keeps all four parameters `(err, req, res, next)`, because Express recognises it by the parameter count. Name an unused one with a leading underscore (`_next`), so `argsIgnorePattern: '^_'` skips it.

<br>

## Step 4: set up Husky and lint-staged

Husky needs a Git repository: run `git init` first if the folder has no `.git/`.

- installation in the root:

```bash
npm install --save-dev husky lint-staged
```

- setting up Husky in the project (root):

```bash
npx husky init
```

`husky init` adds `"prepare": "husky"` to `package.json` and creates `.husky/pre-commit`. The `prepare` script runs on every `npm install` and sets `core.hooksPath` to `.husky/_`.

- inside `.husky/pre-commit` replace `npm test` with `npx lint-staged`:

```bash
npx lint-staged
```

- move the existing merge-message hook from `.githooks/` to Husky, then delete `.githooks/`. Git runs a hook only if its file name is exactly `prepare-commit-msg` (with hyphens):

```bash
git mv .githooks/prepare-commit-msg .husky/prepare-commit-msg
rmdir .githooks
```

**Notes:**

- Husky runs each hook with `sh`, so hook files in `.husky/` need no executable bit.

[Installation and setup](https://www.npmjs.com/package/lint-staged#installation-and-setup)

- add the following to `package.json`:

```json
"lint-staged": {
  "*.{js,ts}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yaml,yml}": [
    "prettier --write"
  ]
}
```

Both YAML extensions are listed: the project uses `.yaml`, but other tools may create `.yml` files (for example, GitHub Actions workflows in `.github/workflows/`).

The `npx lint-staged` command **runs** the lint-staged tasks **when committing**. This ensures that the **code is formatted according to the rules defined** and that the **code is free from any linting issues**.

<br>

## Verify the setup

Run checks 1 and 4 in the root, and checks 2 and 3 in `backend/`. Check 2 lints TypeScript only when `src/` holds a `.ts` file; before that, it lints only `eslint.config.js`.

1. **Prettier:** checks the formatting and the `organize-imports` plugin.

   ```bash
   npm run prettier
   ```

   Expected output: _"All matched files use Prettier code style!"_. If files are listed, format them with `npm run prettier:format`. See the [Prettier CLI](https://prettier.io/docs/cli) for details.

2. **ESLint:** checks that `eslint.config.js` is valid and the code has no problems.

   ```bash
   npm run lint
   ```

   Expected output: only the echoed command, with no errors or warnings.

3. **eslint-config-prettier:** checks that no ESLint rule conflicts with Prettier.

   ```bash
   npm run lint:prettier-conflicts
   ```

   Expected output: _"No rules that are unnecessary or conflict with Prettier were found."_

4. **lint-staged:** stage one `.ts` file and one `.md` file, then run lint-staged directly, without committing.

   ```bash
   npx lint-staged
   ```

   Expected output: lint-staged lists the tasks for each matching pattern and marks each task as completed. On a real commit, the pre-commit hook runs the same tasks before the commit is created.

5. **Husky:** checks that Git uses Husky's hook folder.

   ```bash
   git config core.hooksPath
   ```

   Expected output: `.husky/_`.
