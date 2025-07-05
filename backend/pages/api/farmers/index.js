import prisma from '../../../lib/prisma';
import { farmerSchema, refereeSchema } from '../../../lib/validation';
import { authMiddleware } from '../../../lib/auth';

// GET /api/farmers - Get all farmers with pagination and search
export default authMiddleware(async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await getFarmers(req, res);
    case 'POST':
      return await createFarmer(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
});

async function getFarmers(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      state = '', 
      status = 'active' 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      status,
      ...(state && { state }),
      ...(search && {
        OR: [
          { nin: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

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
        skip: offset,
        take: parseInt(limit),
      }),
      prisma.farmer.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      farmers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching farmers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createFarmer(req, res) {
  try {
    const { referees, ...farmerData } = req.body;

    // Validate farmer data
    const validatedFarmer = farmerSchema.parse(farmerData);
    
    // Validate referees if provided
    let validatedReferees = [];
    if (referees && referees.length > 0) {
      validatedReferees = referees.map(referee => refereeSchema.parse(referee));
    }

    // Check for unique constraints
    const existingFarmer = await prisma.farmer.findFirst({
      where: {
        OR: [
          { nin: validatedFarmer.nin },
          { phone: validatedFarmer.phone },
          ...(validatedFarmer.email ? [{ email: validatedFarmer.email }] : []),
          ...(validatedFarmer.bvn ? [{ bvn: validatedFarmer.bvn }] : []),
        ],
      },
    });

    if (existingFarmer) {
      return res.status(409).json({ 
        error: 'Farmer already exists with the same NIN, phone, email, or BVN' 
      });
    }

    // Create farmer with referees
    const farmer = await prisma.farmer.create({
      data: {
        ...validatedFarmer,
        agentId: req.user.id,
        referees: {
          create: validatedReferees,
        },
      },
      include: {
        referees: true,
        agent: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return res.status(201).json(farmer);
  } catch (error) {
    console.error('Error creating farmer:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}
