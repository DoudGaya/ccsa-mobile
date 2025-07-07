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
          farms: true,
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
    const { nin, personalInfo, contactInfo, bankInfo, referees } = req.body;

    // Helper function to safely parse date
    const parseDate = (dateString) => {
      if (!dateString) return null;
      
      console.log(`Parsing date: "${dateString}"`);
      
      // Try to parse the date string
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format: ${dateString}`);
        return null;
      }
      
      console.log(`Successfully parsed date: ${dateString} -> ${date.toISOString()}`);
      return date;
    };

    // Flatten the nested structure for database storage
    const farmerData = {
      nin,
      // Personal info from NIN
      firstName: personalInfo.firstName,
      middleName: personalInfo.middleName,
      lastName: personalInfo.lastName,
      dateOfBirth: parseDate(personalInfo.dateOfBirth),
      gender: personalInfo.gender,
      state: personalInfo.state || contactInfo.state,
      lga: personalInfo.lga || contactInfo.localGovernment,
      maritalStatus: personalInfo.maritalStatus,
      employmentStatus: personalInfo.employmentStatus,
      // Contact info (manual entry)
      phone: contactInfo.phoneNumber,
      email: contactInfo.email || null,
      whatsAppNumber: contactInfo.whatsAppNumber || null,
      address: contactInfo.address,
      ward: contactInfo.ward,
      latitude: contactInfo.coordinates?.latitude,
      longitude: contactInfo.coordinates?.longitude,
      // Bank info
      bankName: bankInfo.bankName,
      accountNumber: bankInfo.accountNumber,
      bvn: bankInfo.bvn,
    };

    // Validate referees if provided
    let validatedReferees = [];
    if (referees && referees.length > 0) {
      validatedReferees = referees.map(referee => ({
        firstName: referee.fullName.split(' ')[0] || '',
        lastName: referee.fullName.split(' ').slice(1).join(' ') || '',
        phone: referee.phoneNumber,
        relationship: referee.relation,
      }));
    }

    // Check for unique constraints
    const existingFarmer = await prisma.farmer.findFirst({
      where: {
        OR: [
          { nin: farmerData.nin },
          { phone: farmerData.phone },
          ...(farmerData.email ? [{ email: farmerData.email }] : []),
          ...(farmerData.bvn ? [{ bvn: farmerData.bvn }] : []),
        ],
      },
      select: {
        nin: true,
        phone: true,
        email: true,
        bvn: true,
        firstName: true,
        lastName: true,
      },
    });

    if (existingFarmer) {
      const conflicts = [];
      if (existingFarmer.nin === farmerData.nin) conflicts.push('NIN');
      if (existingFarmer.phone === farmerData.phone) conflicts.push('Phone number');
      if (farmerData.email && existingFarmer.email === farmerData.email) conflicts.push('Email');
      if (farmerData.bvn && existingFarmer.bvn === farmerData.bvn) conflicts.push('BVN');

      return res.status(409).json({ 
        error: 'Farmer already exists',
        message: `A farmer is already registered with the following information: ${conflicts.join(', ')}`,
        conflicts: conflicts,
        existingFarmer: {
          name: `${existingFarmer.firstName} ${existingFarmer.lastName}`,
          nin: existingFarmer.nin,
        }
      });
    }

    // Create farmer with referees
    console.log('Creating farmer with agentId:', req.user.id);
    console.log('Farmer data preview:', {
      nin: farmerData.nin,
      firstName: farmerData.firstName,
      lastName: farmerData.lastName,
      phone: farmerData.phone,
      agentId: req.user.id,
    });
    
    const farmer = await prisma.farmer.create({
      data: {
        ...farmerData,
        agentId: req.user.id,
        referees: {
          create: validatedReferees,
        },
      },
      include: {
        referees: true,
        farms: true,
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
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'A farmer with this information already exists' 
      });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}
