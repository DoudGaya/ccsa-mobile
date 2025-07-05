import prisma from '../../../lib/prisma';
import { searchSchema } from '../../../lib/validation';
import { authMiddleware } from '../../../lib/auth';

// GET /api/farmers/search - Search farmers
export default authMiddleware(async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { query, type, limit = 10, offset = 0 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let whereClause = {
      status: 'active',
    };

    // Build search conditions based on type
    switch (type) {
      case 'nin':
        whereClause.nin = { contains: query, mode: 'insensitive' };
        break;
      case 'name':
        whereClause.OR = [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { middleName: { contains: query, mode: 'insensitive' } },
        ];
        break;
      case 'phone':
        whereClause.phone = { contains: query, mode: 'insensitive' };
        break;
      case 'email':
        whereClause.email = { contains: query, mode: 'insensitive' };
        break;
      default:
        // Search all fields
        whereClause.OR = [
          { nin: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { middleName: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ];
    }

    const [farmers, total] = await Promise.all([
      prisma.farmer.findMany({
        where: whereClause,
        include: {
          referees: true,
          certificates: true,
          agent: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(offset),
        take: parseInt(limit),
      }),
      prisma.farmer.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      farmers,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total,
        hasMore: total > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error searching farmers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
