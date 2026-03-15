import { query, initDB } from "@/lib/db";

// Simulates concurrent sync from two devices to verify conflict merge
export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { user_id, delta_a, delta_b } = body;

    if (!user_id || typeof delta_a !== "number" || typeof delta_b !== "number") {
      return Response.json({ error: "user_id, delta_a, delta_b required" }, { status: 400 });
    }

    // Get current
    const userResult = await query(`SELECT merit FROM users WHERE id = $1`, [user_id]);
    if (userResult.rows.length === 0) {
      return Response.json({ error: "user not found" }, { status: 404 });
    }

    const initialMerit = Number(userResult.rows[0].merit);

    // Apply delta_a
    const afterA = initialMerit + delta_a;
    await query(`UPDATE users SET merit = $1, updated_at = NOW() WHERE id = $2`, [afterA, user_id]);

    // Apply delta_b on top (simulating second device sync arriving after first)
    const afterB = afterA + delta_b;
    await query(`UPDATE users SET merit = $1, updated_at = NOW() WHERE id = $2`, [afterB, user_id]);

    return Response.json({
      ok: true,
      initial_merit: initialMerit,
      after_device_a: afterA,
      after_device_b: afterB,
      total_delta: delta_a + delta_b,
      final_merit: afterB,
      merge_correct: afterB === initialMerit + delta_a + delta_b,
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
