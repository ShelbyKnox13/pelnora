// This script will fix the syntax error in your server file
// Run this with Node.js on your server

const fs = require('fs');
const path = require('path');

// Path to your server file
const serverFilePath = path.join(__dirname, 'server', 'index.js');

// Read the file
fs.readFile(serverFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Create a backup
  fs.writeFile(`${serverFilePath}.backup`, data, 'utf8', (err) => {
    if (err) {
      console.error('Error creating backup:', err);
      return;
    }
    console.log('Backup created successfully');
  });

  // Fix the syntax error
  // Replace the line with the missing quote
  const fixedData = data.replace(
    /req\.session\.isAdmin = user\.email === 'admin@pelnora\.com(?!\s*['"];)/g,
    "req.session.isAdmin = user.email === 'admin@pelnora.com';"
  );

  // Write the fixed content back to the file
  fs.writeFile(serverFilePath, fixedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing the file:', err);
      return;
    }
    console.log('File fixed successfully');
    console.log('Please restart your application with: pm2 restart pelnora-app');
  });
});