import { query, initDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { user_id, delta, client_merit } = body;

    if (!user_id) {
      return Response.json({ error: "user_id is required" }, { status: 400 });
    }

    if (typeof delta !== "number" || delta < 0) {
      return Response.json({ error: "delta must be a non-negative number" }, { status: 400 });
    }

    // Get current server merit
    const userResult = await query(`SELECT merit FROM users WHERE id = $1`, [user_id]);

    if (userResult.rows.length === 0) {
      return Response.json({ error: "user not found" }, { status: 404 });
    }

    const serverMerit = Number(userResult.rows[0].merit);

    // Conflict resolution: server merit + client delta (increment-based merge)
    // If client sends both delta and client_merit, we use delta for increment merge.
    // The merged result = server_merit + delta
    const mergedMerit = serverMerit + delta;

    // Update user merit
    await query(
      `UPDATE users SET merit = $1, last_sync_merit = $1, updated_at = NOW() WHERE id = $2`,
      [mergedMerit, user_id]
    );

    // Log the sync
    await query(
      `INSERT INTO sync_log (user_id, delta, merit_before, merit_after) VALUES ($1, $2, $3, $4)`,
      [user_id, delta, serverMerit, mergedMerit]
    );

    // Determine if there was a conflict
    const conflict = typeof client_merit === "number" && client_merit !== mergedMerit;

    return Response.json({
      ok: true,
      server_merit: mergedMerit,
      delta_applied: delta,
      conflict,
      resolved_merit: mergedMerit,
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// GET: fetch current merit for a user
export async function GET(req: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return Response.json({ error: "user_id is required" }, { status: 400 });
    }

    const result = await query(`SELECT id, nickname, merit, updated_at FROM users WHERE id = $1`, [userId]);

    if (result.rows.length === 0) {
      return Response.json({ error: "user not found" }, { status: 404 });
    }

    const user = result.rows[0];
    return Response.json({
      ok: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        merit: Number(user.merit),
        updated_at: user.updated_at,
      },
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
