const RESEND_API_KEY = process.env.SMTP_PASS  as string
const FROM          = process.env.EMAIL_FROM  as string || 'noreply@nexfluence.eu'
const FRONTEND_URL  = process.env.FRONTEND_URL as string || 'https://nexus.nexfluence.eu'

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from:    `Creator Nexus <${FROM}>`,
      to:      [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend API error: ${err}`)
  }
}

export async function verifyMailer(): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('Mailer — SMTP_PASS (Resend API key) not set')
    return
  }
  console.log('Mailer ready — using Resend HTTP API')
}

export async function sendOTPEmail(
  to: string,
  otp: string,
  type: 'signup' | 'login'
): Promise<void> {
  const subject =
    type === 'signup'
      ? 'Your Creator Nexus verification code'
      : 'Your Creator Nexus sign-in code'

  await sendEmail(to, subject, `
    <div style="font-family:'Rubik',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f7f5ff;border-radius:16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;background:linear-gradient(135deg,#ff33bc,#8061ff);border-radius:12px;padding:10px 20px;">
          <span style="color:#fff;font-weight:900;font-size:20px;letter-spacing:-0.03em;">N</span>
        </div>
        <p style="color:#0a0612;font-weight:700;font-size:18px;margin:12px 0 0;">Creator Nexus</p>
      </div>
      <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid rgba(10,6,18,0.08);">
        <p style="color:#0a0612;font-size:16px;font-weight:700;margin-bottom:8px;">
          ${type === 'signup' ? 'Verify your email' : 'Sign in to your account'}
        </p>
        <p style="color:rgba(10,6,18,0.55);font-size:14px;line-height:1.7;margin-bottom:24px;">
          Use the code below. It expires in 10 minutes.
        </p>
        <div style="text-align:center;background:#f7f5ff;border-radius:12px;padding:24px;margin-bottom:24px;border:1.5px solid rgba(128,97,255,0.20);">
          <span style="font-size:36px;font-weight:900;letter-spacing:0.18em;color:#0a0612;">${otp}</span>
        </div>
        <p style="color:rgba(10,6,18,0.40);font-size:12px;text-align:center;margin:0;">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
      <p style="color:rgba(10,6,18,0.30);font-size:11px;text-align:center;margin-top:20px;">
        © ${new Date().getFullYear()} Nexfluence. All rights reserved.
      </p>
    </div>
  `)
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  referralCode: string
): Promise<void> {
  await sendEmail(to, `Welcome to Creator Nexus, ${name.split(' ')[0]}!`, `
    <div style="font-family:'Rubik',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f7f5ff;border-radius:16px;">
      <p style="color:#0a0612;font-size:16px;font-weight:700;margin-bottom:8px;">
        You're in, ${name.split(' ')[0]} 🎉
      </p>
      <p style="color:rgba(10,6,18,0.55);font-size:14px;line-height:1.7;margin-bottom:16px;">
        Your Creator Nexus portfolio is live. Start building your profile and share your link with brands.
      </p>
      <p style="color:rgba(10,6,18,0.55);font-size:14px;line-height:1.7;margin-bottom:24px;">
        Your referral code is <strong style="color:#8061ff;">${referralCode}</strong>.
        Share it and earn coins every time a creator joins.
      </p>
      <a href="${FRONTEND_URL}/profile"
         style="display:inline-block;background:linear-gradient(90deg,#ff33bc,#8061ff);color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">
        Go to my studio →
      </a>
    </div>
  `)
}

export async function sendInboxNotification(
  to: string,
  creatorName: string,
  senderName: string,
  senderCompany: string,
  type: 'message' | 'inquiry',
  preview: string
): Promise<void> {
  const subject =
    type === 'inquiry'
      ? `New inquiry from ${senderName} on Creator Nexus`
      : `New message from ${senderName} on Creator Nexus`

  await sendEmail(to, subject, `
    <div style="font-family:'Rubik',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f7f5ff;border-radius:16px;">
      <p style="color:#0a0612;font-size:16px;font-weight:700;margin-bottom:8px;">
        Hey ${creatorName.split(' ')[0]}, you have a new ${type}
      </p>
      <p style="color:rgba(10,6,18,0.55);font-size:14px;margin-bottom:4px;">
        From: <strong style="color:#0a0612;">${senderName}</strong>
        ${senderCompany ? `· ${senderCompany}` : ''}
      </p>
      <div style="background:#fff;border-radius:12px;padding:20px;margin:16px 0;border-left:3px solid #8061ff;">
        <p style="color:rgba(10,6,18,0.70);font-size:14px;line-height:1.7;font-style:italic;margin:0;">
          "${preview}"
        </p>
      </div>
      <a href="${FRONTEND_URL}/profile"
         style="display:inline-block;background:linear-gradient(90deg,#ff33bc,#8061ff);color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">
        View in inbox →
      </a>
    </div>
  `)
}

export async function sendProActivatedEmail(
  to: string,
  name: string
): Promise<void> {
  await sendEmail(to, 'Your Pro plan is now active 🚀', `
    <div style="font-family:'Rubik',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f7f5ff;border-radius:16px;">
      <p style="color:#0a0612;font-size:16px;font-weight:700;margin-bottom:8px;">
        Welcome to Pro, ${name.split(' ')[0]} 🎉
      </p>
      <p style="color:rgba(10,6,18,0.55);font-size:14px;line-height:1.7;margin-bottom:24px;">
        Your Pro plan is now active. You have access to brand tracking,
        custom domain, advanced analytics, and everything else Pro unlocks.
      </p>
      <a href="${FRONTEND_URL}/profile"
         style="display:inline-block;background:linear-gradient(90deg,#ff33bc,#8061ff);color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">
        Go to my studio →
      </a>
    </div>
  `)
}