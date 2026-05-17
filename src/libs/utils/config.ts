const getBackendURL = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL;
};

export const config = {
  backend_url: getBackendURL(),
};