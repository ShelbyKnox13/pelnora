#!/bin/bash
# Deployment script for Pelnora on shared hosting

echo "🚀 Starting Pelnora deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it based on .env.example"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create public directory if it doesn't exist
if [ ! -d "public" ]; then
    echo "📁 Creating public directory..."
    mkdir -p public
fi

# Check if database connection works
echo "🔍 Testing database connection..."
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    
    const [rows] = await pool.execute('SELECT 1 as connection_test');
    if (rows && rows[0] && rows[0].connection_test === 1) {
      console.log('✅ Database connection successful');
      process.exit(0);
    } else {
      console.error('❌ Database connection test failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
}

testConnection();
"

if [ $? -ne 0 ]; then
    echo "❌ Database connection failed. Please check your .env configuration."
    exit 1
fi

# Start the application
echo "🚀 Starting the application..."
node app.js

echo "✅ Deployment complete! Your Pelnora application should now be running."
echo "📝 Check the logs for any errors."
echo "🌐 Visit your domain to access the application."