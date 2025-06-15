// This file contains the fixed line for your server code
// The error is on line 207 where a closing quote is missing

// Original line with error:
// req.session.isAdmin = user.email === 'admin@pelnora.com

// Fixed line:
// req.session.isAdmin = user.email === 'admin@pelnora.com';

// Instructions:
// 1. Upload this file to your cPanel hosting
// 2. SSH into your server
// 3. Navigate to your app directory
// 4. Run the commands in the fix-commands.txt file