const getBackendURL = () => {
  // If we are in the browser, use the current hostname to resolve the backend
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // If accessing via IP (e.g. from a phone), use that IP for the backend too
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.includes("onrender.com")) {
      return `http://${hostname}:8000`;
    }
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
};

export const config = {
  backend_url: getBackendURL(),
};