import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../bot';
import cancelCommand from './cancel';
import { searchVectors } from '../utils/searchVectors';
import { llmMemberFinder } from '../utils/llm';

export const memberFinderCommand = (bot: Telegraf<MyContext>) => {
  bot.command('finder', (ctx) => {
    console.log('nextdd');
    ctx.session.currentCommand = 'finder';
    ctx.reply('Find a superteam member to meet your job/community need');
    ctx.reply('Type in your description of the job and the skills need:');
  });

  cancelCommand(bot);

  bot.on('text', async (ctx, next) => {
    if (ctx.session.currentCommand !== 'finder') return next();

    const userInput = ctx.message.text;

    console.log(userInput);
    //Query Database to get context for LLM
    const queryResponse = await searchVectors([userInput], 'second-namespace');

    //LLM process and give answer based on the context given
    const response = await llmMemberFinder(userInput, queryResponse);

    return ctx.reply(response);
  });
};
