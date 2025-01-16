import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../bot';
import cancelCommand from './cancel';

import { generateSuggestions } from '../utils/gemini2';

const TWEET_REFINEMENT_PROMPT = `
You are assisting a content creator in generating and refining content ideas, specifically tweets. Use the following history of interactions to provide thoughtful and relevant suggestions.

Interaction History:
{formattedHistory}

Now, refine the following tweet:
"{userInput}"
`;

export const contentAdvisorCommand = (bot: Telegraf<MyContext>) => {
  bot.command('contentadvisor', (ctx) => {
    console.log('nextdd');
    ctx.session.currentCommand = 'contentadvisor';
    ctx.reply('Create and collaboratively refine your tweets');
    // });
    // bot.command('draft_message', (ctx) => {
    ctx.session.currentDraft = '';
    ctx.session.messageHistory = [];
    ctx.reply(
      'Welcome to Content Advisor! Let’s collaboratively refine your tweets.\n\nPlease provide your initial draft:'
    );
  });

  cancelCommand(bot);

  bot.on('text', async (ctx, next) => {
    if (!ctx.from || ctx.session.currentCommand !== 'contentadvisor') return next();

    const userId = ctx.from.id;
    const userInput = ctx.message.text;

    if (ctx.session.currentDraft !== null) {
      const userInput = ctx.message.text;

      // / Fetch session history from Redis and build context for the LLM
      const refinedTweet = await generateSuggestions(userId, userInput, ctx.session.messageHistory);
      // Fetch session history from Redis and build context for the LLM
      // const refinedTweet = await generateSuggestions(userId, userInput, ctx.session.messageHistory);

      // Add LLM response to history
      ctx.session.messageHistory.push({ role: 'assistant', content: refinedTweet });

      // Respond with LLM suggestions
      await ctx.reply(`LLM Suggestion:\n${refinedTweet}\n\nRefine further or approve?`);

      // Respond with LLM suggestions
      ctx.reply(`LLM Suggestion:\n${refinedTweet}\n\nRefine further or approve?`);
    }
  });
};
