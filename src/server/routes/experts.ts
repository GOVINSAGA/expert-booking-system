import express from 'express';
import { Expert } from '../models/Expert';

export const expertRouter = express.Router();

expertRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;

    const query: any = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Expert.countDocuments(query);
    const experts = await Expert.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ rating: -1 });

    res.json({
      data: experts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).json({ error: 'Failed to fetch experts' });
  }
});

expertRouter.get('/:id', async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ error: 'Expert not found' });
    res.json(expert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expert details' });
  }
});
