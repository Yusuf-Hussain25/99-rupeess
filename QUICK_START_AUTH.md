# Quick Start: MongoDB Authentication Setup

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install mongoose bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 2. Set Up MongoDB

**Option A: MongoDB Atlas (Recommended - Free Cloud Database)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0 - Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `<dbname>` with your database name (e.g., `8rupeess`)

**Option B: Local MongoDB**

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/8rupeess`

### 3. Create Environment Variables

Create `.env.local` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/8rupeess?retryWrites=true&w=majority

# JWT Secret (Generate a random string)
# Run: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Test the API

Start your development server:

```bash
npm run dev
```

## 📡 API Endpoints

### Signup
```bash
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "user",
    "isEmailVerified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User (Protected Route)
```bash
GET http://localhost:3000/api/auth/me
Authorization: Bearer <your-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

## 🧪 Testing with cURL

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get Current User (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 🧪 Testing with Postman

1. **Signup Request:**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/signup`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123"
     }
     ```

2. **Login Request:**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "john@example.com",
       "password": "password123"
     }
     ```

3. **Get Current User:**
   - Method: GET
   - URL: `http://localhost:3000/api/auth/me`
   - Headers: 
     - `Content-Type: application/json`
     - `Authorization: Bearer <paste-token-here>`

## 📁 File Structure Created

```
lib/
├── mongodb.ts          # Database connection
├── jwt.ts              # JWT token utilities
└── auth.ts             # Authentication middleware

models/
└── User.ts             # User model/schema

app/api/auth/
├── signup/
│   └── route.ts        # Signup endpoint
├── login/
│   └── route.ts        # Login endpoint
└── me/
    └── route.ts        # Get current user endpoint
```

## 🔒 Security Features

✅ Password hashing with bcrypt (10 salt rounds)
✅ JWT token authentication
✅ Password validation (min 6 characters)
✅ Email validation
✅ Protected routes with middleware
✅ Role-based access control (user/admin)

## 🐛 Troubleshooting

**Error: "Cannot find module 'mongoose'"**
- Run: `npm install mongoose bcryptjs jsonwebtoken`

**Error: "MONGODB_URI is not defined"**
- Create `.env.local` file with `MONGODB_URI`

**Error: "JWT_SECRET is not defined"**
- Add `JWT_SECRET` to `.env.local`

**Error: "MongoDB connection failed"**
- Check your connection string
- Verify MongoDB Atlas IP whitelist
- Check if MongoDB service is running (for local)

**Error: "User already exists"**
- Email must be unique
- Try a different email or login instead

## ✅ Next Steps

1. Create frontend login/signup pages
2. Store JWT token in localStorage or httpOnly cookies
3. Add protected route middleware
4. Implement logout functionality
5. Add password reset feature
6. Add email verification

## 📚 Documentation

See `MONGODB_AUTH_SETUP.md` for detailed documentation.


