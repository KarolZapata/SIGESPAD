
const { authenticate } = require("@google-cloud/local-auth");
const fs = require("node:fs/promises");
const path = require("node:path");

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send"
];

async function autorizarGmail() {
  try {
    const auth = await authenticate({
      keyfilePath: CREDENTIALS_PATH,
      scopes: SCOPES
    });

    if (!auth.credentials.refresh_token) {
      throw new Error(
        "Google no devolvió un refresh token. " +
        "No se guardaron credenciales nuevas."
      );
    }

    await fs.writeFile(
      TOKEN_PATH,
      JSON.stringify(auth.credentials, null, 2),
      { mode: 0o600 }
    );

    console.log("Autorización completada correctamente.");
    console.log("Token guardado en backend/token.json.");
    console.log("No compartas ni subas ese archivo a GitHub.");
  } catch (error) {
    console.error("No se pudo autorizar Gmail:", error.message);
  }
}

autorizarGmail();
