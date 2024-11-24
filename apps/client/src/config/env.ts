import { z } from 'zod';

const envSchema = z.object({
  AUTH_STORAGE_KEY: z.string(),
  API_BASE_URL: z.string(),
});

type Env = z.infer<typeof envSchema>;

const processEnv: Env = {
  AUTH_STORAGE_KEY: import.meta.env.VITE_AUTH_STORAGE_KEY,
  API_BASE_URL: import.meta.env.VITE_API_URL,
};

function validateEnv() {
  try {
    return envSchema.parse(processEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('적절한 환경 변수가 설정되지 않았습니다.');
    }

    throw error;
  }
}

export const ENV = validateEnv();
