// Simple server to test API without frontend
import express from 'express';
import { registerRoutes } from './server/routes.ts';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

console.log('🚀 Starting server...');

try {
  const server = await registerRoutes(app);
  
  const PORT = 3001; // Use different port to avoid conflicts
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('🔗 Test endpoints:');
    console.log(`   - Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   - Binary Structure: GET http://localhost:${PORT}/api/binary-structure/me`);
    console.log(`   - Level Statistics: GET http://localhost:${PORT}/api/level-statistics/me`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
}