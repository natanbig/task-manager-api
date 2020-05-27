nodemailer = require('nodemailer')

module.exports = class Email {
    constructor(email, name) {
        this.email = email
        this.name = name
    }


    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    })

    sendEmail() {
        let info = this.transporter.sendMail({
        from: process.env.EMAIL,
        to: this.email,
        subject: 'Thank you for joing in',
        text: `Please let me know ${this.name} if you have any issue with your account`
    })

    }

}