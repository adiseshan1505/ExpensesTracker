import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            pool: true, // Reuse connections
            maxConnections: 1, // Limit connections (good for simple SMTP/Gmail)
            rateLimit: 5 // Optional: limit messages per second
        });
    }
    return transporter!;
};

export const sendEmail = async (email: string, subject: string, text: string, html?: string) => {
    try {
        const mailer = getTransporter();

        const info = await mailer.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: subject,
            text: text,
            html: html,
        });

        console.log("Email sent successfully", info.messageId);
    } catch (error) {
        console.log("Error sending email, ensure SMTP env vars are set");
        console.error(error);
        // We do not throw here to avoid crashing the request if email fails, 
        // but typically you might want to handle it.
        // For now, logging effectively shows the error.
        // Ensure we clear the transporter if it's potentially broken (e.g. auth failed), 
        // though usually nodemailer handles connection errors.
        transporter = null;
    }
};
