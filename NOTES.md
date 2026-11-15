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
git config core.hooksPath .githooks   # merge messages become "chore: merge branch '<name>'"
```

**Notes:**

- **File name:** Git runs a hook only if its file name matches the hook name exactly, with hyphens (`prepare-commit-msg`). Git ignores a file named `prepare_commit_msg` and shows no error.
- **Location:** Git looks for hooks in `.git/hooks/` by default. `core.hooksPath` points it to another folder, here `.githooks/`.
- **Permissions:** the hook file must be executable (`chmod +x`).
