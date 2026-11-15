# Rules: commits, branches and pull requests

| Item                    | Standard                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Commit messages**     | [Conventional Commits](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13) |
| **Branch names**        | [Conventional Branch](https://conventionalbranch.org/)                                  |
| **Pull request titles** | The same format as a commit message                                                     |

<br>

## Commit messages

```text
<type>(<optional scope>): <description>
```

- **Subject line only:** no body, no footer, no trailers (including `Co-Authored-By`).
- **Description:** imperative, present tense ("add", not "added"); lowercase first letter; no full stop at the end.
- **Breaking change:** add `!` before the colon (for example, `feat!: rename /posts to /articles`). Explain it in the pull request description.
- **Revert commits:** keep Git's default subject (`Revert "<reverted commit subject line>"`).

### Spelling

Only the first letter of the description is lowercase. Every other word keeps its normal case.

| Word kind         | Rule                                | Example                                          |
| ----------------- | ----------------------------------- | ------------------------------------------------ |
| **File names**    | Exactly as on disk (case-sensitive) | `docs: add README.md`                            |
| **Proper nouns**  | Official spelling                   | `build: upgrade Express to 5.2`                  |
| **Abbreviations** | Uppercase                           | `feat: add JSON body parsing`                    |
| **Identifiers**   | Exactly as in the code              | `feat: add notFoundHandler middleware`           |
| **Disciplines**   | Capitalised, as in `writer_docs.md` | `docs: describe the Data Engineering side track` |
| **Other words**   | Lowercase                           | `feat: add health check endpoint`                |

- **Start with a verb:** an imperative verb (`add`, `fix`, `rename`) as the first word avoids any clash with a proper noun or file name.
- **No backticks:** plain text with the exact case is enough.
- **British English:** as in `writer_british_english.md` (e.g., _optimise_, _behaviour_).

### Types

| Type       | Use for                                                            |
| ---------- | ------------------------------------------------------------------ |
| `feat`     | A new capability: routes, middleware, error handlers               |
| `fix`      | A bug fix in a previously added feature                            |
| `refactor` | Restructuring without a behaviour change                           |
| `perf`     | A refactor that improves performance                               |
| `style`    | Formatting only (for example, Prettier)                            |
| `test`     | Adding or correcting tests                                         |
| `docs`     | Documentation only                                                 |
| `build`    | Dependencies, `package.json`, `package-lock.json`, `tsconfig.json` |
| `ops`      | CI workflows, linter and formatter settings                        |
| `chore`    | Maintenance: `.gitignore`, housekeeping                            |

### Scopes

Optional. Use the scope of the top-level folder the commit changes.

| Scope      | Covers                  |
| ---------- | ----------------------- |
| `backend`  | `backend/`              |
| `frontend` | `frontend/`             |
| `claude`   | `CLAUDE.md`, `.claude/` |

Never use an issue number as a scope.

### Preparing a commit

Use `/commit`. It shows the commands in one code block, then runs them; each one asks for the maintainer's approval (an **ask** rule in `settings.json`).

```bash
git add <path> <path>
git commit -m "chore(claude): add Claude rules and settings"
```

- **Stage by path:** name each file or folder. Never `git add .`, `git add -A` or `git commit -a`.
- **One logical change per commit:** if the changes have different types or scopes, give one pair of commands per group.
- **Never stage:** `.env` files, `node_modules/`, `.claude/settings.local.json`.

<br>

## Branches

```text
<type>/<description>
```

- **Types:** `feature/` for new capabilities, `fix/` for bug fixes, `chore/` for everything else. Choose by the branch's main purpose; the commits inside keep their own types.
- **Description:** lowercase letters, digits and hyphens only.

| Work                                        | Branch                                          | Commit types inside |
| ------------------------------------------- | ----------------------------------------------- | ------------------- |
| **Claude set-up**                           | `chore/claude-setup`                            | `chore(claude)`     |
| **Project set-up** (package.json, tsconfig) | `chore/project-init`                            | `build`, `feat`     |
| **Coding style** (ESLint, Prettier, Husky)  | `chore/code-style`                              | `build`, `ops`      |
| **Documentation**                           | `chore/readme`                                  | `docs`              |
| **Dependency upgrade**                      | `chore/upgrade-express`                         | `build`             |
| **Refactor**                                | `chore/split-app-and-server`                    | `refactor`          |
| **Routes and middleware**                   | `feature/posts-routes`, `feature/error-handler` | `feat`              |
| **Bug fix**                                 | `fix/post-id-parsing`                           | `fix`               |

- **One topic per branch:** one branch and one pull request per topic. Never commit on `main`.

<br>

## Pull requests

- **Title:** a commit subject line (for example, `feat: add CRUD routes for posts`).
- **Merge commit title:** `chore: merge PR#<number> from <branch>` (for example, `chore: merge PR#4 from feature/posts-routes`).

### Description

- **Keep it concise:** write a 1–2 sentence summary explaining what changed and why. Avoid multi-heading essays or repeating rationale already documented in the code or commit history.
- **Omit blast-radius notes:** do not include boilerplate warnings (e.g., _"Blast radius: … please review the plan before un-drafting"_), even for sensitive environments or resources like `XX erepo`, IAM, production, or RDS. Flag any genuine caveats directly in chat instead.
- **Link related MRs:** include full URLs to all parallel or dependent merge requests.
- **Reference tickets at the end:** close out the description with `Closes [XXX-NNNNN](url)` (or `Refs [XXX-NNNNN](url)` if the MR does not resolve the ticket).
- **Attribution:** keep the "🤖 Generated with Claude Code" line.
