# Domain pe Website Host Karne Ka Complete Guide

## 🚀 Best Option: Vercel (Recommended)

Vercel Next.js ke creators ne banaya hai - sabse easy aur best option!

### Step 1: GitHub par Code Push Karein

```bash
# Git initialize (agar nahi hai)
git init
git add .
git commit -m "Initial commit"

# GitHub repository create karein
# GitHub.com par jao → New Repository

# Remote add karein
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### Step 2: Vercel par Deploy Karein

1. **Vercel Account Banayein:**
   - [vercel.com](https://vercel.com) par jao
   - "Sign Up" → GitHub se login karein

2. **Project Import Karein:**
   - Dashboard par "Add New Project" click karein
   - GitHub repository select karein
   - "Import" click karein

3. **Environment Variables Add Karein:**
   - Project Settings → Environment Variables
   - Add these variables:
     ```
     MONGODB_URI=your-mongodb-connection-string
     JWT_SECRET=your-strong-secret-key-min-32-chars
     JWT_EXPIRES_IN=7d
     NODE_ENV=production
     ```

4. **Deploy:**
   - "Deploy" button click karein
   - 2-3 minutes mein deploy ho jayega
   - Ab aapko mil jayega: `https://your-app.vercel.app`

### Step 3: Custom Domain Add Karein

1. **Vercel Dashboard mein:**
   - Project → Settings → Domains
   - "Add Domain" click karein

2. **Domain Enter Karein:**
   - Apna domain enter karein (जैसे: `yourdomain.com`)
   - Vercel automatically DNS records suggest karega

3. **DNS Configuration (Domain Provider par):**

   **Agar aapke paas domain hai (GoDaddy, Namecheap, etc.):**
   
   Domain provider ke DNS settings mein ye records add karein:
   
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
   
   Ya Vercel ke suggested records use karein (jo automatically milenge)

4. **Wait for DNS Propagation:**
   - 5-30 minutes lag sakte hain
   - Vercel automatically verify kar lega

