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