import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../bot';
import cancelCommand from './cancel';
import { searchVectors } from '../utils/searchVectors';
import { geminiKnowledgePortal } from '../utils/gemini';

export const portalCommand = (bot: Telegraf<MyContext>) => {
  bot.command('portal', (ctx) => {
    console.log('nextdd');
    ctx.session.currentCommand = 'portal';
    ctx.reply('Ask and Get Answered on Questions regarding Superteam Vietnam:');
  });

  cancelCommand(bot);

  bot.on('text', async (ctx, next) => {
    if (ctx.session.currentCommand !== 'portal') return next();
    const userInput = ctx.message.text;

    console.log(userInput);
    //Query Database to get context for LLM
    const queryResponse = await searchVectors([userInput], 'first-namespace');

    //LLM process and give answer based on the context given
    const response = await geminiKnowledgePortal(userInput, queryResponse);

    return ctx.reply(response);
  });
};
