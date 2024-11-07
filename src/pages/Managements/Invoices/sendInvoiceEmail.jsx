import emailjs from "emailjs-com";
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_USER_ID } from "../../Admin/Email/EmailReactApi";

const sendInvoiceEmail = async (user) => {
  try {
    if (!user.email) {
      throw new Error("User email is missing");
    }

    // Format the invoice details for inclusion in the email message
    const messageContent = `
      Dear ${user.username},

      Here is your service invoice for the current period:

      - Building: ${user.building}
      - Room: ${user.room}
      - Area Fee: ${user.totalarea} VND
      - Water Fee: ${user.totalwater} VND
      - Parking Fee: ${user.totalParking} VND
      - Total Amount Due: ${user.totalmoney} VND

      **Payment Instructions**:
      - Bank Account: 123-456-789
      - Bank: VietBank
      - Phone: +84 123 456 789
      - Address: 123 Nguyen Trai, Hanoi

      Please complete the payment by the due date.

      Thank you for your prompt attention to this matter.

      Best regards,
      Homey Management Team
    `;

    // Setup template parameters
    const templateParams = {
      to_name: user.username,
      to_email: user.email,
      message: messageContent, // Send formatted content in the email message
    };

    // Send the email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );

    if (response.status === 200) {
      console.log(`Invoice email sent successfully to ${user.email}`);
    } else {
      console.warn(`Failed to send invoice email to ${user.email}: ${response.text}`);
    }
  } catch (error) {
    console.error("Error sending invoice email:", error.message);
  }
};

export default sendInvoiceEmail;
