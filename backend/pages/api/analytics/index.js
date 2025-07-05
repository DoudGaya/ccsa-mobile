import prisma from '../../../lib/prisma';
import { authMiddleware } from '../../../lib/auth';

// GET /api/analytics - Get analytics data
export default authMiddleware(async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { period = 'all', agentId } = req.query;

    // Base where clause
    let whereClause = {
      status: 'active',
    };

    // Filter by agent if specified
    if (agentId) {
      whereClause.agentId = agentId;
    }

    // Filter by period
    if (period !== 'all') {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        whereClause.createdAt = {
          gte: startDate,
        };
      }
    }

    // Get all farmers for analytics
    const farmers = await prisma.farmer.findMany({
      where: whereClause,
      include: {
        referees: true,
        certificates: true,
      },
    });

    // Calculate analytics
    const analytics = {
      totalFarmers: farmers.length,
      
      // Gender distribution
      genderDistribution: farmers.reduce((acc, farmer) => {
        const gender = farmer.gender || 'unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {}),

      // Age groups
      ageGroups: farmers.reduce((acc, farmer) => {
        if (farmer.dateOfBirth) {
          const age = new Date().getFullYear() - new Date(farmer.dateOfBirth).getFullYear();
          if (age >= 18 && age <= 30) acc['18-30'] = (acc['18-30'] || 0) + 1;
          else if (age >= 31 && age <= 45) acc['31-45'] = (acc['31-45'] || 0) + 1;
          else if (age >= 46 && age <= 60) acc['46-60'] = (acc['46-60'] || 0) + 1;
          else if (age > 60) acc['60+'] = (acc['60+'] || 0) + 1;
        }
        return acc;
      }, {}),

      // State distribution
      stateDistribution: farmers.reduce((acc, farmer) => {
        const state = farmer.state || 'Unknown';
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      }, {}),

      // Crop distribution
      cropDistribution: farmers.reduce((acc, farmer) => {
        if (farmer.primaryCrop) {
          acc[farmer.primaryCrop] = (acc[farmer.primaryCrop] || 0) + 1;
        }
        return acc;
      }, {}),

      // Monthly registrations
      monthlyRegistrations: farmers.reduce((acc, farmer) => {
        const month = new Date(farmer.createdAt).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {}),

      // Average farm size
      averageFarmSize: (() => {
        const farmSizes = farmers
          .filter(farmer => farmer.farmSize)
          .map(farmer => farmer.farmSize);
        return farmSizes.length > 0 
          ? farmSizes.reduce((sum, size) => sum + size, 0) / farmSizes.length 
          : 0;
      })(),

      // Bank distribution
      bankDistribution: farmers.reduce((acc, farmer) => {
        if (farmer.bankName) {
          acc[farmer.bankName] = (acc[farmer.bankName] || 0) + 1;
        }
        return acc;
      }, {}),

      // Certificates issued
      certificatesIssued: farmers.reduce((acc, farmer) => {
        return acc + farmer.certificates.length;
      }, 0),

      // Registration trends (last 12 months)
      registrationTrends: await getRegistrationTrends(whereClause),
    };

    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

async function getRegistrationTrends(baseWhereClause) {
  const trends = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const count = await prisma.farmer.count({
      where: {
        ...baseWhereClause,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    trends.push({
      month: startDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
      count,
    });
  }

  return trends;
}
