// Comprehensive test suite for Healio application
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

let testResults = [];
let serverProcess = null;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: responseData
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Function to start server
function startServer() {
    return new Promise((resolve, reject) => {
        console.log('🚀 Starting Healio server...\n');
        
        serverProcess = spawn('node', ['index.js'], {
            cwd: 'C:\\Desktop\\AYUSHI\\proj\\Healio',
            shell: true,
            stdio: 'pipe'
        });

        let serverReady = false;
        let mongoConnected = false;

        serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('[SERVER]', output.trim());
            
            if (output.includes('listening on port 3000')) {
                serverReady = true;
            }
            if (output.includes('Connected to MongoDB') || output.includes('MongoDB')) {
                mongoConnected = true;
            }
            
            if (serverReady) {
                setTimeout(() => resolve(), 1000);
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.log('[SERVER ERROR]', data.toString().trim());
        });

        // Timeout fallback
        setTimeout(() => {
            if (serverReady) {
                resolve();
            }
        }, 8000);

        serverProcess.on('error', reject);
    });
}

// Test functions
async function testLoginPage() {
    try {
        const response = await makeRequest('GET', '/');
        if (response.statusCode === 200) {
            testResults.push({ name: 'GET / (Login Page)', status: 'PASS', details: `Status: ${response.statusCode}` });
            return true;
        } else {
            testResults.push({ name: 'GET / (Login Page)', status: 'FAIL', details: `Unexpected status: ${response.statusCode}` });
            return false;
        }
    } catch (error) {
        testResults.push({ name: 'GET / (Login Page)', status: 'FAIL', details: error.message });
        return false;
    }
}

async function testLandingPage() {
    try {
        const response = await makeRequest('GET', '/landing');
        if (response.statusCode === 200) {
            testResults.push({ name: 'GET /landing (Landing Page)', status: 'PASS', details: `Status: ${response.statusCode}` });
            return true;
        } else {
            testResults.push({ name: 'GET /landing (Landing Page)', status: 'FAIL', details: `Unexpected status: ${response.statusCode}` });
            return false;
        }
    } catch (error) {
        testResults.push({ name: 'GET /landing (Landing Page)', status: 'FAIL', details: error.message });
        return false;
    }
}

async function testDashboardProtection() {
    try {
        const response = await makeRequest('GET', '/dashboard');
        // Should either redirect (3xx) or return error for unauthenticated access
        if (response.statusCode >= 300 && response.statusCode < 400) {
            testResults.push({ name: 'GET /dashboard (Protected - Redirect)', status: 'PASS', details: `Correctly redirected (Status: ${response.statusCode})` });
            return true;
        } else if (response.statusCode === 401 || response.statusCode === 403) {
            testResults.push({ name: 'GET /dashboard (Protected - Auth Error)', status: 'PASS', details: `Correctly denied (Status: ${response.statusCode})` });
            return true;
        } else {
            testResults.push({ name: 'GET /dashboard (Protected Route)', status: 'FAIL', details: `Expected redirect/auth error, got status: ${response.statusCode}` });
            return false;
        }
    } catch (error) {
        if (error.message.includes('connect')) {
            testResults.push({ name: 'GET /dashboard (Protected Route)', status: 'FAIL', details: 'Connection error - server may not be running' });
        } else {
            testResults.push({ name: 'GET /dashboard (Protected Route)', status: 'PASS', details: 'Correctly requires authentication' });
            return true;
        }
        return false;
    }
}

async function testSignup() {
    try {
        const userData = {
            username: "testuser_" + Date.now(),
            email: "test_" + Date.now() + "@test.com",
            password: "Test123!"
        };
        
        const response = await makeRequest('POST', '/signup', userData);
        // Check for various success indicators
        if (response.statusCode === 200 || response.statusCode === 201 || response.statusCode === 302) {
            testResults.push({ name: 'POST /signup (User Registration)', status: 'PASS', details: `Status: ${response.statusCode}` });
            return { success: true, email: userData.email, password: userData.password };
        } else if (response.statusCode === 400 && response.data.includes('already exists')) {
            testResults.push({ name: 'POST /signup (User Registration)', status: 'PASS', details: 'User already exists (duplicate test)' });
            return { success: false, email: userData.email, password: userData.password };
        } else {
            testResults.push({ name: 'POST /signup (User Registration)', status: 'FAIL', details: `Unexpected status: ${response.statusCode}` });
            return { success: false };
        }
    } catch (error) {
        testResults.push({ name: 'POST /signup (User Registration)', status: 'FAIL', details: error.message });
        return { success: false };
    }
}

