# Deploying Pelnora to Render

This guide will walk you through deploying the Pelnora application to Render.com.

## Prerequisites

1. A [Render.com](https://render.com) account
2. Your Pelnora application code in a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Create a MySQL Database on Render

1. Log in to your Render dashboard
2. Navigate to "New" > "MySQL"
3. Configure your database:
   - Name: `pelnora-db`
   - Database: `pelnora`
   - User: `pelnora_user`
   - Choose a plan (Starter is recommended for development)
4. Click "Create Database"
5. Once created, note the connection details (host, port, password)

### 2. Deploy the Web Service

#### Option 1: Using the Render Dashboard

1. In your Render dashboard, go to "New" > "Web Service"
2. Connect your Git repository
3. Configure the service:
   - Name: `pelnora-app`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
4. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `DB_HOST`: Your MySQL host from step 1
   - `DB_PORT`: Your MySQL port (usually 3306)
   - `DB_NAME`: `pelnora`
   - `DB_USER`: `pelnora_user`
   - `DB_PASSWORD`: Your MySQL password from step 1
   - `SESSION_SECRET`: Generate a random string
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://pelnora-app.onrender.com`)
5. Click "Create Web Service"

#### Option 2: Using the render.yaml File

1. Push the `render.yaml` file to your Git repository
2. In your Render dashboard, go to "Blueprints"
3. Connect your Git repository
4. Select the repository and branch
5. Render will detect the `render.yaml` file and create the services
6. You'll need to manually set the database environment variables after creation

### 3. Configure Custom Domain (Optional)

1. In your Render dashboard, select your web service
2. Go to the "Settings" tab
3. Scroll down to "Custom Domain"
4. Click "Add Custom Domain"
5. Enter your domain name (e.g., `app.pelnora.com`)
6. Follow the instructions to configure DNS settings with your domain provider
7. Wait for DNS propagation (can take up to 24-48 hours)

## Monitoring and Maintenance

- View logs: Go to your web service > Logs
- Restart service: Go to your web service > Manual Deploy > Clear Build Cache & Deploy
- Scale service: Go to your web service > Settings > Instance Type

## Version Control with Render

Render automatically deploys your application when you push changes to your Git repository. To manage versions:

1. Use Git tags to mark releases:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. To roll back to a previous version:
   - Go to your web service in the Render dashboard
   - Click "Manual Deploy"
   - Select "Deploy specific commit"
   - Enter the commit hash or tag name
   - Click "Deploy"

## Troubleshooting

- **Application crashes**: Check the logs in the Render dashboard
- **Database connection issues**: Verify environment variables and network settings
- **Deployment failures**: Check build logs for errors

For more help, refer to the [Render documentation](https://render.com/docs) or contact Render support.