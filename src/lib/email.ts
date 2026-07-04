import nodemailer from 'nodemailer';
import { Order } from './db';

// Nodemailer SMTP Transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'infinitytraders.shop@gmail.com',
    pass: 'xubo gqul obss ooxl', // App-specific password
  },
});

// Outgoing envelope details
const FROM_EMAIL = '"Infinity Traders" <infinitytraders.shop@gmail.com>';

/**
 * Generates the master email envelope design wrapper (premium dark header + cream background + logo)
 */
function getEmailTemplateWrapper(title: string, bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
          body {
            margin: 0;
            padding: 0;
            background-color: #FAF9F6;
            font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif;
            color: #111111;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #FAF9F6;
            padding-top: 40px;
            padding-bottom: 40px;
          }
          .main-table {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.06);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          }
          .header {
            background-color: #000000;
            padding: 30px 20px;
            text-align: center;
          }
          .logo-text {
            color: #ffffff;
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 4px;
            margin: 0;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
          }
          .logo-icon {
            font-size: 22px;
            vertical-align: middle;
            margin-right: 8px;
            font-weight: normal;
          }
          .content-padding {
            padding: 40px 30px;
          }
          .footer {
            background-color: #000000;
            color: #888888;
            padding: 30px 20px;
            text-align: center;
            font-size: 11px;
            letter-spacing: 0.05em;
            line-height: 1.8;
          }
          .footer a {
            color: #ffffff;
            text-decoration: none;
          }
          .button {
            display: inline-block;
            background-color: #000000;
            color: #ffffff !important;
            padding: 14px 28px;
            border-radius: 9999px;
            text-decoration: none;
            font-weight: 600;
            font-size: 12px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-top: 20px;
            margin-bottom: 10px;
            text-align: center;
          }
          h1 {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.5px;
            margin-top: 0;
            margin-bottom: 16px;
            color: #000000;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            margin-top: 0;
            margin-bottom: 16px;
            color: #333333;
          }
          .divider {
            height: 1px;
            background-color: rgba(0, 0, 0, 0.06);
            margin: 25px 0;
          }
        </style>
      </head>
      <body>
        <center class="wrapper">
          <table class="main-table" cellpadding="0" cellspacing="0" border="0">
            <!-- HEADER -->
            <tr>
              <td class="header">
                <div class="logo-text">
                  <span class="logo-icon">∞</span> INFINITY TRADERS
                </div>
              </td>
            </tr>
            <!-- BODY CONTENT -->
            <tr>
              <td class="content-padding">
                ${bodyContent}
              </td>
            </tr>
            <!-- FOOTER -->
            <tr>
              <td class="footer">
                <strong>INFINITY TRADERS</strong><br>
                Dhanbad Logistics Hub, Jharkhand, India<br>
                Questions? Email us at <a href="mailto:support@infinitytraders.shop">support@infinitytraders.shop</a><br>
                <br>
                &copy; ${new Date().getFullYear()} Infinity Traders. All rights reserved.
              </td>
            </tr>
          </table>
        </center>
      </body>
    </html>
  `;
}

/**
 * Sends a welcome email to a new newsletter subscriber
 */
export async function sendNewsletterWelcomeEmail(firstName: string, email: string): Promise<boolean> {
  const subject = 'Welcome to the Infinity Core';
  const bodyContent = `
    <h1>WELCOME, ${firstName.toUpperCase()}</h1>
    <p>Thank you for subscribing to the Infinity Traders newsletter registry. You have been enrolled into the core circle for premium athletic footwear, activewear, and slides.</p>
    <p>As a registry member, you'll receive primary notification on restocks, limited drops, and exclusive offers straight from our distribution hubs.</p>
    <div style="text-align: center;">
      <a href="https://infinitytraders.shop/shop" class="button">EXPLORE THE SHOP</a>
    </div>
  `;
  const html = getEmailTemplateWrapper(subject, bodyContent);

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending newsletter email:', error);
    return false;
  }
}

/**
 * Emails a customer query to the store manager account
 */
export async function sendContactQueryEmail(
  name: string,
  email: string,
  subjectLine: string,
  message: string
): Promise<boolean> {
  const subject = `[SUPPORT TICKET] ${subjectLine}`;
  const bodyContent = `
    <h1>NEW SUPPORT QUERY RECEIVED</h1>
    <p>You have received a new support submission from the Infinity contact desk:</p>
    <table style="width: 100%; font-size: 14px; text-align: left; margin-bottom: 20px;" cellpadding="5">
      <tr>
        <th style="width: 120px; color: #777;">Customer Name:</th>
        <td>${name}</td>
      </tr>
      <tr>
        <th style="color: #777;">Customer Email:</th>
        <td>${email}</td>
      </tr>
      <tr>
        <th style="color: #777;">Subject:</th>
        <td>${subjectLine}</td>
      </tr>
    </table>
    <div class="divider"></div>
    <p style="font-weight: bold; margin-bottom: 8px;">Customer Message:</p>
    <div style="background-color: #FAF9F6; border: 1px solid rgba(0,0,0,0.04); padding: 20px; border-radius: 12px; font-size: 14px; line-height: 1.6; color: #111111;">
      ${message.replace(/\n/g, '<br>')}
    </div>
  `;
  const html = getEmailTemplateWrapper(subject, bodyContent);

  try {
    // Send email to admin
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: 'infinitytraders.shop@gmail.com',
      replyTo: email,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending contact query email:', error);
    return false;
  }
}

/**
 * Sends order placement confirmation email to customer
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const subject = `Order Confirmed - #${order.id}`;
  
  let itemsHtml = '';
  for (const item of order.items) {
    itemsHtml += `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.06); font-size: 14px;">
          <div style="font-weight: 600;">${item.name}</div>
          <div style="font-size: 12px; color: #666; margin-top: 2px;">
            Brand: ${item.brand} | Size: UK ${item.size} | Qty: ${item.quantity}
          </div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.06); text-align: right; font-weight: 600; font-size: 14px;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr>
    `;
  }

  const bodyContent = `
    <h1>ORDER CONFIRMED</h1>
    <p>Thank you for shopping with Infinity Traders. We have successfully registered your order and our logistics team at the Dhanbad Hub is preparing your shipment.</p>
    <div style="background-color: #FAF9F6; border: 1px solid rgba(0,0,0,0.04); padding: 20px; border-radius: 12px; margin: 25px 0;">
      <table style="width: 100%; font-size: 13px; text-align: left;" cellpadding="3">
        <tr>
          <th style="color: #777; width: 100px;">Order ID:</th>
          <td style="font-weight: 600;">${order.id}</td>
        </tr>
        <tr>
          <th style="color: #777;">Date:</th>
          <td>${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</td>
        </tr>
        <tr>
          <th style="color: #777;">Payment:</th>
          <td>${order.paymentMethod} (${order.paymentStatus})</td>
        </tr>
      </table>
    </div>

    <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Items Ordered</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      ${itemsHtml}
    </table>

    <table style="width: 100%; font-size: 13px; line-height: 1.8; margin-top: 15px;" cellpadding="3">
      <tr>
        <td style="color: #777;">Items Subtotal:</td>
        <td style="text-align: right;">₹${order.orderValue.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="color: #777;">18% GST (CGST + SGST):</td>
        <td style="text-align: right;">₹${order.gstAmount.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="color: #777;">Shipping Charges:</td>
        <td style="text-align: right;">₹${order.shippingCharges.toLocaleString('en-IN')}</td>
      </tr>
      <tr style="font-size: 16px; font-weight: 800; color: #000000;">
        <td style="padding-top: 10px; border-top: 1px solid #000000;">Total Amount:</td>
        <td style="padding-top: 10px; border-top: 1px solid #000000; text-align: right;">
          ₹${order.finalAmount.toLocaleString('en-IN')}
        </td>
      </tr>
    </table>

    <div class="divider"></div>

    <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Shipping Details</h2>
    <p style="font-size: 13px; line-height: 1.6; color: #333; margin: 0;">
      <strong>${order.customerName}</strong><br>
      ${order.shippingAddress.street}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
      Mobile: +91 ${order.customerMobile}
    </p>
  `;
  const html = getEmailTemplateWrapper(subject, bodyContent);

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

