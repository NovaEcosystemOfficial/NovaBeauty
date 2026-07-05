import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const requiredVariables = [
  {
    name: "NEXT_PUBLIC_FIREBASE_API_KEY",
    usedIn: ["src/lib/firebase/client.ts"]
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    usedIn: ["src/lib/firebase/client.ts"]
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    usedIn: ["src/lib/firebase/client.ts"]
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    usedIn: ["src/lib/firebase/client.ts"]
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    usedIn: ["src/lib/firebase/client.ts"]
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_APP_ID",
    usedIn: ["src/lib/firebase/client.ts"]
  }
];

const envFiles = [".env.local", ".env"];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...valueParts] = line.split("=");
        return [key.trim(), valueParts.join("=").trim()];
      })
  );
}

const fileEnv = envFiles.reduce(
  (env, fileName) => ({
    ...env,
    ...parseEnvFile(resolve(process.cwd(), fileName))
  }),
  {}
);

const resolvedEnv = {
  ...fileEnv,
  ...process.env
};

const missingVariables = requiredVariables.filter(({ name }) => !resolvedEnv[name]);

if (missingVariables.length > 0) {
  console.error("\nNova Environment check failed.");
  console.error("Missing required environment variables:\n");

  for (const variable of missingVariables) {
    console.error(`- ${variable.name}`);
    console.error(`  Used in: ${variable.usedIn.join(", ")}`);
  }

  console.error("\nCreate or update .env.local locally, and configure the same variables in Vercel.");
  console.error("Use .env.example as the source of truth for variable names.\n");
  process.exit(1);
}

console.log("Nova Environment check passed.");
