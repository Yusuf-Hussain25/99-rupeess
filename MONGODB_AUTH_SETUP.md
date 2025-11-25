# MongoDB Authentication Setup Guide

## Step 1: Install Dependencies

Run these commands to install required packages:

```bash
npm install mongoose bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

## Step 2: MongoDB Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier: M0)
4. Create a database user (Database Access → Add New User)
5. **IMPORTANT: Whitelist your IP** (Network Access → Add IP Address → Add Current IP Address)
   - You can also add `0.0.0.0/0` to allow all IPs (NOT recommended for production, only for testing)
6. Get connection string: Click "Connect" → "Connect your application"
7. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
8. Replace `<password>` with your actual database user password
9. Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/8rupeess?retryWrites=true&w=majority`

**⚠️ Common Connection Issues:**
- **IP Not Whitelisted**: If you see "Could not connect to any servers" error, your IP is not whitelisted. Go to Network Access in Atlas and add your current IP address.
- **Wrong Password**: Make sure you're using the database user password, not your Atlas account password.
- **Connection String Format**: Ensure the connection string includes the database name and query parameters.

### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/your-database-name`

## Step 3: Environment Variables

Create/update `.env.local` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/8rupeess?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** 
- Never commit `.env.local` to git
- Use a strong, random JWT_SECRET in production
- Generate JWT_SECRET: `openssl rand -base64 32`

## Step 4: File Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── signup/
│   │   │   └── route.ts
│   │   ├── login/
│   │   │   └── route.ts
│   │   └── me/
│   │       └── route.ts (get current user)
│   └── ...
├── lib/
│   ├── mongodb.ts (database connection)
│   ├── jwt.ts (JWT utilities)
│   └── auth.ts (auth middleware)
└── models/
    └── User.ts (User model)
```

## Step 5: Implementation Files

All implementation files are created in the project. See:
- `lib/mongodb.ts` - Database connection
- `models/User.ts` - User model
- `lib/jwt.ts` - JWT utilities
- `lib/auth.ts` - Auth middleware
- `app/api/auth/signup/route.ts` - Signup endpoint
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/me/route.ts` - Get current user endpoint

## Step 6: API Endpoints

### Signup
```
POST /api/auth/signup
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+919876543210" (optional)
}
```

### Login
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Get Current User
```
GET /api/auth/me
Headers: {
  "Authorization": "Bearer <token>"
}
```

## Step 7: Testing

Use Postman, curl, or any API client to test:

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get Current User
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## Step 8: Security Best Practices

1. **Password Requirements**: Enforce strong passwords (min 8 chars, uppercase, lowercase, numbers)
2. **Rate Limiting**: Add rate limiting to prevent brute force attacks
3. **Email Verification**: Add email verification for signup
4. **Password Reset**: Implement password reset functionality
5. **HTTPS**: Always use HTTPS in production
6. **Token Expiration**: Set appropriate JWT expiration times
7. **Refresh Tokens**: Consider implementing refresh tokens for better security

## Step 9: Next Steps

1. Create frontend login/signup pages
2. Add protected routes middleware
3. Implement logout functionality
4. Add password reset flow
5. Add email verification
6. Add user profile management


