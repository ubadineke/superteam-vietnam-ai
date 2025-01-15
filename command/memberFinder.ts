import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../bot';
import cancelCommand from './cancel';
// import uploadDocumentHandler from '../handlers/uploadDocument';
import { searchVectors } from '../utils/searchVectors';
// import { geminiLLM } from '../utils/gemini';
import { generateSuggestions } from '../utils/gemini2';
import { geminiKnowledgePortal, geminiMemberFinder } from '../utils/gemini';

// const TWEET_REFINEMENT_PROMPT = `
// You are assisting a content creator in generating and refining content ideas, specifically tweets. Use the following history of interactions to provide thoughtful and relevant suggestions.

// Interaction History:
// {formattedHistory}

// Now, refine the following tweet:
// "{userInput}"
// `;

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
    const response = await geminiMemberFinder(userInput, queryResponse);

    return ctx.reply(response);
  });
};
