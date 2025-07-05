import { authMiddleware } from '../../../lib/auth';

// Mock NIN lookup service
const mockNINData = {
  '12345678901': {
    firstName: 'John',
    middleName: 'Doe',
    lastName: 'Smith',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    photo: null,
  },
  '98765432109': {
    firstName: 'Jane',
    middleName: 'Mary',
    lastName: 'Johnson',
    dateOfBirth: '1985-05-20',
    gender: 'female',
    photo: null,
  },
};

// GET /api/nin/lookup - Lookup NIN information
export default authMiddleware(async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { nin } = req.query;

    if (!nin) {
      return res.status(400).json({ error: 'NIN is required' });
    }

    if (nin.length !== 11 || !/^\d+$/.test(nin)) {
      return res.status(400).json({ error: 'Invalid NIN format' });
    }

    // In a real application, this would make an API call to the NIN service
    // For now, we'll use mock data
    const ninData = mockNINData[nin];

    if (!ninData) {
      return res.status(404).json({ error: 'NIN not found' });
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res.status(200).json({
      success: true,
      data: ninData,
    });
  } catch (error) {
    console.error('Error looking up NIN:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
