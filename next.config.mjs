/** @type {import('next').NextConfig} */
const nextConfig = {
    // reactStrictMode: false,
    async headers() {
        return [
            {
                source: "/manifest.json",
                headers: [
                    {
                        key: "Content-Type",
                        value: "application/manifest+json",
                    },
                    {
                        key: "Cache-Control",
                        value: "public, max-age=3600, must-revalidate",
                    },
                ],
            },
            {
                source: "/sw.js",
                headers: [
                    {
                        key: "Content-Type",
                        value: "application/javascript",
                    },
                    {
                        key: "Cache-Control",
                        value: "public, max-age=0, must-revalidate",
                    },
                    {
                        key: "Service-Worker-Allowed",
                        value: "/",
                    },
                ],
            },
            {
                source: "/icon-:size(192|512|maskable).png",
                headers: [
                    {
                        key: "Content-Type",
                        value: "image/png",
                    },
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
            {
                source: "/screenshot-:size(540x720).png",
                headers: [
                    {
                        key: "Content-Type",
                        value: "image/png",
                    },
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
