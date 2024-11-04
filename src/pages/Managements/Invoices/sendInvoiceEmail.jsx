import emailjs from "emailjs-com";
import { pdf } from "@react-pdf/renderer";
import InvoiceDocument from "../Invoices/InvoiceDocument";
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_USER_ID } from "../../Admin/Email/EmailReactApi";

const convertBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const sendInvoiceEmail = async (user) => {
  try {
    // Tạo hóa đơn PDF cho user cụ thể
    const blob = await pdf(<InvoiceDocument user={user} />).toBlob();
    const pdfBase64 = await convertBlobToBase64(blob);

    // Thiết lập template params cho EmailJS với email cá nhân của từng user
    const templateParams = {
      to_name: user.username,
      to_email: user.email, // Đảm bảo gửi đến email cá nhân của từng user
      message: `Kính gửi ${user.username},\n\nĐính kèm hóa đơn tiền dịch vụ của bạn.\nTrân trọng cảm ơn!`,
      attachment: pdfBase64,
      filename: `${user.username}_invoice.pdf`, // Tên file PDF hóa đơn đính kèm
    };

    // Gửi email qua EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );

    if (response.status === 200) {
      console.log(`Email sent successfully to ${user.email}`);
    } else {
      console.warn(`Failed to send email to ${user.email}: ${response.text}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendInvoiceEmail;
