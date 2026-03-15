export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h1>🪵 敲木鱼 - Auth &amp; Sync API</h1>
      <p>登录与数据同步模块</p>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>API Endpoints</h2>
        <ul style={{ lineHeight: 2 }}>
          <li><code>GET /api/health</code> — 健康检查</li>
          <li><code>POST /api/init-db</code> — 初始化数据库表</li>
          <li><code>POST /api/auth/login</code> — 授权登录 (user_id, nickname)</li>
          <li><code>POST /api/auth/guest</code> — 游客模式登录</li>
          <li><code>GET /api/sync?user_id=xxx</code> — 查询功德</li>
          <li><code>POST /api/sync</code> — 增量同步功德 (user_id, delta, client_merit?)</li>
          <li><code>POST /api/sync/conflict-test</code> — 冲突合并测试 (user_id, delta_a, delta_b)</li>
        </ul>
      </section>
    </main>
  );
}
