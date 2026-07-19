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

      const welcomeText = `Welcome to FOSS GCEE 🎉\n\n` +
        `📝 Register for the club here:\nhttps://fossgcee.vercel.app/join\n\n` +
        `🌐 Check out our FOSS United Forum thread:\nhttps://forum.fossunited.org/t/foss-club-government-college-of-engineering-erode/8457\n\n` +
        (isGroup ? `This group is now registered for announcements!` : `You are now registered for announcements. You'll receive notifications whenever we organize a new event.`);

      await ctx.reply(welcomeText);
    } catch (err) {
      console.error(err);
    }
  });

  // Welcome new members automatically when they join the group
  bot.on("message:new_chat_members", async (ctx) => {
    const newMembers = ctx.message?.new_chat_members || [];
    for (const member of newMembers) {
      if (member.is_bot) continue;
      
      const welcomeText = `Welcome ${member.first_name} to FOSS GCEE! 🎉\n\n` +
        `To get officially started, please complete your registration here:\nhttps://fossgcee.vercel.app/join\n\n` +
        `Also, check out our FOSS United Forum thread:\nhttps://forum.fossunited.org/t/foss-club-government-college-of-engineering-erode/8457`;
        
      await ctx.reply(welcomeText);
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
