import { query, initDB } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST() {
  try {
    await initDB();
    const guestId = `guest_${randomUUID()}`;

    await query(
      `INSERT INTO users (id, nickname, merit) VALUES ($1, '游客', 0)`,
      [guestId]
    );

    return Response.json({
      ok: true,
      mode: "guest",
      user: { id: guestId, nickname: "游客", merit: 0 },
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
