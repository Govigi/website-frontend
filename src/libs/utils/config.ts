const environments = {
  PROD: {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
  DEV: {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
};

export const ENV = process.env.NEXT_PUBLIC_ENVIRONMENT as "PROD" | "DEV";

export const config = {
  backend_url: environments[ENV].BACKEND_URL,
};