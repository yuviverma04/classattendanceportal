# Class Attendance Portal

## Production email setup

The backend sends password-reset OTPs and new student/faculty welcome emails through Gmail SMTP. In the deployment service, add these server environment variables before deploying:

```text
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_character_gmail_app_password
EMAIL_PORT=465
EMAIL_SECURE=true
```

`EMAIL_PASS` must be a Google App Password, not the normal Gmail password. Enable 2-Step Verification on the Gmail account, create an App Password, and use the 16-character value without spaces. After changing the variables, redeploy the backend and check its startup logs for `Email service is ready`.

If Gmail SMTP is blocked by the hosting network, use Resend over HTTPS instead:

```text
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Class Attendance Portal <a-verified-sender@yourdomain.com>
```

Create a Resend account, verify the sender domain or email address, copy the API key, add these variables to Render, and redeploy. `EMAIL_FROM` must be a sender verified in Resend.

To keep using the same Gmail account without SMTP, use Gmail API mode:

```text
EMAIL_PROVIDER=gmail-api
EMAIL_USER=verifybyotp@gmail.com
GMAIL_CLIENT_ID=your_google_oauth_client_id
GMAIL_CLIENT_SECRET=your_google_oauth_client_secret
GMAIL_REFRESH_TOKEN=your_google_oauth_refresh_token
```

Create a Google Cloud OAuth client, enable the Gmail API, authorize the account with the `https://www.googleapis.com/auth/gmail.send` scope, and add the resulting refresh token to Render. Do not commit these secrets to GitHub.