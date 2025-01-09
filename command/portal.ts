import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../bot';
import cancelCommand from './cancel';
import uploadDocumentHandler from '../handlers/uploadDocument';
import { searchVectors } from '../utils/searchVectors';
import { geminiLLM } from '../utils/gemini';

export const portalCommand = (bot: Telegraf<MyContext>) => {
  bot.command('portal', (ctx) => {
    console.log('nextdd');
    ctx.session.currentCommand = 'portal';
    ctx.reply('Ask and Get Answered on Questions regarding Superteam Vietnam:');
  });

  cancelCommand(bot);

  bot.on('text', async (ctx) => {
    if (ctx.session.currentCommand === 'portal') {
      const userInput = ctx.message.text;

      console.log(userInput);
      //Query Database to get context for LLM
      const queryResponse = await searchVectors([userInput]);

      //LLM process and give answer based on the context given
      const response = await geminiLLM(userInput, queryResponse);

      return ctx.reply(response);
    }
  });
};
