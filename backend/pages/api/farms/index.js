import { authMiddleware } from '../../../lib/authMiddleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Apply authentication middleware
    await authMiddleware(req, res);
    
    if (req.method === 'GET') {
      // Get all farms or farms by farmer ID
      const { farmerId } = req.query;
      
      let farms;
      if (farmerId) {
        farms = await prisma.farm.findMany({
          where: { farmerId },
          include: {
            farmer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                nin: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        farms = await prisma.farm.findMany({
          include: {
            farmer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                nin: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }
      
      return res.status(200).json({ farms });
    }
    
    if (req.method === 'POST') {
      // Create a new farm
      const {
        farmerId,
        farmSize,
        primaryCrop,
        produceCategory,
        farmOwnership,
        farmState,
        farmLocalGovernment,
        farmingSeason,
        farmWard,
        farmPollingUnit,
        secondaryCrop,
        farmingExperience,
        farmLatitude,
        farmLongitude,
        farmPolygon,
        soilType,
        soilPH,
        soilFertility,
        farmCoordinates,
        coordinateSystem,
        farmArea,
        farmElevation,
        year,
        yieldSeason,
        crop,
        quantity,
      } = req.body;

      if (!farmerId) {
        return res.status(400).json({ error: 'Farmer ID is required' });
      }

      // Verify farmer exists
      const farmer = await prisma.farmer.findUnique({
        where: { id: farmerId }
      });

      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }

      const farm = await prisma.farm.create({
        data: {
          farmerId,
          farmSize,
          primaryCrop,
          produceCategory,
          farmOwnership,
          farmState,
          farmLocalGovernment,
          farmingSeason,
          farmWard,
          farmPollingUnit,
          secondaryCrop,
          farmingExperience,
          farmLatitude,
          farmLongitude,
          farmPolygon,
          soilType,
          soilPH,
          soilFertility,
          farmCoordinates,
          coordinateSystem,
          farmArea,
          farmElevation,
          year,
          yieldSeason,
          crop,
          quantity,
        },
        include: {
          farmer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nin: true,
            }
          }
        }
      });

      return res.status(201).json({ farm });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Farms API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