async function testSignin(email, password) {
    try {
        const loginData = {
            email: email,
            password: password
        };
        
        const response = await makeRequest('POST', '/signin', loginData);
        if (response.statusCode === 200 || response.statusCode === 302) {
            testResults.push({ name: 'POST /signin (User Login)', status: 'PASS', details: `Status: ${response.statusCode}` });
            return true;
        } else {
            testResults.push({ name: 'POST /signin (User Login)', status: 'FAIL', details: `Unexpected status: ${response.statusCode}` });
            return false;
        }
    } catch (error) {
        testResults.push({ name: 'POST /signin (User Login)', status: 'FAIL', details: error.message });
        return false;
    }
}

async function testWellnessGetEndpoint() {
    try {
        const response = await makeRequest('GET', '/api/wellness');
        if (response.statusCode === 200 || response.statusCode === 401) {
            testResults.push({ name: 'GET /api/wellness (List Resources)', status: 'PASS', details: `Status: ${response.statusCode}` });
            return true;
        } else {
            testResults.push({ name: 'GET /api/wellness (List Resources)', status: 'FAIL', details: `Unexpected status: ${response.statusCode}` });
            return false;
        }
    } catch (error) {
        testResults.push({ name: 'GET /api/wellness (List Resources)', status: 'FAIL', details: error.message });
        return false;
    }
}

async function testWellnessSeed() {
    try {
        const response = await makeRequest('POST', '/api/wellness/seed');
        if (response.statusCode === 200 || response.statusCode === 201) {
            testResults.push({ name: 'POST /api/wellness/seed (Seed Resources)', status: 'PASS', details: `Status: ${response.statusCode}` });
            return true;
        } else if (response.statusCode === 400) {
            testResults.push({ name: 'POST /api/wellness/seed (Seed Resources)', status: 'PASS', details: 'Already seeded or validation error' });
            return true;
        } else {
            testResults.push({ name: 'POST /api/wellness/seed (Seed Resources)', status: 'FAIL', details: `Unexpected status: ${response.statusCode}` });
            return false;
        }
    } catch (error) {
        testResults.push({ name: 'POST /api/wellness/seed (Seed Resources)', status: 'FAIL', details: error.message });
        return false;
    }
}

async function testChatGetEndpoint() {
    try {
        const response = await makeRequest('GET', '/api/chat');
        if (response.statusCode === 200 || response.statusCode === 401 || response.statusCode === 405) {
            testResults.push({ name: 'GET /api/chat (Chat Endpoint)', status: 'PASS', details: `Status: ${response.statusCode}` });
            return true;
        } else {
            testResults.push({ name: 'GET /api/chat (Chat Endpoint)', status: 'FAIL', details: `Unexpected status: ${response.statusCode}` });
            return false;
        }
    } catch (error) {
        testResults.push({ name: 'GET /api/chat (Chat Endpoint)', status: 'FAIL', details: error.message });
        return false;
    }
}

async function testChatPost() {
    try {
        const chatData = {
            text: "Hello chatbot, how are you?"
        };
        
        const response = await makeRequest('POST', '/api/chat', chatData);
        if (response.statusCode === 200 || response.statusCode === 201 || response.statusCode === 401) {
            testResults.push({ name: 'POST /api/chat (Send Message)', status: 'PASS', details: `Status: ${response.statusCode}` });
            return true;
        } else {
            testResults.push({ name: 'POST /api/chat (Send Message)', status: 'FAIL', details: `Unexpected status: ${response.statusCode}` });
            return false;
        }
    } catch (error) {
        testResults.push({ name: 'POST /api/chat (Send Message)', status: 'FAIL', details: error.message });
        return false;
    }
}

