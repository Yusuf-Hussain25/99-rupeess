# OTP-Based Authentication Guide

## 🔐 Authentication Flow

### Signup Flow:
1. User submits: `name`, `email`, `password`, `phone` (optional)
2. System sends OTP to email
3. User submits: `email`, `otp`, `name`, `password`, `phone` (optional)
4. System verifies OTP and creates account
5. User is logged in (receives JWT token)

### Login Flow:
1. User submits: `email`
2. System sends OTP to email
3. User submits: `email`, `otp`
4. System verifies OTP
5. User is logged in (receives JWT token)

## 📧 Email Configuration

Add these to your `.env.local`:

```env
# Email Configuration (use exact variable names)
Email_id=your-email@gmail.com
Password=your-app-password
name=8 Rupeess

# Alternative variable names (also supported)
EMAIL_ID=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_NAME=8 Rupeess
```

### Gmail Setup:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Go to "App passwords"
   - Generate password for "Mail"
   - Use this password in `Password` variable (not your regular Gmail password)

### Other Email Providers:

For Outlook, Yahoo, or custom SMTP, update `lib/email.ts`:

```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com', // or your SMTP host
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_ID,
    pass: EMAIL_PASSWORD,
  },
});
```

## 🚀 API Endpoints

### 1. Signup (Send OTP)

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+919876543210"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration.",
  "expiresIn": 600
}
```

### 2. Send OTP (Alternative - for login or resend)

```bash
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "type": "login"  // "signup" | "login" | "reset"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "expiresIn": 600
}
```

### 3. Verify OTP (Complete Signup/Login)

**For Signup:**
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "type": "signup",
  "name": "John Doe",
  "password": "password123",
  "phone": "+919876543210"  // optional
}
```

**For Login:**
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "type": "login"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created and verified successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "user",
    "isEmailVerified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🧪 Testing

### Test Signup Flow:

```bash
# Step 1: Signup (sends OTP)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Step 2: Check email for OTP (e.g., 123456)

# Step 3: Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456",
    "type": "signup",
    "name": "John Doe",
    "password": "password123"
  }'
```

### Test Login Flow:

```bash
# Step 1: Request OTP
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'

# Step 2: Check email for OTP

# Step 3: Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456",
    "type": "login"
  }'
```

## 📋 Environment Variables

Required in `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email (use exact names as shown)
Email_id=your-email@gmail.com
Password=your-app-password
name=8 Rupeess

# Optional: Alternative names
EMAIL_ID=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_NAME=8 Rupeess
```

## 🔒 Security Features

✅ OTP expires in 10 minutes
✅ OTP can only be used once
✅ OTPs auto-deleted after expiration
✅ Email validation
✅ Rate limiting (can be added)
✅ Secure password hashing
✅ JWT token authentication

## 🐛 Troubleshooting

### "Email service not configured"
- Check `.env.local` has `Email_id` and `Password`
- Verify email credentials are correct
- For Gmail, use App Password (not regular password)

### "Failed to send OTP email"
- Check email service configuration
- Verify SMTP settings
- Check spam folder
- Test email connection

### "Invalid or expired OTP"
- OTP expires in 10 minutes
- OTP can only be used once
- Request a new OTP if expired

### Gmail "Less secure app" error
- Enable 2-Factor Authentication
- Use App Password (not regular password)
- App Password is 16 characters, no spaces

## 📝 Notes

- OTPs are stored in MongoDB and auto-deleted after expiration
- Each OTP is 6 digits
- OTP expires in 10 minutes
- User must verify email via OTP before account is fully activated
- `isEmailVerified` is set to `true` after OTP verification

## 🎯 Frontend Integration Example

```typescript
// Signup flow
const handleSignup = async () => {
  // Step 1: Send OTP
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  
  if (response.ok) {
    setShowOTPInput(true);
  }
};

// Step 2: Verify OTP
const handleVerifyOTP = async () => {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      otp,
      type: 'signup',
      name,
      password,
    }),
  });
  
  const data = await response.json();
  if (data.success) {
    // Store token and redirect
    localStorage.setItem('token', data.token);
    router.push('/dashboard');
  }
};
```

