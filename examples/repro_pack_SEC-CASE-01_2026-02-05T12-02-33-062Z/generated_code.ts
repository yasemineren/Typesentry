import { Request, Response, NextFunction } from 'express';

export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = auth.slice('Bearer '.length);
  if (!process.env.JWT_SECRET || !token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}