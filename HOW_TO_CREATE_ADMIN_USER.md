# How to Create an Admin User

## Problem
When you try to access `/admin`, you're redirected to the homepage because your user account doesn't have admin privileges.

## Solution
You need to set your user's role to `'admin'` in the MongoDB database.

## Method 1: Using MongoDB Compass (GUI - Recommended)

1. **Open MongoDB Compass** and connect to your database
2. **Navigate to your database** (e.g., `8rupeess`)
3. **Open the `users` collection**
4. **Find your user** by email or name
5. **Edit the document** and change the `role` field from `"user"` to `"admin"`
6. **Save the changes**

## Method 2: Using MongoDB Shell (mongosh)

1. **Connect to your MongoDB database**:
   ```bash
   mongosh "your-mongodb-connection-string"
   ```

2. **Switch to your database**:
   ```javascript
   use 8rupeess
   ```

3. **Update your user's role** (replace `your-email@example.com` with your actual email):
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

4. **Verify the change**:
   ```javascript
   db.users.findOne({ email: "your-email@example.com" })
   ```
   
   You should see `"role": "admin"` in the output.

## Method 3: Using MongoDB Atlas Web Interface

1. **Log in to MongoDB Atlas**
2. **Go to your cluster** → **Browse Collections**
3. **Select your database** (e.g., `8rupeess`)
4. **Open the `users` collection**
5. **Find your user document**
6. **Click "Edit Document"**
7. **Change `role` from `"user"` to `"admin"`**
8. **Click "Update"**

## Method 4: Create a New Admin User via API (Programmatic)

You can also create a script to set admin role. Here's a Node.js example:

```javascript
// set-admin.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const User = require('./models/User').default;

async function setAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'your-email@example.com'; // Change this
    
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );
    
    if (user) {
      console.log('✅ User updated to admin:', user.email);
    } else {
      console.log('❌ User not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

setAdmin();
```

## After Setting Admin Role

1. **Log out** from your current session (if logged in)
2. **Log in again** to refresh your user data
3. **Navigate to `/admin`** - you should now have access!

## Verify Admin Access

After updating your role, you can verify it by:

1. **Check the browser console** - there should be no redirect errors
2. **Check localStorage** - Open DevTools → Application → Local Storage → Check the `user` object, it should show `"role": "admin"`
3. **Try accessing `/admin`** - You should see the admin dashboard

## Troubleshooting

### Still Redirecting?
1. **Clear localStorage**:
   - Open DevTools (F12)
   - Application → Local Storage → Clear all
   - Log in again

2. **Verify in Database**:
   - Double-check that `role: "admin"` is set in MongoDB
   - Make sure there are no typos (should be exactly `"admin"`, not `"Admin"` or `"ADMIN"`)

3. **Check Token**:
   - Your JWT token might be cached with old user data
   - Log out and log in again to get a new token

### Multiple Users?
If you have multiple users and want to set multiple admins:

```javascript
// Set multiple users as admin
db.users.updateMany(
  { email: { $in: ["admin1@example.com", "admin2@example.com"] } },
  { $set: { role: "admin" } }
)
```

## Security Note

⚠️ **Important**: Only grant admin access to trusted users. Admin users can:
- Upload and delete images
- Modify all banners
- Change locations
- Access sensitive data

Make sure to secure your admin panel in production!

