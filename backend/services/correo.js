
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function enviarCorreo({ para, asunto, html }) {
    return transporter.sendMail({
        from: `"SIGESPAD - Papelería San Diego" <${process.env.EMAIL_USER}>`,
        to: para,
        subject: asunto,
        html
    });
}

module.exports = {
    enviarCorreo,
    verificarConexionCorreo: () => transporter.verify()
};
