export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple analytics without authentication for now
    const mockStats = {
      totalFarmers: 150,
      farmersThisMonth: 25,
      farmersThisWeek: 8,
      farmersToday: 2,
      topCrops: [
        { crop: 'Rice', count: 45 },
        { crop: 'Cassava', count: 32 },
        { crop: 'Yam', count: 28 },
        { crop: 'Maize', count: 25 },
        { crop: 'Beans', count: 20 }
      ]
    };

    res.status(200).json(mockStats);
  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
