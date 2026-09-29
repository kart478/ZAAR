import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`ZAAR API Server running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api/v1`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
  });
}

export default app;