/**
 * Sends order status change email (Dispatched or Delivered) to customer
 */
export async function sendOrderStatusUpdateEmail(order: Order): Promise<boolean> {
  let statusText = '';
  let detailText = '';
  
  if (order.orderStatus === 'DISPATCHED') {
    statusText = 'SHIPPED / DISPATCHED';
    detailText = `Your order has been hand-offed to <strong>${order.courierName || 'our express courier partner'}</strong>. 
      <br><br>
      <strong>Tracking ID:</strong> ${order.trackingNumber || 'Available shortly'}<br>
      ${order.dispatchDetails ? `<strong>Details:</strong> ${order.dispatchDetails}` : ''}`;
  } else if (order.orderStatus === 'DELIVERED') {
    statusText = 'DELIVERED';
    detailText = 'Your shipment has been successfully delivered. Thank you for shopping with Infinity Traders. We hope you love your premium gear!';
  } else {
    // Other statuses (like Pending, Returned) don't trigger automatic emails or use standard templates
    return true;
  }

  const subject = `Order Status Update - #${order.id} [${order.orderStatus}]`;
  const bodyContent = `
    <h1>ORDER STATUS UPDATE: ${statusText}</h1>
    <p>Here is the latest shipping log for your order <strong>#${order.id}</strong> from the Dhanbad Logistics Hub:</p>
    
    <div style="background-color: #FAF9F6; border: 1px solid rgba(0,0,0,0.04); padding: 25px; border-radius: 12px; margin: 25px 0; font-size: 14px; line-height: 1.6; color: #111111;">
      ${detailText}
    </div>

    <p>You can track the transit status of your package at any time directly on our portal using the link below:</p>
    <div style="text-align: center;">
      <a href="https://infinitytraders.shop/track?id=${order.id}" class="button">TRACK SHIPMENT</a>
    </div>
  `;
  const html = getEmailTemplateWrapper(subject, bodyContent);

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    return false;
  }
}

