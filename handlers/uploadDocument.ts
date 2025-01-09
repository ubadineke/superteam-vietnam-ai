import { Telegraf } from 'telegraf';
import axios from 'axios';
import { MyContext } from '../bot';
import { chunkData } from '../utils/chunkData';
import { vectorizeAndUpsert } from '../utils/vectorizeAndUpsert';
import generateRandomNumber from '../utils/generateRandomNumber';
import Documents from '../models/document.model';

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

    //APps own document ID
    const documentId = `document_${generateRandomNumber(10)}`;
    // Acknowledge receipt of the document
    await ctx.reply(
      `Received document:\n- Name: ${file_name}\n- Size: ${file_size} bytes\n- id: document_${documentId}`
    );
    await ctx.reply('Parsing...');

    try {
      // Get the file URL
      const fileUrl = await ctx.telegram.getFileLink(file_id);

      // Fetch the document content (assuming it's a text-based document)
      const response = await axios.get(fileUrl.href);

      if (!response.data) {
        throw new Error('Failed to fetch document content.');
      }

      console.log('Document content:', response.data); // Here you can process the document content further

      //Chunk Data
      const chunkedData = await chunkData(response.data);

      //Vectorize Chunked Data and Upsert to Pinecone
      await vectorizeAndUpsert(chunkedData, documentId);

      //If Vectorization is successful, store a reference in mongodb
      await Documents.create({ id: documentId, name: file_name });

      // Send the parsed content back to the user for verification
      ctx.reply('Document uploaded and parsed successfully. You can now query the AI.');
    } catch (error) {
      console.error('Error during document upload:', error);
      return ctx.reply('There was an error processing the document. Please try again.');
    }
  });
};

export default uploadDocumentHandler;
