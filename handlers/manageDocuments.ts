import { Markup } from 'telegraf';
import { MyContext } from '../bot';
import { Telegraf } from 'telegraf';
import Documents from '../models/document.model';

export const listAndManageDocuments = async (ctx: MyContext) => {
  try {
    const documents = await Documents.find();
    if (documents.length === 0) {
      return ctx.reply('No documents found.');
    }

    for (const [index, doc] of documents.entries()) {
      // Send text message with document details and a delete button
      await ctx.reply(
        `${doc.id}:\n${doc.name}`,
        Markup.inlineKeyboard([Markup.button.callback(`Delete ${doc.id}`, `delete_doc_${doc._id}`)])
      );
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
    ctx.reply('An error occurred while fetching documents.');
  }
};

export const handleDocumentDeletion = (bot: Telegraf<MyContext>) => {
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery?.data;
    if (data?.startsWith('delete_doc_')) {
      const docId = data.split('delete_doc_')[1];

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
};
