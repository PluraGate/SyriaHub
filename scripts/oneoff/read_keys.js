const fs = require('fs');
try {
    const raw = fs.readFileSync('supabase_status.json', 'utf8');
    // The file might be UTF-16LE, let's try to handle that if readFileSync doesn't automatically.
    // Actually node fs usually handles BOM.
    // But the previous error said "unsupported mime type text/plain; charset=utf-16le".
    // Let's try to read it as buffer and decode if needed, or just utf16le.

    let content = raw;
    // If it looks like JSON, parse it.
    const status = JSON.parse(content);
    console.log('ANON_KEY=' + status.ANON_KEY);
    console.log('SERVICE_ROLE_KEY=' + status.SERVICE_ROLE_KEY);
    console.log('API_URL=' + status.API_URL);
} catch (e) {
    console.error('Error parsing:', e);
    // Try reading with utf16le
    try {
        const raw16 = fs.readFileSync('supabase_status.json', 'utf16le');
        // Strip BOM if present
        const cleanRaw = raw16.replace(/^\uFEFF/, '');
        const status = JSON.parse(cleanRaw);
        console.log('ANON_KEY=' + status.ANON_KEY);
        console.log('SERVICE_ROLE_KEY=' + status.SERVICE_ROLE_KEY);
        console.log('API_URL=' + status.API_URL);
    } catch (e2) {
        console.error('Error parsing utf16:', e2);
    }
}
