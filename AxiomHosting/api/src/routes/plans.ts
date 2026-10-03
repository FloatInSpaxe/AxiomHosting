import { Router } from 'express';
import { pool } from '../db/pool.js';

interface PlanRow {
  id: string;
  name: string;
  ram_mb: number;
  cpu_threads: number;
  storage_gb: number;
  price: string;
  created_at: Date;
  updated_at: Date;
}

export const plansRouter = Router();

plansRouter.get('/', async (_request, response, next) => {
  try {
    const result = await pool.query<PlanRow>(`
      SELECT id, name, ram_mb, cpu_threads, storage_gb, price, created_at, updated_at
      FROM plans
      ORDER BY price ASC, id ASC
    `);

    response.json({ plans: result.rows });
  } catch (error) {
    next(error);
  }
});
