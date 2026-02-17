# EmailJS Setup Guide

To receive contact form submissions via email, follow these steps:

## 1. Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

## 2. Add Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Connect your email account
5. Note down the **Service ID** (e.g., `service_abc123`)

## 3. Create Email Template

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use this template structure:

```
Subject: New Contact Form Submission from {{from_name}}

Hello {{to_name}},

You have received a new message from your portfolio contact form:

Name: {{from_name}}
Email: {{from_email}}

Message:
{{message}}

---
This email was sent from your portfolio contact form.
```

4. Save the template and note down the **Template ID** (e.g., `template_xyz789`)

## 4. Get Your Public Key

1. Go to **Account** → **General** in the EmailJS dashboard
2. Find your **Public Key** (e.g., `ABCxyz123456789`)

## 5. Update Contact.tsx

Open `src/components/Contact.tsx` and replace these values around line 35-37:

```typescript
emailjs.send(
  'YOUR_SERVICE_ID',      // Replace with your Service ID from step 2
  'YOUR_TEMPLATE_ID',     // Replace with your Template ID from step 3
  templateParams,
  'YOUR_PUBLIC_KEY'       // Replace with your Public Key from step 4
)
```

Example with actual values:
```typescript
emailjs.send(
  'service_abc123',
  'template_xyz789',
  templateParams,
  'ABCxyz123456789'
)
```

## 6. Test Your Contact Form

1. Start your development server: `npm start`
2. Go to the contact section
3. Fill out and submit the form
4. You should receive an email and see a success toast notification!

## Template Variables Used

The contact form sends these variables to your email template:
- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email
- `{{message}}` - The message content
- `{{to_name}}` - Your name (set to "Yaswanth")

## Troubleshooting

- **No email received?** Check your EmailJS dashboard logs
- **Error message?** Verify your Service ID, Template ID, and Public Key are correct
- **Emails going to spam?** Add your EmailJS email to your contacts

## Need Help?

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Support](https://www.emailjs.com/support/)
