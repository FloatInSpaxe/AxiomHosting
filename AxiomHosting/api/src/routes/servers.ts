import { Router } from 'express';
import { pool } from '../db/pool.js';

interface ServerRow {
  id: string;
  user_id: string;
  pterodactyl_server_id: string | null;
  name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export const serversRouter = Router();

serversRouter.get('/', async (_request, response, next) => {
  try {
    const result = await pool.query<ServerRow>(`
      SELECT id, user_id, pterodactyl_server_id, name, status, created_at, updated_at
      FROM servers
      ORDER BY created_at DESC
    `);

    response.json({ servers: result.rows });
  } catch (error) {
    next(error);
  }
});
