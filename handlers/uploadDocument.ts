import { Telegraf } from 'telegraf';
import axios from 'axios';
import { MyContext } from '../bot';

const uploadDocumentHandler = (bot: Telegraf<MyContext>) => {
  bot.on('document', async (ctx) => {
    if (ctx.session.currentCommand !== 'admin') {
      // Only admins should be able to upload documents
      return ctx.reply('You need to be an admin to upload documents.');
    }

    const document = ctx.message.document;
    if (!document) {
      return ctx.reply('No document found!');
    }

    const { file_id, file_name, file_size, mime_type } = document;

    // Acknowledge receipt of the document
    await ctx.reply(`Received document:\n- Name: ${file_name}\n- Size: ${file_size} bytes\n- Type: ${mime_type}`);

    try {
      // Get the file URL
      const fileUrl = await ctx.telegram.getFileLink(file_id);

      // Fetch the document content (assuming it's a text-based document)
      const response = await axios.get(fileUrl.href);

      if (!response.data) {
        throw new Error('Failed to fetch document content.');
      }

      console.log('Document content:', response.data); // Here you can process the document content further

      // Send the parsed content back to the user for verification
      return ctx.reply('Document uploaded and parsed successfully. You can now use it for AI training.');
    } catch (error) {
      console.error('Error during document upload:', error);
      return ctx.reply('There was an error processing the document. Please try again.');
    }
  });
};

export default uploadDocumentHandler;
