import { Bot, InlineKeyboard } from "grammy";
import { supabase } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/utils";
import { getContributions } from "@/services/contribution";

const token = process.env.TELEGRAM_BOT_TOKEN;

export const getBot = () => {
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  }
  return new Bot(token);
};

export const setupBotCommands = (bot: Bot) => {
  // Main Welcome / Start Command
  bot.command("start", async (ctx) => {
    if (!ctx.chat) return;

    try {
      const isGroup = ctx.chat.type === "group" || ctx.chat.type === "supergroup";
      const name = isGroup ? ctx.chat.title : ctx.from?.first_name;

      // Register chat in Supabase
      await supabase
        .from("telegram_users")
        .upsert({
          telegram_id: ctx.chat.id,
          username: ctx.chat.username || ctx.from?.username || null,
          first_name: name || "Group",
        }, { onConflict: "telegram_id" });

      const siteUrl = getSiteUrl();
      const keyboard = new InlineKeyboard()
        .url("📝 Register Club Member", `${siteUrl}/join`)
        .url("🌐 Visit Website", siteUrl)
        .row()
        .url("💬 FOSS United Forum", "https://forum.fossunited.org/t/foss-club-government-college-of-engineering-erode/8457");

      const welcomeText = `🚀 *Welcome to FOSS GCEE Bot* 🎉\n\n` +
        `Free & Open Source Software Club — Government College of Engineering, Erode.\n\n` +
        `*Quick Commands:*\n` +
        `• /events — View upcoming workshops & events\n` +
        `• /projects — Explore student open-source projects\n` +
        `• /faq — Frequently asked questions & resources\n` +
        `• /help — Full list of bot commands\n\n` +
        (isGroup ? `✅ *This group is now registered for announcements!*` : `✅ *You are now registered for direct announcements!*`);

      await ctx.reply(welcomeText, { parse_mode: "Markdown", reply_markup: keyboard });
    } catch (err) {
      console.error("Start command error:", err);
    }
  });

  // /events command - Fetches upcoming events from Supabase
  bot.command("events", async (ctx) => {
    try {
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "upcoming")
        .order("start_date", { ascending: true })
        .limit(5);

      if (error) throw error;

      if (!events || events.length === 0) {
        await ctx.reply("📅 *No upcoming events scheduled right now.* Stay tuned for announcements!", { parse_mode: "Markdown" });
        return;
      }

      const siteUrl = getSiteUrl();
      for (const ev of events) {
        let msg = `📅 *${ev.title}*\n\n` +
          `🗓 *Date:* ${ev.start_date}${ev.end_date && ev.end_date !== ev.start_date ? ` to ${ev.end_date}` : ""}\n` +
          `⏰ *Time:* ${ev.start_time} - ${ev.end_time} IST\n` +
          `📍 *Venue:* ${ev.venue}\n`;

        if (ev.speaker) {
          msg += `🎙 *Speaker(s):* ${ev.speaker}\n`;
        }
        if (ev.handled_by) {
          msg += `👤 *Lead:* ${ev.handled_by}\n`;
        }
        if (ev.description) {
          msg += `\n_${ev.description.slice(0, 150)}${ev.description.length > 150 ? "..." : ""}_\n`;
        }

        const keyboard = new InlineKeyboard()
          .url("👉 View & Register on Website", `${siteUrl}/events/${ev.slug}`);

        await ctx.reply(msg, { parse_mode: "Markdown", reply_markup: keyboard });
      }
    } catch (err) {
      console.error("Events command error:", err);
      await ctx.reply("Failed to fetch events. Please try again later.");
    }
  });

  // /projects command - Fetches open source projects
  bot.command("projects", async (ctx) => {
    try {
      const allProjects = await getContributions();
      const projects = allProjects.slice(0, 6);

      if (!projects || projects.length === 0) {
        await ctx.reply("💻 *No projects listed yet.* Be the first student to showcase your open-source project!", { parse_mode: "Markdown" });
        return;
      }

      const siteUrl = getSiteUrl();
      let msg = `💻 *FOSS GCEE Student Open-Source Projects*\n\n`;

      const keyboard = new InlineKeyboard();
      projects.forEach((p: any, idx: number) => {
        const authorName = typeof p.memberId === "object" && p.memberId?.name ? p.memberId.name : "GCE Erode Student";
        msg += `${idx + 1}. *${p.title}*\n`;
        msg += `   👤 Author: ${authorName}\n`;
        msg += `   📝 _${p.description ? p.description.slice(0, 90) : "Open Source Project"}...\n\n`;

        if (p.url) {
          keyboard.url(`🔗 ${p.title}`, p.url).row();
        }
      });

      keyboard.url("🌐 View All Projects Archive", `${siteUrl}/projects`);

      await ctx.reply(msg, { parse_mode: "Markdown", reply_markup: keyboard });
    } catch (err) {
      console.error("Projects command error:", err);
      await ctx.reply("Failed to fetch projects. Please try again later.");
    }
  });

  // /faq command - Interactive FAQ menu
  bot.command("faq", async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text("🐧 What is Linux?", "faq_linux")
      .text("🐙 What is Git & GitHub?", "faq_git")
      .row()
      .text("🌟 What is GSoC & Outreachy?", "faq_gsoc")
      .text("🤝 How to Contribute?", "faq_contrib");

    await ctx.reply(
      `❓ *FOSS GCEE Knowledge Base & FAQ*\n\nTap any topic below to learn more:`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  });

  // /help command
  bot.command("help", async (ctx) => {
    const siteUrl = getSiteUrl();
    const helpText = `🤖 *FOSS GCEE Bot Command Center*\n\n` +
      `• /start — Welcome message & main links\n` +
      `• /events — Browse upcoming workshops & events\n` +
      `• /projects — Browse student open-source projects\n` +
      `• /faq — Open-source learning resources & guides\n` +
      `• /help — View this help menu\n\n` +
      `📞 *Need Any Clarification? Reach Out:*\n` +
      `• 📧 Email: bharathjp02@gmail.com\n` +
      `• 💬 Telegram: @bharathjp02\n\n` +
      `🌐 *Official Website:* ${siteUrl}\n` +
      `👥 *Community Group:* https://t.me/+etLLOTprJDU2NGM9`;

    await ctx.reply(helpText, { parse_mode: "Markdown" });
  });

  // Callback query handlers for interactive FAQ buttons
  bot.callbackQuery("faq_linux", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `🐧 *What is Linux?*\n\n` +
      `Linux is a free, open-source operating system kernel that powers over 90% of the world's supercomputers, cloud servers (AWS, Google Cloud), and Android phones!\n\n` +
      `Learning Linux gives you complete control over your computer, terminal skills, and system architecture. We hold regular Linux Fests at GCE Erode!`,
      { parse_mode: "Markdown" }
    );
  });

  bot.callbackQuery("faq_git", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `🐙 *What is Git & GitHub?*\n\n` +
      `Git is the industry-standard version control system that tracks code changes, while GitHub is the platform where millions of developers collaborate on open-source projects.\n\n` +
      `At FOSS GCEE, we teach you how to create Pull Requests, manage branches, and build a stellar developer portfolio on GitHub!`,
      { parse_mode: "Markdown" }
    );
  });

  bot.callbackQuery("faq_gsoc", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `🌟 *What is Google Summer of Code (GSoC)?*\n\n` +
      `GSoC is an annual global mentorship program by Google that pays student developers stipends ($1,500 - $3,000+) to write open-source code for organizations like Linux Foundation, Mozilla, Python, and Blender!\n\n` +
      `FOSS GCEE guides you step-by-step to prepare your proposal and get accepted!`,
      { parse_mode: "Markdown" }
    );
  });

  bot.callbackQuery("faq_contrib", async (ctx) => {
    await ctx.answerCallbackQuery();
    const siteUrl = getSiteUrl();
    await ctx.reply(
      `🤝 *How to Contribute to FOSS GCEE?*\n\n` +
      `1. Register as an official member at ${siteUrl}/join\n` +
      `2. Join our Telegram group: https://t.me/+etLLOTprJDU2NGM9\n` +
      `3. Submit your projects to be showcased on our site!\n` +
      `4. Attend weekly workshops and volunteer for event organizing!`,
      { parse_mode: "Markdown" }
    );
  });

  // Welcome new members automatically when they join the group
  bot.on("message:new_chat_members", async (ctx) => {
    const newMembers = ctx.message?.new_chat_members || [];
    const siteUrl = getSiteUrl();

    for (const member of newMembers) {
      if (member.is_bot) continue;

      const keyboard = new InlineKeyboard()
        .url("📝 Complete Club Profile", `${siteUrl}/join`)
        .url("🌐 Visit Website", siteUrl);

      const welcomeText = `Welcome *${member.first_name}* to FOSS GCEE! 🎉\n\n` +
        `We are thrilled to have you in the open-source community at GCE Erode.\n\n` +
        `*Quick Start:* Please complete your member registration on our website to receive workshop updates & certificates!`;

      await ctx.reply(welcomeText, { parse_mode: "Markdown", reply_markup: keyboard });
    }
  });

  // Basic anti-spam: Delete messages with unauthorized telegram invite links from non-admins in group
  bot.on("message:text", async (ctx, next) => {
    if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
      const text = ctx.message.text.toLowerCase();
      // If message contains scam/spam patterns or external group invite links
      if (text.includes("t.me/joinchat/") || text.includes("crypto") || text.includes("airdrop")) {
        try {
          const member = await ctx.getChatMember(ctx.from.id);
          const isAdmin = member.status === "creator" || member.status === "administrator";
          if (!isAdmin) {
            await ctx.deleteMessage();
            console.log(`Deleted spam message from ${ctx.from.first_name}`);
            return;
          }
        } catch {
          // Ignore permission errors
        }
      }
    }
    return next();
  });

  return bot;
};

// Function to send broadcast message with optional action buttons
export const sendTelegramBroadcast = async (message: string, actionUrl?: string, actionLabel?: string) => {
  const bot = getBot();
  const { data: users, error } = await supabase.from("telegram_users").select("telegram_id");

  if (error) throw error;
  if (!users || users.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  const keyboard = actionUrl ? new InlineKeyboard().url(actionLabel || "👉 View Details", actionUrl) : undefined;

  for (const user of users) {
    try {
      await bot.api.sendMessage(user.telegram_id, message, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      }).catch(async () => {
        // Fallback without markdown parsing if syntax error occurs
        await bot.api.sendMessage(user.telegram_id, message, {
          reply_markup: keyboard,
        });
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${user.telegram_id}:`, err);
      failed++;
    }
  }

  return { sent, failed };
};
