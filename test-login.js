// Test login with different passwords
console.log("🔐 Testing login credentials...");

async function testLogin() {
    const passwords = ['password123', 'pelnora123', 'test123', '123456', 'password'];
    
    for (const password of passwords) {
        try {
            console.log(`\nTrying password: ${password}`);
            
            const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test@pelnora.com',
                    password: password
                })
            });
            
            if (loginResponse.ok) {
                console.log(`✅ Login successful with password: ${password}`);
                return password;
            } else {
                console.log(`❌ Failed with password: ${password}`);
            }
            
        } catch (error) {
            console.error(`❌ Error with password ${password}:`, error.message);
        }
    }
    
    console.log("\n❌ None of the common passwords worked");
    return null;
}

testLogin();