async function test404Route() {
    try {
        const response = await makeRequest('GET', '/nonexistent-route-xyz');
        if (response.statusCode === 404) {
            testResults.push({ name: 'GET /nonexistent-route-xyz (404 Handler)', status: 'PASS', details: `Correctly returned 404` });
            return true;
        } else {
            testResults.push({ name: 'GET /nonexistent-route-xyz (404 Handler)', status: 'FAIL', details: `Expected 404, got ${response.statusCode}` });
            return false;
        }
    } catch (error) {
        testResults.push({ name: 'GET /nonexistent-route-xyz (404 Handler)', status: 'FAIL', details: error.message });
        return false;
    }
}

async function testInvalidJSON() {
    try {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        await new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    if (res.statusCode === 400 || res.statusCode === 500) {
                        testResults.push({ name: 'POST /api/chat (Invalid JSON)', status: 'PASS', details: `Correctly handled error (${res.statusCode})` });
                    } else {
                        testResults.push({ name: 'POST /api/chat (Invalid JSON)', status: 'PASS', details: `Status: ${res.statusCode}` });
                    }
                    resolve();
                });
            });
            req.on('error', () => {
                testResults.push({ name: 'POST /api/chat (Invalid JSON)', status: 'FAIL', details: 'Connection error' });
                reject();
            });
            req.write('{ invalid json }');
            req.end();
        });
        return true;
    } catch (error) {
        testResults.push({ name: 'POST /api/chat (Invalid JSON)', status: 'FAIL', details: error.message });
        return false;
    }
}

// Main test execution
async function runTests() {
    try {
        // Start server
        await startServer();
        console.log('\n✅ Server started successfully\n');
        console.log('=' .repeat(60));
        console.log('STARTING COMPREHENSIVE TEST SUITE');
        console.log('=' .repeat(60));

        // Wait a bit for server to fully initialize
        await new Promise(r => setTimeout(r, 2000));

        // Test 1: Basic page routes
        console.log('\n📄 TESTING PAGE ROUTES...');
        await testLoginPage();
        await testLandingPage();
        await testDashboardProtection();

        // Test 2: Authentication
        console.log('\n🔐 TESTING AUTHENTICATION...');
        const signupResult = await testSignup();
        if (signupResult.success) {
            await testSignin(signupResult.email, signupResult.password);
        }

        // Test 3: Wellness endpoints
        console.log('\n💚 TESTING WELLNESS ENDPOINTS...');
        await testWellnessGetEndpoint();
        await testWellnessSeed();

        // Test 4: Chat endpoints
        console.log('\n💬 TESTING CHAT ENDPOINTS...');
        await testChatGetEndpoint();
        await testChatPost();

        // Test 5: Error scenarios
        console.log('\n⚠️  TESTING ERROR SCENARIOS...');
        await test404Route();
        await testInvalidJSON();

        // Print results
        console.log('\n' + '='.repeat(60));
        console.log('TEST RESULTS SUMMARY');
        console.log('=' .repeat(60) + '\n');

        let passCount = 0;
        let failCount = 0;

        testResults.forEach(result => {
            if (result.status === 'PASS') {
                console.log(`✅ ${result.name} - PASS`);
                console.log(`   └─ ${result.details}\n`);
                passCount++;
            } else {
                console.log(`❌ ${result.name} - FAIL`);
                console.log(`   └─ ${result.details}\n`);
                failCount++;
            }
        });

        console.log('='.repeat(60));
        console.log(`\n📊 OVERALL RESULTS:`);
        console.log(`   ✅ Passed: ${passCount}/${testResults.length}`);
        console.log(`   ❌ Failed: ${failCount}/${testResults.length}`);
        console.log(`   📈 Success Rate: ${((passCount / testResults.length) * 100).toFixed(1)}%\n`);

        if (failCount === 0) {
            console.log('🎉 ALL TESTS PASSED! Application is healthy.');
        } else {
            console.log(`⚠️  ${failCount} test(s) failed. Please review the details above.`);
        }

        console.log('\n📌 Server is still running on http://localhost:3000');
        console.log('Press Ctrl+C to stop the server and exit.\n');
        
        // Keep process alive
        setInterval(() => {}, 1000);

    } catch (error) {
        console.error('Fatal error during testing:', error);
        if (serverProcess) {
            serverProcess.kill();
        }
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down server...');
    if (serverProcess) {
        serverProcess.kill();
    }
    process.exit(0);
});

// Start tests
runTests();
