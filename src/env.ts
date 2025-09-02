import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_API_URL: z.string().url(),
  },
  runtimeEnv: {
    ...import.meta.env,
    VITE_API_URL: import.meta.env.VITE_API_URL || 'http://ezytek1706-003-site1.rtempurl.com/api',
  },
  emptyStringAsUndefined: true,
});
