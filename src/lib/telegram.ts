import { Bot } from "grammy";
import { supabase } from "@/lib/supabase";

const token = process.env.TELEGRAM_BOT_TOKEN;

// Throw an error early if we try to use the bot without a token
export const getBot = () => {
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  }
  return new Bot(token);
};

export const setupBotCommands = (bot: Bot) => {
  bot.command("start", async (ctx) => {
    if (!ctx.chat) return;

    try {
      const isGroup = ctx.chat.type === "group" || ctx.chat.type === "supergroup";
      const name = isGroup ? ctx.chat.title : ctx.from?.first_name;

      const { error } = await supabase
        .from("telegram_users")
        .upsert({
          telegram_id: ctx.chat.id, // Save the chat ID (works for groups and private users)
          username: ctx.chat.username || ctx.from?.username || null,
          first_name: name || "Group",
        }, { onConflict: "telegram_id" });

      if (error) {
        console.error("Error saving telegram user/group:", error);
        await ctx.reply("Oops, something went wrong while registering. Please try again later.");
        return;
      }

      await ctx.reply(
        isGroup
          ? `Welcome to FOSS GCEE 🎉\n\nThis group is now registered for announcements!`
          : `Welcome to FOSS GCEE 🎉\n\nYou are now registered for announcements.\n\nYou'll receive notifications whenever we organize a new event.`
      );
    } catch (err) {
      console.error(err);
    }
  });

  return bot;
};

// Function to send broadcast message
export const sendTelegramBroadcast = async (message: string) => {
  const bot = getBot();
  const { data: users, error } = await supabase.from("telegram_users").select("telegram_id");
  
  if (error) throw error;
  if (!users || users.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await bot.api.sendMessage(user.telegram_id, message);
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${user.telegram_id}:`, err);
      failed++;
    }
  }

  return { sent, failed };
};
