<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Build & verify

- `npm run build` — Production build
- `npm run lint` — Lint with ESLint
- `npm run test` — Run tests with Vitest
- `npm run typecheck` — Run TypeScript type checking (or `npx tsc --noEmit`)

# Deploy

- `npx vercel` — Preview deploy (creates a preview URL)
- `npx vercel --prod` — Production deploy (aliases to `preweek.vercel.app`)
- Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) must be set on Vercel via `vercel env add <key> production < value.txt` or the dashboard
- Never commit `.env.local` — it is gitignored

# Git workflow

- `git add . && git commit -m "msg" && git push origin main` — Commit all changes and push to GitHub
- Remote: `https://github.com/cg99/preweek.git` (HTTPS — requires personal access token for non-interactive pushes)
