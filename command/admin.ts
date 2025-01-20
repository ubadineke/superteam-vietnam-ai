import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../bot';
import cancelCommand from './cancel';
import uploadDocumentHandler from '../handlers/uploadDocument';
import Documents from '../models/document.model';
import { handleDocumentDeletion, listAndManageDocuments } from '../handlers/manageDocuments';

export const adminCommand = (bot: Telegraf<MyContext>) => {
  bot.command('admin', (ctx, next) => {
    console.log('next');
    ctx.session.currentCommand = 'admin';
    ctx.session.awaitingPassword = true;
    ctx.reply('Enter the admin password:');
  });

  cancelCommand(bot);

  bot.on('text', async (ctx, next) => {
    if (ctx.session.currentCommand !== 'admin') return next();
    const userInput = ctx.message.text;
    if (ctx.session.awaitingPassword) {
      if (userInput === 'ADMIN_PASSWORD') {
        ctx.session.awaitingPassword = false;
        return ctx.reply(
          'Access granted! Here are the admin options:',
          Markup.keyboard([['📤 Upload Document', '🛠 Manage Documents ', '🔙 Exit Admin Mode']])
            .resize()
            .oneTime()
        );
      } else {
        ctx.session.currentCommand = null;
        ctx.session.awaitingPassword = false;
        return ctx.reply('Incorrect password. Exiting admin mode.');
      }
    }

    const validAdminOptions = [
      // '📊 View Reports',
      '🛠 Manage Documents',
      '📤 Upload Document',
      '🔙 Exit Admin Mode',
    ];
    if (!validAdminOptions.includes(userInput)) {
      return ctx.reply('Invalid option. Please select from the menu or enter /cancel to end session.');
    }

    switch (userInput) {
      case '🛠 Manage Documents':
        return listAndManageDocuments(ctx);
      case '📤 Upload Document':
        return ctx.reply('Upload a document to train the AI., One document at a time');
      case '🔙 Exit Admin Mode':
        ctx.session.currentCommand = null;
        return ctx.reply('You have exited admin mode.');
    }

    // } else {
    //   // If the user is not in admin mode, prevent them from accessing admin features
    //   return ctx.reply('You need to be an admin to access this feature.');
    // }
  });

  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery?.data;
    if (data?.startsWith('delete_doc_')) {
      const docId = data.split('delete_doc_')[1];
      console.log(data);

      // Custom code to delete the document or perform an action
      try {
        const doc = await Documents.findByIdAndDelete(docId);
        if (!doc) {
          await ctx.answerCbQuery('Document not found or already deleted.');
        } else {
          await ctx.answerCbQuery('Document deleted successfully.');
          await ctx.reply(`Document "${doc.name}" has been deleted.`);
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        await ctx.answerCbQuery('An error occurred while deleting the document.');
      }
    }
  });

  uploadDocumentHandler(bot);
  handleDocumentDeletion(bot);
};
