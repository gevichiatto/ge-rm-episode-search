<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent instructions

This repository has a project skill with all implementation rules.

Before doing ANY task:

1. Read `.agents/skills/rickmorty-episode-search/SKILL.md` completely.
2. Read `.agents/skills/rickmorty-episode-search/references/patterns.md` before writing code.
3. Work on ONE phase at a time. When the phase ends: run the gate, commit, report, and STOP.
4. Use pnpm only. Never npm, npx or yarn.
5. If you are stuck after two attempts, stop and show the exact error.
