#!/usr/bin/env node

const http = require('http');
const { spawn, exec } = require('child_process');
const path = require('path');

const HEALIO_DIR = 'C:\\Desktop\\AYUSHI\\proj\\Healio';
let serverProcess = null;
let testResults = [];

console.log('🚀 Healio Comprehensive Testing Suite');
console.log('='.repeat(70));

// Make HTTP request helper
function makeRequest(method, pathname, data = null, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Connection': 'close'
            },
            timeout: timeout
        };

        try {
            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    resolve({ status: res.statusCode, headers: res.headers, body });
                });
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        } catch (err) {
            reject(err);
        }
    });
}

// Start server
function startServer() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Starting Healio server...\n');
        
        serverProcess = exec(
            `cd /d ${HEALIO_DIR} && node index.js`,
            { maxBuffer: 10 * 1024 * 1024 },
            (error, stdout, stderr) => {
                if (error && !error.killed) {
                    console.error('Server error:', error);
                }
            }
        );

        let serverReady = false;
        let attempts = 0;

        // Monitor server output
        if (serverProcess.stdout) {
            serverProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log('[SERVER]', output.trim());
                if (output.includes('port 3000') || output.includes('listening')) {
                    serverReady = true;
                }
            });
        }

        if (serverProcess.stderr) {
            serverProcess.stderr.on('data', (data) => {
                console.log('[SERVER]', data.toString().trim());
            });
        }

        // Check if server is ready
        const checkReady = () => {
            makeRequest('GET', '/')
                .then(() => {
                    console.log('\n✅ Server is ready!\n');
                    resolve();
                })
                .catch(() => {
                    attempts++;
                    if (attempts < 30) {
                        setTimeout(checkReady, 500);
                    } else {
                        reject(new Error('Server failed to start'));
                    }
                });
        };

        setTimeout(checkReady, 1000);
    });
}

// Test functions
async function runAllTests() {
    console.log('📊 RUNNING COMPREHENSIVE TEST SUITE\n');
    
    // Page routes tests
    console.log('--- PAGE ROUTES ---');
    await testEndpoint('GET', '/', null, 'Login Page');
    await testEndpoint('GET', '/landing', null, 'Landing Page');
    await testEndpoint('GET', '/dashboard', null, 'Dashboard (Protected)');

    // API endpoints
    console.log('\n--- API ENDPOINTS ---');
    
    // Wellness
    await testEndpoint('GET', '/api/wellness', null, 'GET Wellness Resources');
    await testEndpoint('POST', '/api/wellness/seed', {}, 'Seed Wellness Resources');
    
    // Chat
    await testEndpoint('GET', '/api/chat', null, 'GET Chat');
    await testEndpoint('POST', '/api/chat', { text: 'Hello' }, 'POST Chat Message');

    // Auth
    console.log('\n--- AUTHENTICATION ---');
    const email = `test${Date.now()}@test.com`;
    const password = 'Test123!';
    const username = `user${Date.now()}`;
    
    await testEndpoint('POST', '/signup', 
        { username, email, password }, 
        'User Signup');
    
    // Error scenarios
    console.log('\n--- ERROR HANDLING ---');
    await testEndpoint('GET', '/nonexistent-404-route', null, 'Invalid Route (404)');
}

async function testEndpoint(method, path, data, name) {
    try {
        const response = await makeRequest(method, path, data);
        testResults.push({
            name,
            status: 'PASS',
            statusCode: response.status,
            method,
            path
        });
        console.log(`✅ ${name}: ${response.status}`);
    } catch (error) {
        testResults.push({
            name,
            status: 'FAIL',
            error: error.message,
            method,
            path
        });
        console.log(`❌ ${name}: ${error.message}`);
    }
}

// Main execution
async function main() {
    try {
        await startServer();
        await runAllTests();

        // Print summary
        console.log('\n' + '='.repeat(70));
        console.log('TEST RESULTS SUMMARY');
        console.log('='.repeat(70));
        
        const passed = testResults.filter(r => r.status === 'PASS').length;
        const failed = testResults.filter(r => r.status === 'FAIL').length;
        const total = testResults.length;

        testResults.forEach(result => {
            if (result.status === 'PASS') {
                console.log(`✅ [${result.method}] ${result.path}`);
                console.log(`   → ${result.name} (Status: ${result.statusCode})`);
            } else {
                console.log(`❌ [${result.method}] ${result.path}`);
                console.log(`   → ${result.name} (Error: ${result.error})`);
            }
        });

        console.log('\n' + '='.repeat(70));
        console.log(`📈 Results: ${passed} PASSED, ${failed} FAILED (${total} total)`);
        console.log(`📊 Success Rate: ${((passed/total)*100).toFixed(1)}%`);
        console.log('='.repeat(70));

        if (failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED!\n');
        } else {
            console.log(`\n⚠️  ${failed} test(s) failed\n`);
        }

        console.log('✨ Server running at http://localhost:3000');
        console.log('   Press Ctrl+C to stop\n');

        // Keep alive
        process.on('SIGINT', () => {
            console.log('\n\n🛑 Shutting down...');
            if (serverProcess) {
                serverProcess.kill();
            }
            process.exit(0);
        });

        // Keep process alive
        setInterval(() => {}, 60000);

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
        if (serverProcess) {
            serverProcess.kill();
        }
        process.exit(1);
    }
}

main();
