import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../bot';
import cancelCommand from './cancel';
import { searchVectors } from '../utils/searchVectors';
import {
  geminiGenerateTweetSuggestions,
  geminiKnowledgePortal,
  geminiMemberFinder,
  TweetContext,
} from '../utils/gemini';
import dotenv from 'dotenv';
import { getTwitterUserFollowing, getTwitterUserRecentTweets } from '../utils/fetchTwitterInfo';
dotenv.config();
export const assistantCommand = (bot: Telegraf<MyContext>) => {
  bot.command('assistant', (ctx) => {
    ctx.session.currentCommand = 'assistant';
    ctx.reply(
      'Iterate over tweets, suggest keywords, correcting Twitter handles, finalize and publish tweets\n\nEnter your iniital draft if any:'
    );
  });

  cancelCommand(bot);

  bot.on('text', async (ctx, next) => {
    if (ctx.session.currentCommand !== 'assistant') return next();
    const draft = ctx.message.text;

    const followedAccounts = await getTwitterUserFollowing();
    const recentTweets = await getTwitterUserRecentTweets();
    const trendingTopics = ['DeFi', 'Blockchain', 'Web3', 'Superteam', 'Solana', 'AI'];
    // ctx.reply(JSON.stringify(recentTweets));

    const context: TweetContext = {
      recentTweets,
      followedAccounts,
      trendingTopics,
    };
    const tweetSuggestions = await geminiGenerateTweetSuggestions(context, draft);

    await ctx.reply(tweetSuggestions);

    return ctx.reply(
      'Choose which tweet to publish',
      Markup.inlineKeyboard([
        [Markup.button.callback('Publish Tweet 1', 'PUBLISH_TWEET_1')],
        [Markup.button.callback('Publish Tweet 2', 'PUBLISH_TWEET_2')],
        [Markup.button.callback('Publish Tweet 3', 'PUBLISH_TWEET_3')],
      ])
    );
    // const userInput = ctx.message.text;

    // console.log(userInput);
    // //Query Database to get context for LLM
    // const queryResponse = await searchVectors([userInput], 'second-namespace');

    // //LLM process and give answer based on the context given
    // const response = await geminiMemberFinder(userInput, queryResponse);

    // return ctx.reply(response);
  });
};
