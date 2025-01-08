import { Telegraf } from 'telegraf';
import { MyContext } from '../bot';

const cancelCommand = (bot: Telegraf<MyContext>) => {
  bot.command('cancel', (ctx) => {
    // Check if there is any active session
    if (ctx.session.currentCommand) {
      // Clear session data
      ctx.session.currentCommand = null;
      ctx.session.awaitingPassword = false;
      return ctx.reply('Session canceled.');
    }
    return ctx.reply('No active session to cancel.');
  });
};

export default cancelCommand;
