// Import the Pinecone library
import { Pinecone } from '@pinecone-database/pinecone';
// import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
// import fs from '@node/fs';

// Initialize a Pin* as fs from 'fs/promises';econe client with your API key
const pc = new Pinecone({ apiKey: '' });

// Define a sample dataset where each item has a unique ID and piece of text
// const data = [
//   { id: 'vec1', text: 'Apple is a popular fruit known for its sweetness and crisp texture.' },
//   { id: 'vec2', text: 'The tech company Apple is known for its innovative products like the iPhone.' },
//   { id: 'vec3', text: 'Many people enjoy eating apples as a healthy snack.' },
//   {
//     id: 'vec4',
//     text: 'Apple Inc. has revolutionized the tech industry with its sleek designs and user-friendly interfaces.',
//   },
//   { id: 'vec5', text: 'An apple a day keeps the doctor away, as the saying goes.' },
//   {
//     id: 'vec6',
//     text: 'Apple Computer Company was founded on April 1, 1976, by Steve Jobs, Steve Wozniak, and Ronald Wayne as a partnership.',
//   },
// ];

const data =
  'Apple is a popular fruit known for its sweetness and crisp texture. The tech company Apple is known for its innovative products like the iPhone. Many people enjoy eating apples as a healthy snack. Apple Inc. has revolutionized the tech industry with its sleek designs and user-friendly interfaces. An apple a day keeps the doctor away, as the saying goes. Apple Computer Company was founded on April 1, 1976, by Steve Jobs, Steve Wozniak, and Ronald Wayne as a partnership';

// import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 0,
});
const texts = await textSplitter.splitText(data);

// console.log(texts);
// Convert the text into numerical vectors that Pinecone can index
const model = 'multilingual-e5-large';

const embeddings = await pc.inference.embed(
  model,
  texts.map((d) => d),
  { inputType: 'passage', truncate: 'END' }
);

// console.log(embeddings);

// Target the index where you'll store the vector embeddings
const index = pc.index('superteam-vietnam-ai');

// Prepare the records for upsert
// Each contains an 'id', the embedding 'values', and the original text as 'metadata'

const records = texts.map((d, i) => ({
  id: `vec${i}`,
  values: embeddings[i].values,
  metadata: { text: d },
}));
// console.log(records);

// Upsert the vectors into the index
await index.namespace('example-namespace').upsert(records);

// Define your query
const query = ['Give a brief history of the Apple company.'];

// Convert the query into a numerical vector that Pinecone can search with
const queryEmbedding = await pc.inference.embed(model, query, { inputType: 'query' });

// Search the index for the three most similar vectors
const queryResponse = await index.namespace('example-namespace').query({
  topK: 3,
  vector: queryEmbedding[0].values,
  includeValues: false,
  includeMetadata: true,
});

// console.log(queryResponse);

console.log('Initializing Google AI API...');
const googleAI = new GoogleGenerativeAI('AIzaSyAF35O_zPESjEH6mXQjzKh7AQFSaqZDiTo');
// const embedModel = googleAI.getEmbeddingModel('embedding-gecko-001');

const gmodel = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// const llmModel = googleAI.getChatModel('gemini-pro');

// console.log("Generating query embedding...");
// const queryEmbedding = await embedModel.embedText(query);

// console.log("Querying Pinecone...");
// const index = await initializePinecone();
// const searchResult = await index.query({
//     vector: queryEmbedding.vector,
//     topK: 3,
//     includeMetadata: true,
// });

const context = queryResponse.matches?.map((match) => match.metadata?.text).join('\n') || 'No matching context found.';

console.log('Generating response with Google AI...');
const prompt = `Use the following context to answer the question below. If the context does not contain the answer, say \"I cannot find the answer in the provided context.\"

Context:
${context}

Question:
${query}`;

const response = await gmodel.generateContent(prompt);
console.log('Response:\n', response.response.text());
