import { Resend } from "resend";

let resendClient: Resend | null = null;

const initializeResend = () => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error("[EMAIL]   RESEND_API_KEY not set in environment variables");
        return null;
    }

    if (!resendClient) {
        resendClient = new Resend(apiKey);
        console.log("[EMAIL] ✓ Resend initialized successfully");
    }

    return resendClient;
};

export const sendEmail = async (email: string, subject: string, text: string, html?: string) => {
    try {
        console.log(`[EMAIL] Attempting to send email to: ${email}`);

        const resend = initializeResend();

        if (!resend) {
            console.error("[EMAIL] ✗ Failed to initialize Resend - check RESEND_API_KEY");
            return false;
        }

        const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: subject,
            text: text,
            html: html || text,
        });

        if (error) {
            console.error("[EMAIL] ✗ Resend API error:", error);
            return false;
        }

        console.log(`[EMAIL] ✓ Email sent successfully to ${email}`);
        console.log(`[EMAIL] Message ID: ${data?.id}`);

        return true;
    } catch (error: any) {
        console.error("[EMAIL] ✗ Failed to send email");
        console.error(`[EMAIL] Error: ${error.message}`);

        if (error.statusCode === 401 || error.statusCode === 403) {
            console.error("[EMAIL] Authentication failed - check RESEND_API_KEY");
        } else if (error.statusCode === 422) {
            console.error("[EMAIL] Invalid request - check email format and sender address");
        }

        return false;
    }
};
