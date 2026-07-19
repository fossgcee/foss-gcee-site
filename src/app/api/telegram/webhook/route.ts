import { webhookCallback } from "grammy";
import { getBot, setupBotCommands } from "@/lib/telegram";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const bot = getBot();
    setupBotCommands(bot);
    
    // GramMY provides a built-in webhook callback handler for std/http
    const handleUpdate = webhookCallback(bot, "std/http");
    
    return await handleUpdate(req);
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    // If the token isn't configured, we just fail gracefully so the app doesn't crash
    return new Response("Webhook Error", { status: 500 });
  }
}
