import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authRouter } from './server/routes/auth.js';
import { testsRouter } from './server/routes/tests.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Basic security and parsing middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api', testsRouter);

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'TestPro Platform API',
      timestamp: new Date().toISOString()
    });
  });

  if (!isProduction) {
    // Development mode with Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    // Production mode - serve built static assets from dist/
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('[Warning] dist papkasi topilmadi. Avval "npm run build" bajaring.');
    }
  }

  // Error handler middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Server Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Serverda ichki xatolik yuz berdi.'
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TestPro server ishga tushdi: http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Serverni ishga tushirishda xatolik:', err);
  process.exit(1);
});
