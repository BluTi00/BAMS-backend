import nodemailer from "nodemailer"

const sendMail = async (
	to: string,
	subject: string,
	text: string,
	html?: string
): Promise<void> => {
	try {
		// create a transporter
		const transporter = nodemailer.createTransport({
			service: "gmail",
			host: "smtp.gmail.com",
			port: 587,
			auth: {
				user: process.env.GMAIL_USER,
				pass: process.env.GMAIL_PASS, //APP PASSWORD
			},
		})

		// define the mail options
		const mailOptions = {
			from: process.env.GMAIL_USER,
			to,
			subject,
			text,
			html,
		}

		// send mail
		const info = await transporter.sendMail(mailOptions)
		console.log(`Email ${info.messageId} sent: ${info.response}`)
	} catch (error) {
		console.error(`Error sending email: ${error}`)
	}
}

export default sendMail
