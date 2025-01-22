import { Context, Telegraf, session } from 'telegraf';
import { adminCommand } from './command/admin';
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/mongodb';
import { portalCommand } from './command/portal';
import Redis from 'ioredis';
import { MiddlewareFn } from 'telegraf';
import { contentAdvisorCommand } from './command/contentAdvisor';
import { memberFinderCommand } from './command/memberFinder';
import { assistantCommand } from './command/assistant';

dotenv.config();
const app = express();

// export const redisClient = new Redis(process.env.EXTERNAL_REDIS as string);
export const redisClient = new Redis();

interface SessionData {
  currentDraft?: string | null;
  messageHistory?: { role: string; content: string }[];
  currentCommand?: string;
}

export interface MyContext extends Context {
  session?: SessionData;
}

const redisSessionMiddleware: MiddlewareFn<MyContext> = async (ctx, next) => {
  if (!ctx.from) return next();

  const sessionKey = `session:${ctx.from.id}`;

  // Load session from Redis
  const sessionData = await redisClient.get(sessionKey);
  ctx.session = sessionData ? JSON.parse(sessionData) : {};

  // Save session back to Redis after processing
  await next();
  await redisClient.set(sessionKey, JSON.stringify(ctx.session), 'EX', 3600); // Session expires after 1 hour
};

if (process.env.BOT_TOKEN === undefined) {
  throw new TypeError('BOT_TOKEN must be provided!');
}

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN as string);

bot.use(
  session({
    defaultSession: (): SessionData => ({ currentCommand: null }),
  })
);

bot.use(redisSessionMiddleware);

bot.telegram.setMyCommands([
  { command: 'portal', description: 'Knowledge Portal' },
  { command: 'finder', description: 'Superteam Member Finder' },
  { command: 'assistant', description: 'Twitter Management Assistant' },
  { command: 'contentadvisor', description: 'Content advisor for Twitter' },
  { command: 'admin', description: 'Carry out admin actions' },
  { command: 'cancel', description: 'Cancel the current session' },
]);

adminCommand(bot);
portalCommand(bot);
contentAdvisorCommand(bot);
memberFinderCommand(bot);
assistantCommand(bot);

// bot.launch().then(() => {
//   console.log('Bot is running...');
// });

app.use(bot.webhookCallback('/webhook'));

// Start the local server
app.listen(3000, () => {
  bot.telegram.setWebhook(process.env.WEBHOOK_URL as string);
  console.log('Bot is running on port 3000');
});

connectDB();
// bot.launch();

bot.command('start', (ctx) => {
  ctx.reply('Welcome! This bot uses webhooks.');
});