5. **SSL Certificate:**
   - Vercel automatically HTTPS enable kar deta hai
   - Free SSL certificate (Let's Encrypt)

## 🌐 Alternative Options

### Option 2: Netlify

1. **Netlify Account:**
   - [netlify.com](https://netlify.com) par sign up
   - GitHub se connect karein

2. **Deploy:**
   - "New site from Git" → Repository select
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. **Domain Add:**
   - Site settings → Domain management
   - Custom domain add karein

### Option 3: Railway

1. **Railway Account:**
   - [railway.app](https://railway.app) par sign up

2. **Deploy:**
   - "New Project" → "Deploy from GitHub"
   - Repository select karein

3. **Environment Variables:**
   - Variables tab mein add karein

4. **Custom Domain:**
   - Settings → Networking → Custom Domain

### Option 4: DigitalOcean App Platform

1. **DigitalOcean Account:**
   - [digitalocean.com](https://digitalocean.com)

2. **Create App:**
   - Apps → Create App
   - GitHub repository connect karein
   - Next.js auto-detect hoga

3. **Domain:**
   - Settings → Domains → Add Domain

### Option 5: Traditional VPS (Self-Hosted)

Agar aap VPS use karna chahte hain (DigitalOcean Droplet, AWS EC2, etc.):

1. **Server Setup:**
   ```bash
   # Node.js install
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # PM2 install (process manager)
   sudo npm install -g pm2
   
   # Git clone
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   
   # Dependencies install
   npm install
   
   # Build
   npm run build
   
   # Start with PM2
   pm2 start npm --name "99-rupeess" -- start
   pm2 save
   pm2 startup
   ```

2. **Nginx Setup (Reverse Proxy):**
   ```bash
   sudo apt install nginx
   
   # Nginx config
   sudo nano /etc/nginx/sites-available/yourdomain.com
   ```
   
   Config file:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **SSL Certificate (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

## 📋 Pre-Deployment Checklist

### 1. Environment Variables (Production)

`.env.production` file create karein (reference ke liye):

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/8rupeess?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-very-strong-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Node Environment
NODE_ENV=production
```

**Important:** `.env.production` ko git mein commit mat karein!

### 2. MongoDB Atlas Configuration

1. **Production Cluster:**
   - MongoDB Atlas dashboard mein jao
   - New cluster create karein (M0 Free tier available)

2. **Network Access:**
   - Network Access → Add IP Address
   - `0.0.0.0/0` add karein (sab IPs allow karega)
   - Ya specific hosting provider IPs add karein

3. **Database User:**
   - Database Access → Add New User
   - Strong password set karein
   - Read and write permissions dein

4. **Connection String:**
   - Clusters → Connect → Connect your application
   - Connection string copy karein
   - Password replace karein

### 3. Build Test (Local)

```bash
# Production build test
npm run build

# Production server test
npm start

# Check karein:
# - http://localhost:3000
# - http://localhost:3000/api/auth/me
```

### 4. Security Checklist

- ✅ Strong JWT_SECRET (32+ characters, random)
- ✅ MongoDB strong password
- ✅ HTTPS enabled (automatic on Vercel/Netlify)
- ✅ Environment variables secure
- ✅ `.env` files gitignore mein hain

## 🔧 Domain Provider Setup (Step-by-Step)

### GoDaddy:

1. **DNS Management:**
   - GoDaddy account → My Products → Domains
   - Domain select → DNS Management

2. **Records Add:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel IP)
   TTL: 600
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 600
   ```

3. **Save** aur wait karein (5-30 minutes)

### Namecheap:

1. **Advanced DNS:**
   - Domain List → Manage → Advanced DNS

2. **Records:**
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic
   
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

### Cloudflare:

1. **DNS Settings:**
   - Cloudflare Dashboard → Domain → DNS

2. **Records:**
   ```
   Type: A
   Name: @
   Content: 76.76.21.21
   Proxy: DNS only (gray cloud)
   
   Type: CNAME
   Name: www
   Content: cname.vercel-dns.com
   Proxy: DNS only
   ```

## 🎯 Vercel Deployment (Detailed Steps)

### Complete Process:

1. **GitHub Repository:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Vercel Setup:**
   - vercel.com → Sign Up (GitHub se)
   - "New Project" → Import Git Repository
   - Repository select → Import

3. **Project Configuration:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
   - Install Command: `npm install` (auto)

4. **Environment Variables:**
   ```
   MONGODB_URI = mongodb+srv://...
   JWT_SECRET = your-secret-key
   JWT_EXPIRES_IN = 7d
   NODE_ENV = production
   ```

5. **Deploy:**
   - "Deploy" button
   - Wait for build (2-3 minutes)
   - Success! 🎉

6. **Custom Domain:**
   - Project → Settings → Domains
   - "Add" → Domain enter
   - DNS records follow karein
   - Wait for verification

## 📊 Post-Deployment

### Testing:

1. **Website Check:**
   - `https://yourdomain.com` open karein
   - Homepage load hona chahiye

2. **API Check:**
   - `https://yourdomain.com/api/categories` test karein
   - Response aana chahiye

3. **Admin Panel:**
   - `https://yourdomain.com/admin` test karein
   - Login check karein

4. **MongoDB Connection:**
   - MongoDB Atlas → Metrics check karein
   - Connections active honi chahiye

### Monitoring:

- **Vercel Analytics:** Free tier mein available
- **MongoDB Atlas:** Free monitoring
- **Error Tracking:** Vercel Functions logs

## 💰 Cost Estimate

### Free Tier (Vercel):
- ✅ Free domain hosting
- ✅ Free SSL certificate
- ✅ 100GB bandwidth/month
- ✅ Unlimited requests
- ✅ Perfect for starting!

### Paid (Agar traffic zyada ho):
- Vercel Pro: $20/month
- MongoDB Atlas: M10 cluster ~$57/month
- Domain: ~$10-15/year

## 🐛 Common Issues & Solutions

### Issue 1: Domain Not Connecting
**Solution:**
- DNS propagation wait karein (24-48 hours max)
- DNS checker use karein: [dnschecker.org](https://dnschecker.org)
- Vercel dashboard mein domain status check karein

### Issue 2: SSL Certificate Error
**Solution:**
- Vercel automatically SSL deta hai
- Agar issue ho to: Settings → Domains → SSL → Re-provision

### Issue 3: MongoDB Connection Failed
**Solution:**
- MongoDB Atlas → Network Access → `0.0.0.0/0` add karein
- Connection string verify karein
- Environment variables check karein

### Issue 4: Build Fails
**Solution:**
- Build logs check karein (Vercel dashboard)
- Local build test karein: `npm run build`
- Dependencies check karein

## ✅ Quick Start (5 Minutes)

```bash
# 1. GitHub push
git push origin main

# 2. Vercel par jao
# vercel.com → New Project → Import

# 3. Environment variables add karo
# 4. Deploy click karo
# 5. Domain add karo
# Done! 🎉
```

## 📞 Support

Agar koi issue ho:
1. Vercel logs check karein
2. MongoDB Atlas logs check karein
3. Browser console check karein
4. DNS propagation check karein

---

**Best Option: Vercel** - Sabse easy, free, aur Next.js ke liye perfect! 🚀

