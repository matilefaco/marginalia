import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usernameIndexTable } from "@workspace/db";

const router: IRouter = Router();

/**
 * POST /api/auth/register-username
 * Called during signup to persist the username→email mapping server-side.
 * Body: { username, email, userId }
 */
router.post("/register-username", async (req, res) => {
  const { username, email, userId } = req.body as {
    username?: string;
    email?: string;
    userId?: string;
  };

  if (!username || !email || !userId) {
    return res.status(400).json({ error: "username, email and userId are required" });
  }

  const clean = username.toLowerCase().replace(/^@/, "").trim();

  try {
    await db
      .insert(usernameIndexTable)
      .values({ username: clean, email: email.toLowerCase().trim(), userId })
      .onConflictDoUpdate({
        target: usernameIndexTable.username,
        set: { email: email.toLowerCase().trim(), userId },
      });
    res.json({ ok: true });
  } catch (e) {
    console.error("[auth] register-username error:", e);
    res.status(500).json({ error: "Failed to register username" });
  }
});

/**
 * POST /api/auth/resolve-username
 * Called during login to find the email for a given username.
 * Body: { username }
 * Returns: { email } or 404
 *
 * Security note: This endpoint intentionally reveals which usernames exist
 * (and their associated emails), which is standard behavior for apps that
 * support username login. The actual authentication remains protected by
 * Supabase's signInWithPassword, which requires the correct password.
 */
router.post("/resolve-username", async (req, res) => {
  const { username } = req.body as { username?: string };

  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  const clean = username.toLowerCase().replace(/^@/, "").trim();

  try {
    const [row] = await db
      .select({ email: usernameIndexTable.email })
      .from(usernameIndexTable)
      .where(eq(usernameIndexTable.username, clean))
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json({ email: row.email });
  } catch (e) {
    console.error("[auth] resolve-username error:", e);
    res.status(500).json({ error: "Failed to resolve username" });
  }
});

export default router;
