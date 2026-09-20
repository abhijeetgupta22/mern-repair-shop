import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seedData.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);

// Root status landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>TechFix Pro API Server</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 9999px; padding: 6px 14px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
        .dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e; }
        h1 { margin: 0 0 8px 0; font-size: 24px; color: #ffffff; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; transition: background 0.2s; }
        .btn:hover { background: #1d4ed8; }
        .api-link { display: block; margin-top: 14px; font-size: 12px; color: #64748b; text-decoration: none; }
        .api-link:hover { color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge"><span class="dot"></span> API Server Online</div>
        <h1>TechFix Pro Repair Shop</h1>
        <p>The backend cloud server is running and ready to handle repair bookings, technician assignments, inventory, and invoices.</p>
        <a class="btn" href="https://mern-repair-shop-app.vercel.app">Open Web Application &rarr;</a>
        <a class="api-link" href="/api/health">Check API Health JSON</a>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TechFix Pro Repair Shop MERN API',
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start Server & Connect to DB
async function startServer() {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 TechFix Pro Repair MERN Server running on port ${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer();
