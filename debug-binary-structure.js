// Debug binary structure issue
console.log("🌳 Debugging binary structure...");

async function debugBinaryStructure() {
    try {
        // Login as Pelnora user
        console.log("1. Logging in as Pelnora user...");
        
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@pelnora.com',
                password: 'test123'
            })
        });
        
        if (!loginResponse.ok) {
            console.log("❌ Pelnora login failed");
            return;
        }
        
        const pelnoraUser = await loginResponse.json();
        const sessionCookie = loginResponse.headers.get('set-cookie');
        
        console.log("✅ Pelnora login successful!");
        console.log("   User ID:", pelnoraUser.id);
        
        console.log("\n2. Getting binary business debug info...");
        
        // Get binary business debug info
        const binaryDebugResponse = await fetch('http://localhost:3000/api/binary-business/debug', {
            method: 'GET',
            headers: {
                'Cookie': sessionCookie || ''
            }
        });
        
        if (binaryDebugResponse.ok) {
            const debugInfo = await binaryDebugResponse.json();
            console.log("✅ Binary debug info retrieved");
            console.log("   Binary Structure Count:", debugInfo.binaryStructureCount);
            console.log("   Direct Left Count:", debugInfo.directLeftCount);
            console.log("   Direct Right Count:", debugInfo.directRightCount);
            
            console.log("\n🌿 Direct Left Team:");
            debugInfo.directLeft.forEach(member => {
                console.log("   -", member.name, "(ID:", member.userId + ", Position:", member.position + ", Level:", member.level + ")");
            });
            
            console.log("\n🌿 Direct Right Team:");
            debugInfo.directRight.forEach(member => {
                console.log("   -", member.name, "(ID:", member.userId + ", Position:", member.position + ", Level:", member.level + ")");
            });
            
            if (debugInfo.directLeft.length === 0 && debugInfo.directRight.length === 0) {
                console.log("⚠️ No direct team members found in binary structure!");
            }
            
        } else {
            console.log("❌ Failed to get binary debug info");
            const errorText = await binaryDebugResponse.text();
            console.log("Error:", errorText);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

debugBinaryStructure();