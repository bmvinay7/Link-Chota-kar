# URL Shortener - Production Deployment Guide (Railway)

## Overview

This guide walks you through deploying your URL shortener to Railway, a modern cloud platform perfect for Node.js + MySQL applications.

---

## Step 1: Prepare Your Code

### 1.1 Update Environment Variables

Create `.env.production` file:

```
NODE_ENV=production
PORT=8000
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=<railway-generated-password>
DB_NAME=URL_Shortner
BASE_URL=https://<your-domain>.up.railway.app
```

### 1.2 Update database.js to Use Environment Variables

Replace hardcoded values in `database.js`:

```javascript
require("dotenv").config();

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "URL_Shortner",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to mysql database server", error);
  } else {
    console.log("Connected to MySQL Database!");
  }
});

module.exports = connection;
```

### 1.3 Update express-app.js to Use BASE_URL

Replace hardcoded `http://localhost:8000` with environment variable:

```javascript
const BASE_URL = process.env.BASE_URL || "http://localhost:8000";

// In GET route (around line 17-18):
const shortUrl = BASE_URL + "/chotakar/" + req.params.hashValue;

// In POST route (around line 69):
const shortUrl = BASE_URL + "/chotakar/" + hashValue;
```

### 1.4 Update package.json

Ensure your scripts section looks like this:

```json
"scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
}
```

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository (if not already done)

```bash
cd /Users/vinaybm/Documents/Link\ chotta\ kar
git init
git add .
git commit -m "Initial commit: URL shortener app"
```

### 2.2 Create GitHub Repository

- Go to https://github.com/new
- Create repository named `link-chotta-kar`
- **Important:** Do NOT initialize with README (you already have code)

### 2.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/link-chotta-kar.git
git branch -M main
git push -u origin main
```

### 2.4 Create .gitignore (if not exists)

```bash
cat > .gitignore << EOF
node_modules/
.env
.env.local
.env.production
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF

git add .gitignore
git commit -m "Add .gitignore"
git push
```

---

## Step 3: Set Up Railway

### 3.1 Create Railway Account

- Go to https://railway.app
- Sign up with GitHub (easiest)

### 3.2 Create New Project

- Click "New Project" button
- Select "GitHub Repo" → Connect GitHub account when prompted
- Select your `link-chotta-kar` repository

### 3.3 Add MySQL to Project

- In Railway dashboard, click "Add Service"
- Search for "MySQL" and select it
- This auto-creates a MySQL instance

### 3.4 Configure Node.js Service

- Railway should auto-detect Node.js
- If not, click "Add Service" → "Node.js"
- Connect it to your GitHub repo

---

## Step 4: Configure Environment Variables

### 4.1 Get MySQL Credentials from Railway

In Railway dashboard:

- Click on "MySQL" service
- Go to "Variables" tab
- Copy these values:
  - `MYSQL_HOST`
  - `MYSQL_USER` (usually `root`)
  - `MYSQL_PASSWORD`
  - `MYSQL_DATABASE` (the database name it created)

### 4.2 Set Environment Variables for Node Service

- Click on your Node.js service
- Go to "Variables" tab
- Add these variables:
  ```
  NODE_ENV = production
  PORT = 8000
  DB_HOST = mysql.railway.internal
  DB_USER = root
  DB_PASSWORD = <copy from MySQL Variables>
  DB_NAME = <copy MYSQL_DATABASE from MySQL>
  BASE_URL = https://<your-app-name>.up.railway.app
  ```

---

## Step 5: Initialize Database

### 5.1 Connect to Railway MySQL

Get the MySQL external connection string from Railway dashboard:

- Click MySQL service
- Go to "Connect" tab
- Copy the connection string

### 5.2 Create Database and Table

```bash
mysql -h <MYSQL_HOST> -u root -p<MYSQL_PASSWORD> -e "CREATE DATABASE IF NOT EXISTS URL_Shortner;"

