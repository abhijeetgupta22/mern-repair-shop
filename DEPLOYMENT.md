# Complete Step-by-Step Deployment Guide

Deploy your MERN repair shop application to the cloud for free using GitHub, **Render** (Backend API), and **Vercel** (Frontend Client).

---

## Part 1: Push Your Code to GitHub

Open PowerShell in your project folder (`C:\Users\ASUS\OneDrive\Desktop\mern-repair-shop`) and run:

```bash
git add .
git commit -m "feat: complete mern repair shop app with onboarding, graphs, subscription, inventory, and invoicing"
git push origin main
```

Your code will now be up to date on your GitHub repository:
`https://github.com/abhijeetgupta22/mern-repair-shop`

---

## Part 2: Deploy the Backend API (Render - Free)

Render hosts your Node.js Express server with automated deployments whenever you push to GitHub.

1. Go to **[https://render.com](https://render.com)** and sign in with your GitHub account.
2. Click **New +** → select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your `mern-repair-shop` repo.
4. Fill in the settings:
   - **Name**: `mern-repair-shop-api` (or any name you prefer)
   - **Region**: Closest to you (e.g., *Singapore* or *Frankfurt*)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Click **Advanced** → **Add Environment Variable**:
   - `PORT` = `5000`
   - `JWT_SECRET` = `super_secret_jwt_key_repair_pro_2026`
   - `NODE_ENV` = `production`
   - *(Optional Cloud DB)* `MONGODB_URI` = *(Your MongoDB Atlas connection string — see Part 4)*
6. Click **Create Web Service**.
7. Wait ~2 minutes for the build to finish. Once live, copy your backend URL:
   `https://mern-repair-shop-api.onrender.com`

---

## Part 3: Deploy the Frontend (Vercel - Free)

Vercel provides lightning-fast global hosting for your React Vite client.

1. Go to **[https://vercel.com](https://vercel.com)** and sign in with your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your `mern-repair-shop` repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`client`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://mern-repair-shop-api.onrender.com/api` *(Paste your Render backend URL + `/api`)*
6. Click **Deploy**.
7. In ~30 seconds, Vercel will give you your live URL (e.g. `https://mern-repair-shop.vercel.app`)!

---

## Part 4: Connect Cloud Database (MongoDB Atlas - 100% Free)

*Note: If you don't connect MongoDB Atlas, the server automatically runs using its resilient embedded data store.*

To store data permanently in MongoDB cloud:
1. Go to **[https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)** and sign up for free.
2. Create a free cluster (**M0 Free Sandbox**).
3. Under **Database Access**, create a database user (e.g., username `admin`, choose a secure password).
4. Under **Network Access**, click **Add IP Address** → choose **Allow Access from Anywhere** (`0.0.0.0/0`).
5. In **Database** → click **Connect** → **Drivers (Node.js)** → copy your connection string:
   `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/repair_shop?retryWrites=true&w=majority`
6. Go back to **Render** → your web service → **Environment** → add/update:
   - `MONGODB_URI` = *(your Atlas connection string with your actual password)*
7. Click **Save Changes** (Render will automatically redeploy with MongoDB cloud).

---

## Summary of URLs

Once deployed:
- **Live Customer & Admin Website**: `https://your-app-name.vercel.app`
- **Live Backend API**: `https://your-api-name.onrender.com/api`
- **Live Health Check**: `https://your-api-name.onrender.com/api/health`
