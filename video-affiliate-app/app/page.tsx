export default function HomePage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Video Affiliate App</h1>
      <p>AI-powered video analysis and automated Facebook posting</p>
      <a href="/dashboard" style={{ 
        display: 'inline-block', 
        padding: '10px 20px', 
        backgroundColor: '#0070f3', 
        color: 'white', 
        textDecoration: 'none',
        borderRadius: '5px',
        margin: '10px'
      }}>
        Go to Dashboard
      </a>
    </div>
  );
}