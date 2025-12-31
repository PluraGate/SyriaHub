import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testSMTP() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = parseInt(process.env.SMTP_PORT || '465')
    const secure = process.env.SMTP_SECURE !== undefined
        ? process.env.SMTP_SECURE === 'true'
        : port === 465

    console.log('🔍 SMTP Diagnostic Tool')
    console.log('======================')
    console.log(`Host: ${host}`)
    console.log(`Port: ${port}`)
    console.log(`Secure: ${secure}`)
    console.log(`User: ${process.env.SMTP_USER}`)
    console.log(`Pass: ${process.env.SMTP_PASSWORD ? '********' : '❌ NOT SET'}`)
    console.log('')

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error('❌ Error: SMTP_USER and SMTP_PASSWORD must be set in .env.local')
        process.exit(1)
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
    })

    try {
        console.log('⏳ Verifying connection...')
        await transporter.verify()
        console.log('✅ SMTP Connection verified successfully!')

        console.log('\n⏳ Sending test email to sender...')
        const info = await transporter.sendMail({
            from: `"SyriaHub Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: 'SMTP Diagnostic Test 🚀',
            text: 'If you are receiving this, your SMTP settings on SyriaHub are configured correctly.',
            html: '<b>If you are receiving this, your SMTP settings on SyriaHub are configured correctly.</b>',
        })

        console.log('✅ Test email sent successfully!')
        console.log('Message ID:', info.messageId)
    } catch (error: any) {
        console.error('\n❌ SMTP Error occurred:')
        console.error('Code:', error.code)
        console.error('Message:', error.message)

        if (error.code === 'EAUTH') {
            console.log('\n💡 Tip: Check your username and password. If using Gmail, make sure you are using an "App Password".')
        } else if (error.code === 'ESOCKET') {
            console.log('\n💡 Tip: This might be a port/security mismatch. Try switching SMTP_SECURE between true and false, or changing the port.')
        }
    }
}

testSMTP()
