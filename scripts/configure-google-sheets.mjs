import { readFileSync, writeFileSync } from "node:fs";
import { createPrivateKey } from "node:crypto";

// Read only the credential fields; never print the key or the whole JSON.
try {
  const path = process.argv[2];
  if (!path) throw new Error();
  const credentials = JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
  if (credentials.type !== "service_account" ||
      typeof credentials.client_email !== "string" ||
      !credentials.client_email.endsWith(".iam.gserviceaccount.com") ||
      typeof credentials.private_key !== "string") throw new Error();
  if (createPrivateKey(credentials.private_key).asymmetricKeyType !== "rsa") throw new Error();
  let content = readFileSync(".env.local", "utf8");
  for (const [name, value] of Object.entries({
    GOOGLE_SERVICE_ACCOUNT_EMAIL: credentials.client_email,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: credentials.private_key,
  })) {
    const line = `${name}=${JSON.stringify(value)}`;
    const pattern = new RegExp(`^${name}=.*$`, "m");
    content = pattern.test(content) ? content.replace(pattern, () => line) : `${content.trimEnd()}\n${line}\n`;
  }
  writeFileSync(".env.local", content);
  console.log("Google credentials configured in .env.local.");
  console.log(`Service account to share the sheet with: ${credentials.client_email}`);
} catch {
  console.error("Could not import the service-account file. Check the path, format, and .env.local file.");
  process.exitCode = 1;
}
