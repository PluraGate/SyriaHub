
const fs = require('fs');
const path = require('path');

const statusPath = path.join(__dirname, '..', 'status.json');
const envPath = path.join(__dirname, '..', '.env.local');

try {
    const statusContent = fs.readFileSync(statusPath, 'utf8');
    const status = JSON.parse(statusContent);

    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update ANON_KEY
    if (status.ANON_KEY) {
        console.log('Updating NEXT_PUBLIC_SUPABASE_ANON_KEY...');
        const regex = /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/;
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${status.ANON_KEY}`);
        } else {
            envContent += `\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${status.ANON_KEY}`;
        }
    }

    // Update SERVICE_ROLE_KEY
    if (status.SERVICE_ROLE_KEY) {
        console.log('Updating SUPABASE_SERVICE_ROLE_KEY...');
        const regex = /SUPABASE_SERVICE_ROLE_KEY=.*/;
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `SUPABASE_SERVICE_ROLE_KEY=${status.SERVICE_ROLE_KEY}`);
        } else {
            envContent += `\nSUPABASE_SERVICE_ROLE_KEY=${status.SERVICE_ROLE_KEY}`;
        }
    }

    fs.writeFileSync(envPath, envContent);
    console.log('Successfully updated .env.local');

} catch (err) {
    console.error('Error updating .env.local:', err.message);
}
