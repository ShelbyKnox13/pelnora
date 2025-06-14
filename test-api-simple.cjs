// Simple API test
const http = require('http');

function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function testAPI() {
    try {
        console.log("🧪 Testing binary structure API...");
        
        // Login first
        console.log("1. Logging in...");
        const loginOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const loginData = JSON.stringify({
            email: 'test@pelnora.com',
            password: 'test123'
        });
        
        console.log("Making login request to:", `http://localhost:3000${loginOptions.path}`);
        const loginResponse = await makeRequest(loginOptions, loginData);
        
        console.log("Login response status:", loginResponse.statusCode);
        console.log("Login response body:", loginResponse.body);
        
        if (loginResponse.statusCode !== 200) {
            console.log("❌ Login failed:", loginResponse.statusCode);
            console.log("Response:", loginResponse.body);
            return;
        }
        
        console.log("✅ Login successful!");
        
        // Extract session cookie
        const setCookieHeader = loginResponse.headers['set-cookie'];
        const sessionCookie = setCookieHeader ? setCookieHeader[0] : '';
        
        // Test binary structure API
        console.log("\n2. Testing binary structure API...");
        const binaryOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/binary-structure/me',
            method: 'GET',
            headers: {
                'Cookie': sessionCookie
            }
        };
        
        const binaryResponse = await makeRequest(binaryOptions);
        
        if (binaryResponse.statusCode !== 200) {
            console.log("❌ Binary API failed:", binaryResponse.statusCode);
            console.log("Response:", binaryResponse.body);
            return;
        }
        
        console.log("✅ Binary structure API successful!");
        
        const binaryData = JSON.parse(binaryResponse.body);
        console.log("\n📊 Binary Structure Data:");
        console.log(`   User: ${binaryData.user?.name} (ID: ${binaryData.user?.id})`);
        console.log(`   Left Team Count: ${binaryData.leftTeamCount}`);
        console.log(`   Right Team Count: ${binaryData.rightTeamCount}`);
        console.log(`   Total Team Size: ${binaryData.totalTeamSize}`);
        console.log(`   Left Team Business: ₹${binaryData.leftTeamBusiness}`);
        console.log(`   Right Team Business: ₹${binaryData.rightTeamBusiness}`);
        console.log(`   Left Carry Forward: ₹${binaryData.leftCarryForward}`);
        console.log(`   Right Carry Forward: ₹${binaryData.rightCarryForward}`);
        
        if (binaryData.downline && binaryData.downline.length > 0) {
            console.log(`\n   Downline Members (${binaryData.downline.length}):`);
            binaryData.downline.forEach(member => {
                console.log(`     - ${member.name} (ID: ${member.id}) - Position: ${member.position}, Level: ${member.level}`);
            });
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
    }
}

testAPI();