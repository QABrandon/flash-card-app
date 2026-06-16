# Claude Code — Best Practices

Quick habits that keep Claude fast, focused, and on-budget.

---

- **Start new chats often** — each new chat resets context. Long conversations drift and get expensive. New chat = fresh start.

- **Monitor your usage** — check your token/credit usage so you don't get cut off mid-feature. Pause before starting something big if you're running low.

- **Context check — compact or start fresh at 60–75%** — run `/context` to see how full your context window is. When you hit ~60–75%, either run `/compact` to summarize and trim, or just open a new chat.

- **Use a harness for feature development** — tools like [Superpowers](https://superpowers.ai) or the quick-superpowers workflow guide Claude through planning before it builds. Skipping this leads to code that misses the spec.

- **Keep CLAUDE.md under 200 lines** — Claude reads this every chat. The shorter and clearer it is, the more consistently Claude follows it. Trim anything that's no longer true.

- **Explore loop mode for overnight builds** — Claude Code's `/loop` command can run autonomously on a schedule. Look into using it securely (sandboxed, scoped tasks, review in the morning) to build features while you sleep.

- **Check what's loaded with `/context`** — run this to see which memories, CLAUDE.md, and other files Claude has in scope. If something important is missing, add it before you start.
