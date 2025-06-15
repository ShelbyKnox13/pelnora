# Setting up Git Deployment in cPanel

## Method 1: Using cPanel's Git Version Control Feature

1. Log in to your cPanel account
2. Navigate to "Git Version Control" in the "Files" section
3. Click "Create" to set up a new repository
4. Fill in the following details:
   - Clone URL: https://github.com/ShelbyKnox13/pelnora.git
   - Repository Path: public_html/pelnora (or your desired directory)
   - Repository Name: pelnora
   - Branch: main
5. For authentication:
   - If your repository is private, you'll need to provide a GitHub Personal Access Token
   - Create a token at GitHub (Settings > Developer settings > Personal access tokens)
   - Give it "repo" permissions
6. Click "Create" to clone the repository
7. To update the repository later, go back to Git Version Control and click "Manage" then "Pull"

## Method 2: Manual Deployment via SFTP

If Git deployment isn't working, you can manually upload files:

1. Build your project locally:
   ```
   npm run build
   ```
2. Use an SFTP client (like FileZilla) to upload the built files to your cPanel server
3. Connect to your server using your cPanel credentials
4. Upload the contents of the `dist` directory to your desired location on the server

## Method 3: Using GitHub Actions for Automated Deployment

1. Create a `.github/workflows/cpanel-deploy.yml` file in your repository
2. Set up the workflow to build your project and deploy it via FTP/SFTP
3. Store your cPanel credentials as GitHub secrets
4. Push changes to GitHub, and GitHub Actions will automatically deploy to cPanel