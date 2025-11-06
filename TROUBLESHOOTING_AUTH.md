# Quick Troubleshooting Steps

## 1. Open Browser Console
- Press F12 in your browser
- Go to "Console" tab
- Try to sign up
- Look for any red errors

## 2. Check Network Tab
- Press F12
- Go to "Network" tab
- Try to sign up
- Look for failed requests (red)
- Check the response

## 3. Verify Supabase Connection
Open your browser console (F12) and paste this:

```javascript
fetch('https://bwrdwbmhxtrghyrrfofb.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cmR3Ym1oeHRyZ2h5cnJmb2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzU1NzMsImV4cCI6MjA3NDU1MTU3M30.yf4aP7pq_QkhRx_4nacfCcZ6mSsPtE3LeHw442gyv9U'
  }
}).then(r => console.log('Supabase connection:', r.status === 200 ? 'OK' : 'FAILED'))
```

Should show "Supabase connection: OK"

## 4. Common Issues

### Issue: "Invalid API key"
- Double-check your API keys in `.env.local`
- Restart dev server: Ctrl+C then `npm run dev`

### Issue: "Email signups are disabled"
- Go to Supabase Dashboard
- Authentication → Providers → Email
- Make sure "Enable Email Signup" is ON

### Issue: Nothing happens when clicking signup
- Check browser console for JavaScript errors
- Make sure you filled in both email and password

### Issue: Page redirects but still not logged in
- Clear browser cookies/cache
- Try incognito/private browsing mode

## 5. Manual Test
Try creating a user directly in Supabase:
1. Go to Supabase Dashboard
2. Authentication → Users
3. Click "Add user"
4. Create test user
5. Try logging in with those credentials

## 6. Check if database trigger exists
Go to Supabase Dashboard → Database → Functions
Look for: `handle_new_user`

If it doesn't exist, run this SQL:
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'researcher'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```
