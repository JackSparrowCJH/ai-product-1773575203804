import { query, initDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await initDB();
    const body = await req.json();
    const { user_id, nickname } = body;

    if (!user_id) {
      return Response.json({ error: "user_id is required" }, { status: 400 });
    }

    const name = nickname || "游客";
    const isGuest = !nickname || nickname === "游客";
    const mode = isGuest ? "guest" : "authorized";

    // Upsert user
    const result = await query(
      `INSERT INTO users (id, nickname, merit)
       VALUES ($1, $2, 0)
       ON CONFLICT (id) DO UPDATE SET nickname = COALESCE(NULLIF($2, '游客'), users.nickname), updated_at = NOW()
       RETURNING id, nickname, merit, created_at, updated_at`,
      [user_id, name]
    );

    const user = result.rows[0];

    return Response.json({
      ok: true,
      mode,
      user: {
        id: user.id,
        nickname: user.nickname,
        merit: Number(user.merit),
      },
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
