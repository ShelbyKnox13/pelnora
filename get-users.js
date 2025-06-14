// Get all users via admin API
console.log("👥 Getting all users...");

async function getUsers() {
    try {
        // Login as admin first
        console.log("1. Logging in as admin...");
        
        const adminLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@pelnora.com',
                password: 'admin123'
            })
        });
        
        if (!adminLoginResponse.ok) {
            console.log("❌ Admin login failed");
            return;
        }
        
        console.log("✅ Admin login successful!");
        const sessionCookie = adminLoginResponse.headers.get('set-cookie');
        
        // Get all users
        const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
            method: 'GET',
            headers: {
                'Cookie': sessionCookie || ''
            }
        });
        
        if (!usersResponse.ok) {
            console.log("❌ Failed to get users list");
            return;
        }
        
        const allUsers = await usersResponse.json();
        console.log(`\n📋 Found ${allUsers.length} users:`);
        
        allUsers.forEach(user => {
            console.log(`   - ${user.name} (ID: ${user.id}) - Email: ${user.email} - Role: ${user.role}`);
            if (user.referredBy) {
                const referrer = allUsers.find(u => u.id === user.referredBy);
                console.log(`     Referred by: ${referrer ? referrer.name : 'Unknown'} (ID: ${user.referredBy})`);
            }
        });
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

getUsers();