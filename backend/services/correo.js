
const { google } = require("googleapis");
const fs = require("node:fs/promises");
const path = require("node:path");

const CREDENTIALS_PATH = path.join(__dirname, "..", "credentials.json");
const TOKEN_PATH = path.join(__dirname, "..", "token.json");

let gmailClientPromise;

async function obtenerGmail() {
  if (!gmailClientPromise) {
    gmailClientPromise = (async () => {
      let credencialesLocales = {};
      let tokenLocal = {};

      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        credencialesLocales = JSON.parse(
          await fs.readFile(CREDENTIALS_PATH, "utf8")
        );
      }

      if (!process.env.GOOGLE_REFRESH_TOKEN) {
        tokenLocal = JSON.parse(
          await fs.readFile(TOKEN_PATH, "utf8")
        );
      }

      const clientId =
        process.env.GOOGLE_CLIENT_ID ||
        credencialesLocales.installed.client_id;

      const clientSecret =
        process.env.GOOGLE_CLIENT_SECRET ||
        credencialesLocales.installed.client_secret;

      const refreshToken =
        process.env.GOOGLE_REFRESH_TOKEN ||
        tokenLocal.refresh_token;

      if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Faltan credenciales de Gmail API.");
      }

      const oauth = new google.auth.OAuth2(clientId, clientSecret);
      oauth.setCredentials({ refresh_token: refreshToken });

      return google.gmail({ version: "v1", auth: oauth });
    })();
  }

  return gmailClientPromise;
}

function codificarBase64Url(texto) {
  return Buffer.from(texto, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function enviarCorreo({ para, asunto, html }) {
  const gmail = await obtenerGmail();

  const mensaje = [
    `To: ${para}`,
    "From: SIGESPAD - Papelería San Diego <sigespad.papeleriasandiego@gmail.com>",
    `Subject: =?UTF-8?B?${Buffer.from(asunto, "utf8").toString("base64")}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(html, "utf8").toString("base64")
  ].join("\r\n");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: codificarBase64Url(mensaje) }
  });

  console.log("Correo enviado correctamente a:", para);
}

module.exports = {
  enviarCorreo,
  verificarConexionCorreo: async () => {
    const gmail = await obtenerGmail();
    await gmail.users.getProfile({ userId: "me" });
    return true;
  }
};
