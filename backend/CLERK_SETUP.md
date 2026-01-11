# Clerk Authentication Setup Guide

This guide will walk you through setting up Clerk authentication for the Odyssey application.

## Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Click "Sign Up" or "Get Started"
3. Create an account using your email or GitHub

## Step 2: Create a New Application

1. After logging in, click "Create Application" or go to the dashboard
2. Give your application a name (e.g., "Odyssey Dashboard")
3. Select your preferred authentication methods:
   - ✅ Email/Password (recommended for development)
   - ✅ Email Link (passwordless)
   - Optional: Google, GitHub, etc.
4. Click "Create Application"

## Step 3: Get Your API Keys

### Frontend - Publishable Key

1. In your Clerk dashboard, navigate to "API Keys"
2. Find the **Publishable Key** (starts with `pk_test_` for development)
3. Copy this key
4. Create/edit `frontend/health-dashboard/.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### Backend - Secret Key

1. In the same "API Keys" section
2. Find the **Secret Key** (starts with `sk_test_` for development)
3. ⚠️ **IMPORTANT**: Keep this key secret! Never commit it to Git
4. Copy this key
5. Create/edit `backend/.env`:

```env
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

## Step 4: Configure Allowed Redirect URLs

1. In Clerk dashboard, go to "Paths" or "Settings"
2. Add allowed redirect URLs:
   - Development: `http://localhost:5173`
   - Production: Your deployed URL
3. Save changes

## Step 5: Test Authentication

1. Start both backend and frontend servers
2. Navigate to `http://localhost:5173`
3. You should be redirected to Clerk's sign-in page
4. Create a test account
5. After signing in, you should be redirected to the dashboard

## Clerk Dashboard Features

### User Management
- View all registered users
- Manually create/delete users
- Ban/unban users
- View user sessions

### Customization
- Customize sign-in/sign-up pages
- Add your logo and branding
- Configure authentication methods
- Set up email templates

### Security
- Configure session settings
- Set up multi-factor authentication (MFA)
- Configure password requirements
- View security events

## Development vs Production

### Development (Default)
- Keys start with `pk_test_` and `sk_test_`
- No email verification required (can be configured)
- More relaxed security for testing

### Production
1. Switch to production instance in Clerk dashboard
2. Get production keys (`pk_live_` and `sk_live_`)
3. Update environment variables
4. Enable email verification
5. Configure stricter security settings

## Environment Variables Checklist

### Frontend (`frontend/health-dashboard/.env.local`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### Backend (`backend/.env`)
```env
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
FLASK_ENV=development
DATABASE_PATH=streaks.db
```

## Common Issues

### "Missing Publishable Key" Error
- ✅ Check `.env.local` exists in correct location
- ✅ Restart Vite dev server after adding keys
- ✅ Verify key format (should start with `pk_test_`)

### "Invalid Session" or "401 Unauthorized"
- ✅ Check backend `.env` has correct secret key
- ✅ Verify both servers are running
- ✅ Clear browser cookies and try again
- ✅ Check Clerk dashboard for any security blocks

### Sign-in Page Not Showing
- ✅ Verify `@clerk/clerk-react` is installed
- ✅ Check browser console for errors
- ✅ Ensure ClerkProvider wraps your app in main.jsx

### Redirect Loop
- ✅ Check allowed redirect URLs in Clerk dashboard
- ✅ Verify routing setup in App.jsx
- ✅ Clear browser cache and cookies

## Security Best Practices

1. **Never commit `.env` or `.env.local` files**
   - Add them to `.gitignore`
   - Use `.env.example` files as templates

2. **Rotate keys if exposed**
   - Clerk allows generating new keys
   - Update all deployments after rotation

3. **Use environment-specific keys**
   - Test keys for development
   - Production keys for live app
   - Never mix the two

4. **Enable MFA for production**
   - Protect user accounts
   - Reduce security risks

## Testing Authentication

### Test the Full Flow:

1. **Sign Up**
   ```
   Visit: http://localhost:5173
   Click: "Sign Up"
   Enter: Email and password
   Verify: Account created successfully
   ```

2. **Sign In**
   ```
   Visit: http://localhost:5173/sign-in
   Enter: Credentials
   Verify: Redirected to dashboard
   ```

3. **User Profile**
   ```
   Click: User avatar in header
   Verify: Dropdown shows options
   Check: Manage account, Sign out
   ```

4. **Sign Out**
   ```
   Click: Sign out from user menu
   Verify: Redirected to sign-in page
   ```

5. **Protected Routes**
   ```
   Try: Access http://localhost:5173/ while signed out
   Verify: Redirected to sign-in page
   ```

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk API Reference](https://clerk.com/docs/reference/backend-api)
- [Clerk Community](https://discord.com/invite/clerk)

## Support

If you encounter issues:
1. Check the Clerk dashboard status page
2. Review browser console for errors
3. Check network tab for failed API calls
4. Consult Clerk documentation
5. Open an issue on the project GitHub

---

**Remember**: Keep your secret keys secure and never share them publicly!
