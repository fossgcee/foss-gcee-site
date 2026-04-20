"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Floating theme toggle — fixed bottom-right corner.
 * Always visible on every page / screen size.
 * Kept separate from the navbar so it's always easy to reach on mobile.
 */
export function FloatingThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	// Render a transparent placeholder the same size during SSR
	// to avoid layout shift — never renders visibly before hydration.
	if (!mounted) {
		return (
			<div
				className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-50 h-12 w-12 rounded-full pointer-events-none md:bottom-6 md:right-5"
				aria-hidden="true"
			/>
		);
	}

	const isDark = resolvedTheme === "dark";

	return (
		<button
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			className={[
				"fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-50 md:bottom-6 md:right-5",
				"w-12 h-12 rounded-full",
				"flex items-center justify-center",
				"shadow-lg",
				"transition-all duration-300 active:scale-90",
				// Light mode: white pill with subtle border
				"bg-white border border-black/10 text-black/80 hover:bg-black/5",
				// Dark mode: dark pill
				"dark:bg-[#1a1a1a] dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10",
			].join(" ")}
		>
			{/* Sun icon — visible in light mode */}
			<Sun
				className="absolute w-5 h-5 transition-all duration-500"
				style={{
					transform: isDark ? "rotate(90deg) scale(0)" : "rotate(0deg) scale(1)",
					opacity: isDark ? 0 : 1,
				}}
			/>
			{/* Moon icon — visible in dark mode */}
			<Moon
				className="absolute w-5 h-5 transition-all duration-500"
				style={{
					transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0)",
					opacity: isDark ? 1 : 0,
				}}
			/>
		</button>
	);
}
