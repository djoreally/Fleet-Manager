import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/vehicles - Get all vehicles for the authenticated user's tenant
router.get('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        tenantId: req.user.tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(vehicles);
  } catch (error) {
    console.error('Failed to get vehicles:', error);
    res.status(500).json({ error: 'Failed to retrieve vehicles.' });
  }
});

// POST /api/vehicles - Create a new vehicle for the authenticated user's tenant
router.post('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { make, model, year, mileage, vin, licensePlate, oilFilterPartNumber, airFilterPartNumber, cabinAirFilterPartNumber, fuelFilterPartNumber } = req.body;

  if (!make || !model || !year || !vin) {
    return res.status(400).json({ error: 'Missing required vehicle fields.' });
  }

  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        year,
        mileage,
        vin,
        licensePlate,
        oilFilterPartNumber,
        airFilterPartNumber,
        cabinAirFilterPartNumber,
        fuelFilterPartNumber,
        tenantId: req.user.tenantId, // Associate with the user's tenant
      },
    });
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Failed to create vehicle:', error);
    // Handle potential unique constraint violation on VIN
    if (error.code === 'P2002') {
        return res.status(409).json({ error: 'A vehicle with this VIN already exists.' });
    }
    res.status(500).json({ error: 'Failed to create vehicle.' });
  }
});

// PUT /api/vehicles/:id - Update a vehicle
router.put('/:id', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    const { id } = req.params;
    try {
        // First, verify the vehicle belongs to the user's tenant
        const vehicle = await prisma.vehicle.findFirst({
            where: { id, tenantId: req.user.tenantId },
        });

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found or you do not have permission to edit it.' });
        }

        const updatedVehicle = await prisma.vehicle.update({
            where: { id },
            data: req.body,
        });
        res.json(updatedVehicle);
    } catch (error) {
        console.error(`Failed to update vehicle ${id}:`, error);
        res.status(500).json({ error: 'Failed to update vehicle.' });
    }
});

// DELETE /api/vehicles/:id - Delete a vehicle
router.delete('/:id', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    const { id } = req.params;
    try {
        // First, verify the vehicle belongs to the user's tenant
        const vehicle = await prisma.vehicle.findFirst({
            where: { id, tenantId: req.user.tenantId },
        });

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found or you do not have permission to delete it.' });
        }

        await prisma.vehicle.delete({
            where: { id },
        });
        res.status(204).send(); // No Content
    } catch (error) {
        console.error(`Failed to delete vehicle ${id}:`, error);
        res.status(500).json({ error: 'Failed to delete vehicle.' });
    }
});

export default router;