import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import generateRandomNumber from './generateRandomNumber';

dotenv.config();
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY as string });

const model = 'multilingual-e5-large';

export async function vectorizeAndUpsert(texts: string[], documentId: string, namespace: string) {
  const embeddings = await pc.inference.embed(
    model,
    texts.map((d) => d),
    { inputType: 'passage', truncate: 'END' }
  );

  // Target the index where you'll store the vector embeddings
  const index = pc.index('superteam-vietnam-ai');

  //generate random number to be concatenated with document
  const randNumber = generateRandomNumber(10);

  // Prepare the records for upsert
  // Each contains an 'id', the embedding 'values', and the original text as 'metadata'
  const records = texts.map((d, i) => ({
    id: `${documentId}_line_${i}`,
    values: embeddings[i].values,
    metadata: { text: d },
  }));

  // Upsert the vectors into the index
  await index.namespace(namespace).upsert(records);
}

export async function vectorizeAndUpsert2(texts: string[], documentId: string) {
  const embeddings = await pc.inference.embed(
    model,
    texts.map((d) => d),
    { inputType: 'passage', truncate: 'END' }
  );

  // Target the index where you'll store the vector embeddings
  const index = pc.index('superteam-vietnam-ai');

  //generate random number to be concatenated with document
  const randNumber = generateRandomNumber(10);

  // Prepare the records for upsert
  // Each contains an 'id', the embedding 'values', and the original text as 'metadata'
  const records = texts.map((d, i) => ({
    id: `${documentId}_line_${i}`,
    values: embeddings[i].values,
    metadata: { text: d },
  }));

  // Upsert the vectors into the index
  await index.namespace('second-namespace').upsert(records);
}
