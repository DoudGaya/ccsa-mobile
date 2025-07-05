export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>CCSA Mobile Backend API</h1>
      <p>The backend API for the Farmers Information Management System (FIMS) is running.</p>
      
      <h2>Available Endpoints:</h2>
      <ul>
        <li><strong>Authentication:</strong>
          <ul>
            <li>POST /api/auth/login - Agent login</li>
            <li>POST /api/auth/register - Agent registration</li>
          </ul>
        </li>
        <li><strong>Farmers:</strong>
          <ul>
            <li>GET /api/farmers - List farmers</li>
            <li>POST /api/farmers - Create farmer</li>
            <li>GET /api/farmers/:id - Get farmer details</li>
            <li>PUT /api/farmers/:id - Update farmer</li>
            <li>DELETE /api/farmers/:id - Delete farmer</li>
            <li>GET /api/farmers/search - Search farmers</li>
            <li>GET /api/farmers/validate - Validate unique fields</li>
          </ul>
        </li>
        <li><strong>Certificates:</strong>
          <ul>
            <li>GET /api/certificates - List certificates</li>
            <li>POST /api/certificates - Generate certificate</li>
          </ul>
        </li>
        <li><strong>Analytics:</strong>
          <ul>
            <li>GET /api/analytics - Get analytics data</li>
          </ul>
        </li>
        <li><strong>External Services:</strong>
          <ul>
            <li>GET /api/nin/lookup - NIN lookup service</li>
          </ul>
        </li>
      </ul>
      
      <h2>Setup Instructions:</h2>
      <ol>
        <li>Copy .env.example to .env and configure your environment variables</li>
        <li>Set up your PostgreSQL database (NeonDB recommended)</li>
        <li>Run: npx prisma generate</li>
        <li>Run: npx prisma db push</li>
        <li>Start the development server: npm run dev</li>
      </ol>
    </div>
  )
}
