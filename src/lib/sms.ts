const CUSTOMER_ID = process.env.MESSAGECENTRAL_CUSTOMER_ID;
const AUTH_TOKEN = process.env.MESSAGECENTRAL_AUTH_TOKEN;

/**
 * Sends a 6-digit OTP code to the recipient's mobile number via Message Central
 */
export async function sendSmsOtp(mobile: string): Promise<string | null> {
  try {
    if (!CUSTOMER_ID || !AUTH_TOKEN) {
      console.error('Message Central credentials are not configured in .env');
      return null;
    }

    let cleanMobile = mobile.trim().replace(/\D/g, '');
    if (cleanMobile.length > 10) {
      if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
        cleanMobile = cleanMobile.substring(2);
      }
    }

    if (cleanMobile.length !== 10) {
      console.error('Invalid mobile number length:', cleanMobile);
      return null;
    }

    const url = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&flowType=SMS&mobileNumber=${cleanMobile}&customerId=${CUSTOMER_ID}&otpLength=6`;
    console.log(`Sending SMS OTP to +91${cleanMobile} via Message Central...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authToken': AUTH_TOKEN
      }
    });

    if (response.ok) {
      const resJson = await response.json();
      if (resJson.responseCode === 200 && resJson.message === 'SUCCESS' && resJson.data) {
        console.log(`SMS OTP sent successfully. Verification ID: ${resJson.data.verificationId}`);
        return resJson.data.verificationId;
      } else {
        console.error('Message Central Send API error response:', resJson);
      }
    } else {
      console.error('Message Central Send HTTP error:', response.status, response.statusText);
    }
  } catch (err) {
    console.error('Error in sendSmsOtp:', err);
  }
  return null;
}

/**
 * Validates a user-supplied OTP code using Message Central's validateOtp endpoint
 */
export async function verifySmsOtp(verificationId: string, code: string): Promise<boolean> {
  try {
    if (!CUSTOMER_ID || !AUTH_TOKEN) {
      console.error('Message Central credentials are not configured in .env');
      return false;
    }

    const url = `https://cpaas.messagecentral.com/verification/v3/validateOtp?verificationId=${verificationId}&code=${code.trim()}`;
    console.log(`Validating SMS OTP for verification ID: ${verificationId}...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'authToken': AUTH_TOKEN
      }
    });

    if (response.ok) {
      const resJson = await response.json();
      if (
        resJson.responseCode === 200 &&
        resJson.message === 'SUCCESS' &&
        resJson.data &&
        resJson.data.responseCode === '200'
      ) {
        console.log('SMS OTP verified successfully!');
        return true;
      } else {
        console.error('Message Central Validate API error response:', resJson);
      }
    } else {
      console.error('Message Central Validate HTTP error:', response.status, response.statusText);
    }
  } catch (err) {
    console.error('Error in verifySmsOtp:', err);
  }
  return false;
}
