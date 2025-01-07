import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);
const servicesMenu = Markup.inlineKeyboard([
  Markup.button.callback('Service 1', 'service_1'),
  Markup.button.callback('Service 2', 'service_2'),
  Markup.button.callback('Service 3', 'service_3'),
]);
// bot.start((ctx) => ctx.reply('Welcome! I am your Telegram bot.'));
bot.start((ctx) => {
  ctx.reply('Welcome! Here are the services we offer:', servicesMenu);
});

bot.help((ctx) => ctx.reply('How can I assist you?'));
bot.on('text', (ctx) => {
  console.log(ctx.message.text);
  ctx.reply(`You said: ${ctx.message.text}`);
});

bot.on('document', async (ctx) => {
  console.log(1);
  const document = ctx.message.document;
  console.log(document);

  if (!document) {
    ctx.reply('No document found!');
    return;
  }

  const { file_id, file_name, file_size, mime_type } = document;

  // Acknowledge receipt of the document
  await ctx.reply(`Received document:\n- Name: ${file_name}\n- Size: ${file_size} bytes\n- Type: ${mime_type}`);

  const fileId = document.file_id;
  const fileName = document.file_name;
  const fileSize = document.file_size;

  // Acknowledge receipt of the document
  await ctx.reply(`Received document:\n- Name: ${fileName}\n- Size: ${fileSize} bytes`);

  try {
    // Get the file URL
    const fileUrl = await ctx.telegram.getFileLink(fileId);

    // Download the file
    // const response = await axios.get(fileUrl.href, { responseType: 'stream' });
    // console.log(response.data);\

    const response = await axios.get(fileUrl.href);

    if (!response.data) {
      throw new Error('Failed to fetch document content.');
    }
    console.log('response', response.data);

    const documentContent = response.data.toString('utf-8');
    //   const filePath = `./downloads/${fileName}`;

    //   // Save to disk
    //   response.data.pipe(fs.createWriteStream(filePath));
    //   response.data.on('end', () => ctx.reply(`Document saved to ${filePath}`));
  } catch (error) {
    console.error('Error downloading document:', error);
    ctx.reply('Failed to download the document.');
  }
});

bot.help((ctx) => ctx.reply('How can I assist you?'));

// Handle the callback query when a user clicks a service
bot.on('callback_query', (ctx) => {
  const { data } = ctx.callbackQuery;
  let responseText = '';

  switch (data) {
    case 'service_1':
      responseText = 'You selected Service 1: Description of Service 1';
      break;
    case 'service_2':
      responseText = 'You selected Service 2: Description of Service 2';
      break;
    case 'service_3':
      responseText = 'You selected Service 3: Description of Service 3';
      break;
    default:
      responseText = 'Invalid selection';
      break;
  }

  // Answer the callback query and send a message
  ctx.answerCbQuery(); // This removes the loading state
  ctx.reply(responseText);
});

bot.launch();
