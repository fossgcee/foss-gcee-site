import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	turbopack: {
		root: path.resolve(__dirname),
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			// Google Drive / Google User Content (for member photos)
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "drive.google.com",
			},
			// Imgur
			{
				protocol: "https",
				hostname: "i.imgur.com",
			},
			// GitHub raw content
			{
				protocol: "https",
				hostname: "raw.githubusercontent.com",
			},
			// Cloudinary
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
			// Vercel Blob (for event posters already uploaded)
			{
				protocol: "https",
				hostname: "*.public.blob.vercel-storage.com",
			},
			// Ente Albums
			{
				protocol: "https",
				hostname: "albums.ente.com",
			},
			{
				protocol: "https",
				hostname: "api.ente.com",
			},
		],
		formats: ["image/avif", "image/webp"],
		deviceSizes: [640, 750, 828, 1080, 1200],
	},
	async headers() {
		return [
			{
				// Apply security headers to all routes
				source: "/(.*)",
				headers: [
					// Prevent the site from being framed (clickjacking protection)
					{ key: "X-Frame-Options", value: "SAMEORIGIN" },
					// Prevent MIME-type sniffing
					{ key: "X-Content-Type-Options", value: "nosniff" },
					// Control referrer information
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					// Disable browser features that aren't needed
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
					// Force HTTPS (1 year, include subdomains)
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000; includeSubDomains",
					},
					// Basic XSS protection header (belt-and-suspenders)
					{ key: "X-XSS-Protection", value: "1; mode=block" },
				],
			},
		];
	},
};

export default nextConfig;

