# TypeScript setup

<br>

## Set-up decisions

| Decision            | Choice                               | Reason                                                                             |
| ------------------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| How TypeScript runs | Node.js type stripping               | Node.js 24 runs `.ts` files directly, so there is no build step and no extra tool. |
| Type check          | `tsc --noEmit` (`npm run typecheck`) | Type stripping removes the types but does not check them.                          |
| Restart on change   | `node --watch`                       | It is built into Node.js, so `nodemon` is not needed.                              |

<br>

## Ways to run TypeScript

Node.js runs JavaScript. A `.ts` file contains type annotations, such as `(req: Request, res: Response)`, that JavaScript does not have. Something must handle them before Node.js runs the code.

- **Python comparison:** Python ignores type hints at runtime, and `mypy` checks them separately. Node.js used to reject type annotations completely, so a tool was always needed.

| Option                        | How it works                                                             | Commands                              | Extra dependency                         |
| ----------------------------- | ------------------------------------------------------------------------ | ------------------------------------- | ---------------------------------------- |
| **1. `tsc` build**            | The TypeScript compiler writes `.js` files to `dist/`; Node.js runs them | `npx tsc`, then `node dist/server.js` | `typescript`                             |
| **2. Node.js type stripping** | Node.js removes the annotations itself and runs the `.ts` file directly  | `node --watch src/server.ts`          | None to run (`typescript` only to check) |
| **3. `tsx`**                  | A small tool converts each file on the fly, then hands it to Node.js     | `npx tsx watch src/server.ts`         | `tsx`                                    |

- **Earlier project:** `content-platform-express` used option 1, which is why it has a `dist/` folder.
- **Type checking:** options 2 and 3 only remove types; they do not check them, so `tsc --noEmit` does (like `mypy`). Option 1 checks types while it compiles.

### Decision: option 2

The installed Node.js (v24.14.0) runs `.ts` files without any set-up; v22.18.0 or newer is needed. The server starts with one plain `node` command, so nothing sits between the maintainer and Express, and no runtime dependency is added.

The limits are small for this project:

- **Erasable syntax only:** TypeScript features that generate JavaScript, such as `enum` and `namespace`, do not work. The `erasableSyntaxOnly` setting reports them in the editor.
- **File extensions in imports:** write `import { app } from './app.ts'`, not `'./app'`.
- **Separate type check:** run `npm run typecheck`; CI runs it on every pull request.

<br>

## The npm scripts

The scripts in [`backend/package.json`](../../backend/package.json) that run and check the server:

| Script      | Command                                         | Purpose                                              |
| ----------- | ----------------------------------------------- | ---------------------------------------------------- |
| `dev`       | `node --env-file=../.env --watch src/server.ts` | Runs the server and restarts it when a file changes. |
| `start`     | `node --env-file=../.env src/server.ts`         | Runs the server once, without watching files.        |
| `typecheck` | `tsc --noEmit`                                  | Checks the types.                                    |

- **`--env-file=../.env`:** Node.js reads the database settings from the `.env` file in the repository root (see [Database setup](info_db_setup.md)).
- **No `test` script:** `npm init` adds a placeholder that always fails, and the project has no automated tests.
- **No `build` script:** Node.js runs the `.ts` files directly, so there is no `dist/` folder to build.
- **The `lint` scripts:** they belong to the coding guidelines (see [Coding guidelines](manual_coding_guidelines.md)).

<br>

## `tsconfig.json` settings

Node.js type stripping does not read [`backend/tsconfig.json`](../../backend/tsconfig.json). The settings make `tsc` and the editor report code that Node.js cannot run.

| Setting                              | Reason                                                                                                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"module": "nodenext"`               | `tsc` follows the module rules of Node.js for a `"type": "module"` package. It also sets `target`, so the file has no `target`.                                              |
| `"strict": true`                     | Strict checks are the default in TypeScript 6; the setting shows it without relying on the default.                                                                          |
| `"types": ["node"]`                  | TypeScript 6 loads no `@types` package by default; this adds the Node.js types.                                                                                              |
| `"noEmit": true`                     | `tsc` only checks; it writes no JavaScript files.                                                                                                                            |
| `"allowImportingTsExtensions": true` | It allows imports that end in `.ts`, which Node.js needs.                                                                                                                    |
| `"verbatimModuleSyntax": true`       | Node.js strips each file on its own, so it cannot tell whether an imported name is a type. Every type import needs `type`: `import type { Post }` or `import { type Post }`. |
| `"erasableSyntaxOnly": true`         | It reports syntax that Node.js cannot simply delete, such as `enum` and `namespace`.                                                                                         |
| `"include": ["src"]`                 | `tsc` checks only the server code, not files such as `eslint.config.js`.                                                                                                     |

<br>

## When a build is still needed

Type stripping covers this project. A `dist/` build is needed in these cases:

| Situation                                            | Reason                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Node.js is older than v22.18                         | Type stripping does not exist there.                                                       |
| Code uses `enum`, decorators or parameter properties | These need code generation (for example, NestJS).                                          |
| Publishing a library to npm                          | Node.js does not strip types inside `node_modules`; packages ship `.js` and `.d.ts` files. |
| Bundling or minifying                                | A bundler such as esbuild writes its own output folder.                                    |

To build a `dist/` folder, change `tsconfig.json`: replace `"noEmit": true` with `"outDir": "dist"`, and `allowImportingTsExtensions` with `"rewriteRelativeImportExtensions": true`, which rewrites `'./app.ts'` to `'./app.js'`. Then `tsc` builds, and `node dist/server.js` runs. The code in `src/` does not change.

<br>

## Docs

- [Node.js: TypeScript](https://nodejs.org/api/typescript.html)
- [TypeScript: tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
