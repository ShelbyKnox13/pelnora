# Deployment Guide for Pelnora App on cPanel Node.js Hosting

This guide provides step-by-step instructions to deploy the Pelnora app on a shared web hosting environment with cPanel Node.js support.

---

## Prerequisites

- cPanel hosting with Node.js support enabled.
- Access to cPanel Node.js app interface.
- SSH access to the hosting server (optional but recommended).
- You have uploaded the project files (preferably as a zip and extracted in your app root).

---

## Step 1: Prepare Your Project for Deployment

1. Build the frontend with the correct output directory:

   ```bash
   npm run build
   ```

   This will generate the `dist` folder with `index.html` and static assets at the root, suitable for cPanel.

2. Zip the entire project folder (or at least the necessary files including `dist`, `server`, `package.json`, etc.) and upload it to your hosting via cPanel File Manager or FTP.

3. Extract the zip in your desired app root directory.

---

## Step 2: Setup Node.js Application in cPanel

1. Log in to your cPanel dashboard.

2. Navigate to **Setup Node.js App** (or similar Node.js app management section).

3. Click **Create Application**.

4. Configure the application:

   - **Node.js version:** Select the version compatible with your app (e.g., 16.x or 18.x).
   - **Application mode:** Production
   - **Application root:** Path to your app root folder where `package.json` is located.
   - **Application startup file:** `server/index.js` (or `server/index.ts` if you have compiled to JS)
   - **Environment variables:** Set any required env vars like `SESSION_SECRET`, `NODE_ENV=production`, etc.

5. Click **Create** or **Setup**.

---

## Step 3: Install Dependencies

1. Use the cPanel terminal or SSH to navigate to your app root directory.

2. Run:

   ```bash
   npm install --production
   ```

   This installs only production dependencies.

---

## Step 4: Start the Application

1. In the cPanel Node.js app interface, click **Run NPM Start** or **Start Application**.

2. The app should start and listen on the port assigned by cPanel.

---

## Step 5: Configure Static File Serving (if needed)

- The server is configured to serve static files from the `dist` folder.
- Ensure your build output is in `dist` and that `index.html` is at `dist/index.html`.

---

## Step 6: Access Your Application

- Use the URL provided by your hosting or your domain pointing to the app.
- Verify the app loads without errors (no 503 or not found errors).

---

## Troubleshooting

- If you cannot connect via SSH, use the cPanel terminal.
- Check logs in cPanel Node.js app interface for errors.
- Ensure environment variables are correctly set.
- Make sure the `package.json` scripts are correct and `start` script points to your server entry point.

---

## Optional: Automate Deployment

- You can create deployment scripts (e.g., PowerShell or Bash) to automate build, zip, upload, and install steps.
- Use cPanel Git Version Control or FTP for easier updates.

---

If you want, I can help you create deployment scripts or provide further assistance with any of these steps.

---
