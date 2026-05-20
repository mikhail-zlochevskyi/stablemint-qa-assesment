import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const schema = z.object({
  BASE_URL: z.string().url(),
  TEST_USERNAME: z.string().min(1),
  TEST_PASSWORD: z.string().min(1),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;
export type Env = z.infer<typeof schema>;
