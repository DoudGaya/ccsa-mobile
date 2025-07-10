import { authMiddleware } from '../../../lib/authMiddleware';
import { prisma } from '../../../lib/prisma';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const agentId = req.user.uid;

    // Get total farmers count for this agent
    const totalFarmers = await prisma.farmer.count({
      where: { agentId }
    });

    // Get total farms count for this agent's farmers
    const totalFarms = await prisma.farm.count({
      where: {
        farmer: {
          agentId
        }
      }
    });

    // Get farmers registered this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const farmersThisMonth = await prisma.farmer.count({
      where: {
        agentId,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // Get farmers registered this week
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const farmersThisWeek = await prisma.farmer.count({
      where: {
        agentId,
        createdAt: {
          gte: startOfWeek
        }
      }
    });

    // Get farmers registered today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const farmersToday = await prisma.farmer.count({
      where: {
        agentId,
        createdAt: {
          gte: startOfDay
        }
      }
    });

    // Get top crops for this agent's farmers
    const topCrops = await prisma.farm.groupBy({
      by: ['cropType'],
      where: {
        farmer: {
          agentId
        },
        cropType: {
          not: null
        }
      },
      _count: {
        cropType: true
      },
      orderBy: {
        _count: {
          cropType: 'desc'
        }
      },
      take: 5
    });

    const formattedTopCrops = topCrops.map(crop => ({
      crop: crop.cropType,
      count: crop._count.cropType
    }));

    const stats = {
      totalFarmers,
      totalFarms,
      farmersThisMonth,
      farmersThisWeek,
      farmersToday,
      topCrops: formattedTopCrops
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);
