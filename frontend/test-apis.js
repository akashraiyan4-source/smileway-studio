const apiEndpoints = [
    '/api/payment-invoice',
    '/api/multilanguage-support',
    '/api/sentiment-analyzer',
    '/api/whatsapp-integration',
    '/api/lead-scoring'
];

async function runTests() {
    console.log('🔍 Testing AI Backend API Endpoints...\n');

    for (const endpoint of apiEndpoints) {
        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: 'Test Client',
                    phone: '+8801700000000',
                    treatmentName: 'Dental Implants',
                    amount: 200,
                    userMessage: 'Hello, I need urgent help.',
                    reviewText: 'Great service, very professional!'
                })
            });

            const data = await response.json();
            if (response.ok) {
                console.log(`[Endpoint: ${endpoint}] -> Status: ${response.status} ✅ SUCCESS`);
            } else {
                console.log(`[Endpoint: ${endpoint}] -> Status: ${response.status} ⚠️ CHECK`, data);
            }
        } catch (error) {
            console.error(`[Endpoint: ${endpoint}] -> ❌ ERROR: ${error.message}`);
        }
    }
}

runTests();