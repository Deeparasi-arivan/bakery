/**
 * SMS & OTP Service
 * Handles SMS provider integration with mock OTP fallback for development.
 */

const generateOTP = () => {
  // In development, default to configurable MOCK_OTP or 6-digit random number
  if (process.env.MOCK_OTP) {
    return process.env.MOCK_OTP;
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phoneNumber, otp) => {
  // Check if live SMS provider credentials are configured (e.g., Twilio / Fast2SMS)
  if (process.env.SMS_API_KEY) {
    try {
      console.log(`[SMS Provider] Sending OTP ${otp} to ${phoneNumber} via external provider...`);
      // Future integration with Twilio / Fast2SMS API call
      return { success: true, provider: 'external' };
    } catch (error) {
      console.error('[SMS Provider] Error sending SMS:', error);
      // Fallback to dev log
    }
  }

  // Development Mock Provider
  console.log(`\n========================================`);
  console.log(`[MOCK SMS SERVICE]`);
  console.log(`Sending SMS to: ${phoneNumber}`);
  console.log(`Your Bakery Verification OTP is: [ ${otp} ]`);
  console.log(`Expires in: 10 minutes`);
  console.log(`========================================\n`);

  return {
    success: true,
    provider: 'mock',
    message: `Mock OTP sent to ${phoneNumber}`
  };
};

module.exports = {
  generateOTP,
  sendOTP
};
