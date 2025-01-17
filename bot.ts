import { Context, Telegraf, Markup, session } from 'telegraf';
import { adminCommand } from './command/admin';
// import express from 'express';
// import axios from 'axios';
import dotenv from 'dotenv';
import connectDB from './config/mongodb';
import { portalCommand } from './command/portal';
import Redis from 'ioredis';
import { MiddlewareFn } from 'telegraf';
import { contentAdvisorCommand } from './command/contentAdvisor';
import { memberFinderCommand } from './command/memberFinder';
import { assistantCommand } from './command/assistant';
dotenv.config();
// const app = express();
// Create Redis session instance

// export const redisClient = new Redis({
//   host: process.env.REDIS_HOST || '127.0.0.1',
//   port: parseInt(process.env.REDIS_PORT || '6379'),
//   password: process.env.REDIS_PASSWORD || undefined,
// });

export const redisClient = new Redis(process.env.EXTERNAL_REDIS as string);

interface SessionData {
  currentDraft?: string | null;
  messageHistory?: { role: string; content: string }[];
  currentCommand?: string;
}

// interface SessionData {
//   currentCommand?: string | null;
// }

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

// app.use(bot.webhookCallback('/webhook'));

// Define your bot commands or logic

// Start the local server
// app.listen(3000, () => {
//   console.log('Bot is running on port 3000');
// });

// bot.launch({
//   webhook: {
//     domain: 'https://058a-105-116-10-122.ngrok-free.app/webhook',
//     port: 3000,
//     // hookPath: '/webhook',
//   },
// });

connectDB();
bot.launch();

bot.command('start', (ctx) => {
  ctx.reply('Welcome! This bot uses webhooks.');
});

// bot.start((ctx) => {
//   ctx.reply('Welcome! Here are the services we offer:');
// });

// bot.help((ctx) => ctx.reply('How can I assist you?'));

// Middleware to check if a user is in a session
// bot.use((ctx, next) => {
//   if (ctx.message?.text && ctx.message.text.startsWith('/')) {
//     if (ctx.session?.currentCommand && ctx.message?.text !== '/cancel') {
//       console.log(ctx.session.currentCommand);
//       return ctx.reply(
//         `You are currently in the "${ctx.session.currentCommand}" session. Use /cancel to exit before starting a new command.`
//       );
//     }
//   }
//   return next();
// });

// bot.command('admin', async (ctx, next) => {
//   ctx.session.currentCommand = 'admin'; // Set session
//   await ctx.reply('Please enter the admin password:');
//   // return next();
// });
// bot.on('text', async (ctx) => {
//   console.log('User input', ctx.message.text);
//   const userInput = ctx.message.text;
//   if (ctx.session.currentCommand === 'admin') {
//     // Logic for /admin
//     if (userInput === 'ADMIN_PASSWORD') {
//       ctx.session.currentCommand = null; // Clear session
//       return ctx.reply(
//         'Access granted! Here are the admin options:',
//         Markup.keyboard([['📊 Upload Document', '🛠 Manage Documents ']])
//           .resize()
//           .oneTime()
//       );
//     } else {
//       ctx.session.currentCommand = null; // Clear session
//       return ctx.reply('Incorrect password. Exiting admin mode.');
//     }
//   }
//   ctx.reply('THaken as usual FOrm');
// });

// // Handle the cancel command
// bot.command('cancel', (ctx) => {
//   if (ctx.session.currentCommand) {
//     ctx.session.currentCommand = null; // Clear session
//     return ctx.reply('Session canceled. You can now use other commands.');
//   }
//   return ctx.reply('No active session to cancel.');
// });

// bot.on('document', async (ctx) => {
//   console.log(1);
//   const document = ctx.message.document;
//   console.log(document);

//   if (!document) {
//     ctx.reply('No document found!');
//     return;
//   }

//   const { file_id, file_name, file_size, mime_type } = document;

//   // Acknowledge receipt of the document
//   await ctx.reply(`Received document:\n- Name: ${file_name}\n- Size: ${file_size} bytes\n- Type: ${mime_type}`);

//   const fileId = document.file_id;
//   const fileName = document.file_name;
//   const fileSize = document.file_size;

//   // Acknowledge receipt of the document
//   await ctx.reply(`Received document:\n- Name: ${fileName}\n- Size: ${fileSize} bytes`);

//   try {
//     // Get the file URL
//     const fileUrl = await ctx.telegram.getFileLink(fileId);

//     // Download the file
//     // const response = await axios.get(fileUrl.href, { responseType: 'stream' });
//     // console.log(response.data);\

//     const response = await axios.get(fileUrl.href);

//     if (!response.data) {
//       throw new Error('Failed to fetch document content.');
//     }
//     console.log('response', response.data);

//     const documentContent = response.data.toString('utf-8');
//     //   const filePath = `./downloads/${fileName}`;

//     //   // Save to disk
//     //   response.data.pipe(fs.createWriteStream(filePath));
//     //   response.data.on('end', () => ctx.reply(`Document saved to ${filePath}`));
//   } catch (error) {
//     console.error('Error downloading document:', error);
//     ctx.reply('Failed to download the document.');
//   }
// });

// bot.help((ctx) => ctx.reply('How can I assist you?'));

// // Handle the callback query when a user clicks a service
// bot.on('callback_query', (ctx) => {
//   const { data } = ctx.callbackQuery;
//   let responseText = '';

//   switch (data) {
//     case 'service_1':
//       responseText = 'You selected Service 1: Description of Service 1';
//       break;
//     case 'service_2':
//       responseText = 'You selected Service 2: Description of Service 2';
//       break;
//     case 'service_3':
//       responseText = 'You selected Service 3: Description of Service 3';
//       break;
//     default:
//       responseText = 'Invalid selection';
//       break;
//   }

//   // Answer the callback query and send a message
//   ctx.answerCbQuery(); // This removes the loading state
//   ctx.reply(responseText);
// });

// bot.launch();