mysql -h <MYSQL_HOST> -u root -p<MYSQL_PASSWORD> URL_Shortner -e "
CREATE TABLE IF NOT EXISTS Container (
    id INT AUTO_INCREMENT PRIMARY KEY,
    longUrl VARCHAR(2048) NOT NULL,
    shortUrl VARCHAR(255) UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_shortUrl (shortUrl),
    INDEX idx_longUrl (longUrl)
);"
```

---

## Step 6: Deploy

### 6.1 Trigger Deployment

Once environment variables are set:

- Railway auto-deploys from your GitHub repository
- Watch the deployment logs in the dashboard
- Look for "Listening on port 8000" message

### 6.2 Get Your Production URL

- In Railway dashboard, click Node.js service
- Look for "Deployment" tab
- Your app URL will be something like: `https://link-chotta-kar-production.up.railway.app`

### 6.3 Update BASE_URL if Different

- If your Railway URL is different, update it in the Variables tab
- Railway will auto-redeploy

---

## Step 7: Test Production Endpoint

### 7.1 Test POST Endpoint

```bash
curl -X POST https://link-chotta-kar-production.up.railway.app/chotakar/postUrl \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'
```

Expected response:

```json
{
  "message": "Inserted the new URL",
  "shortUrl": "https://link-chotta-kar-production.up.railway.app/chotakar/abc123",
  "longUrl": "https://google.com"
}
```

### 7.2 Test GET Endpoint (Redirect)

```bash
curl -L https://link-chotta-kar-production.up.railway.app/chotakar/abc123
```

Should redirect to `https://google.com`

---

## Step 8: Add Custom Domain (Optional)

### 8.1 Update DNS

- In Railway dashboard, click Node.js service
- Go to "Settings" → "Domain"
- Add your custom domain (e.g., `shortener.yourdomain.com`)
- Railway provides DNS records to add to your domain provider

### 8.2 Update BASE_URL

- Update `BASE_URL` variable to use your custom domain

---

## Step 9: Monitoring & Maintenance

### 9.1 View Logs

- Railway dashboard → Node.js service → "Logs" tab
- Watch real-time logs of your production app

### 9.2 Monitor Database

- Click MySQL service → "Logs" tab
- Check for connection issues

### 9.3 Set Up Email Alerts

- Railway dashboard → Project settings
- Enable alerts for:
  - Deployment failures
  - High memory usage
  - Service restarts

### 9.4 Database Backups

- Railway automatically backs up MySQL daily
- Go to MySQL service → "Backups" tab
- Can restore from previous backups if needed

---

## Step 10: Make Updates

### 10.1 Deploy Updates

```bash
# Make code changes locally
git add .
git commit -m "Update: description"
git push origin main
```

Railway automatically redeploys when you push to GitHub!

### 10.2 Monitor Deployment

Watch the "Deployments" tab in Railway dashboard

---

## Troubleshooting

### Issue: "Cannot find module"

- Check `package.json` is in repo
- Verify `npm install` completed
- Check Railway build logs

### Issue: "Cannot connect to database"

- Verify DB_HOST is `mysql.railway.internal` (not localhost)
- Check DB_PASSWORD and DB_USER are correct
- Make sure MySQL service was created in Railway

### Issue: "Application crashed"

- Check logs in Railway dashboard
- Verify all environment variables are set
- Test locally first: `npm run dev`

### Issue: Connection Timeout

- MySQL might be initializing
- Wait 2-3 minutes after creating service
- Restart Node service from Railway dashboard

---

## Production Checklist

- [ ] Code pushed to GitHub
- [ ] MySQL service created in Railway
- [ ] Environment variables configured
- [ ] Database and table created
- [ ] Deployment successful (logs show "Listening on port")
- [ ] POST endpoint tested and working
- [ ] GET endpoint tested and redirects
- [ ] BASE_URL matches production domain
- [ ] Logs are monitored
- [ ] Backups are enabled

---

## Next Steps

### Optional Improvements:

1. Add rate limiting to prevent abuse
2. Add error tracking (Sentry)
3. Add custom domain
4. Monitor analytics (which links are most used)
5. Add admin dashboard

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Status: https://status.railway.app
- GitHub Issues: Push error logs and describe problem
