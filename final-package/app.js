// Import the server module
try {
  const server = require('./server/index.js');
  // Start the server
  server.startServer();
} catch (error) {
  console.error('Error starting server. Please run the setup script first:');
  console.error('node pelnora-setup.js');
  console.error('Error details:', error);
}