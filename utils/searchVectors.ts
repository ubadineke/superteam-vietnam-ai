import { Pinecone } from '@pinecone-database/pinecone';
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY as string });

const model = 'multilingual-e5-large';
const index = pc.index('superteam-vietnam-ai');

//Searches and returns similar vectors which is used for context
///how the query parameter should look like  query = ['What is Pawpaw.'];

export async function searchVectors(query: Array<string>) {
  // Convert the query into a numerical vector that Pinecone can search with
  const queryEmbedding = await pc.inference.embed(model, query, { inputType: 'query' });

  // Search the index for the three most similar vectors
  const queryResponse = await index.namespace('first-namespace').query({
    topK: 3,
    vector: queryEmbedding[0].values,
    includeValues: false,
    includeMetadata: true,
  });

  return queryResponse;
}
