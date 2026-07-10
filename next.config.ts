import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
		],
		formats: ["image/avif", "image/webp"],
		deviceSizes: [640, 750, 828, 1080, 1200],
	},
};

export default nextConfig;
