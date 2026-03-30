
import emailService from './src/utils/emailService.js';

async function testEmail() {
    console.log('Testing Email Service...');
    try {
        const result = await emailService.sendOTP('test@example.com', '123456', 'verification');
        console.log('Result:', result);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testEmail();
