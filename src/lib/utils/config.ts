const getBackendURL = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (typeof window !== "undefined" && url && (url.includes("localhost") || url.includes("127.0.0.1"))) {
    if (window.location.hostname.includes("ngrok")) {
      return window.location.origin;
    }
    return url.replace("localhost", window.location.hostname).replace("127.0.0.1", window.location.hostname);
  }
  return url;
};

export const config = {
  backend_url: getBackendURL(),
};