/**
 * Sends a 6-digit OTP code to a customer's email address
 */
export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  const subject = 'Infinity Verification Code';
  const bodyContent = `
    <h1>VERIFICATION CODE</h1>
    <p>Please use the following One-Time Password (OTP) to complete your login/registration process. This code is valid for 5 minutes.</p>
    <div style="background-color: #FAF9F6; border: 1px solid rgba(0,0,0,0.04); padding: 20px; border-radius: 12px; font-size: 28px; font-weight: 800; text-align: center; letter-spacing: 6px; color: #000000; margin: 25px 0;">
      ${code}
    </div>
    <p>If you did not request this verification code, please ignore this email.</p>
  `;
  const html = getEmailTemplateWrapper(subject, bodyContent);

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

/**
 * Sends a welcome email to automatically registered guest customers containing their temporary password
 */
export async function sendGuestWelcomeEmail(email: string, name: string, password: string): Promise<boolean> {
  const subject = 'Your Infinity Traders Account Details';
  const bodyContent = `
    <h1>WELCOME TO INFINITY TRADERS</h1>
    <p>Hi ${name},</p>
    <p>Thank you for placing an order with us! We have automatically created a customer account for you so you can easily track your shipments and view invoices.</p>
    <div style="background-color: #FAF9F6; border: 1px solid rgba(0,0,0,0.04); padding: 20px; border-radius: 12px; margin: 25px 0;">
      <table style="width: 100%; font-size: 13px; text-align: left;" cellpadding="3">
        <tr>
          <th style="color: #777; width: 120px;">Login Email:</th>
          <td style="font-weight: 600;">${email}</td>
        </tr>
        <tr>
          <th style="color: #777;">Temp Password:</th>
          <td style="font-weight: 600; font-family: monospace;">${password}</td>
        </tr>
      </table>
    </div>
    <p>You can change your password at any time by logging in and navigating to your profile settings.</p>
  `;
  const html = getEmailTemplateWrapper(subject, bodyContent);

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending guest welcome email:', error);
    return false;
  }
}

