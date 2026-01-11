export default function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>🚀 Odyssey Backend API</h1>
      <p>Backend server is running successfully!</p>
      <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Available Endpoints:</h2>
        <ul>
          <li><strong>GET</strong> /api/health - Health check</li>
          <li><strong>POST</strong> /api/users - Initialize user</li>
          <li><strong>GET</strong> /api/streaks - Get user streaks</li>
          <li><strong>POST</strong> /api/streaks - Save streak data</li>
          <li><strong>POST</strong> /api/streaks/reset - Reset user data</li>
          <li><strong>GET</strong> /api/streaks/export - Export user data</li>
        </ul>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          All endpoints (except /health) require Clerk authentication
        </p>
      </div>
    </div>
  );
}
