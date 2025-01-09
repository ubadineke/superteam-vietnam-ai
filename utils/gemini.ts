import { GoogleGenerativeAI } from '@google/generative-ai';
import { QueryResponse, RecordMetadata } from '@pinecone-database/pinecone';

const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function geminiLLM(query: string, queryResponse: QueryResponse<RecordMetadata>) {
  const gmodel = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const context =
    queryResponse.matches?.map((match) => match.metadata?.text).join('\n') || 'No matching context found.';

  console.log(context);
  console.log('Generating response with Google AI...');
  const prompt = `Use the following context to answer the question below. If the context does not contain the answer, say \"I cannot find the answer in the provided context.\"
  
  Context:
  ${context}
  
  Question:
  ${query}`;

  const response = await gmodel.generateContent(prompt);
  return response.response.text();

  console.log('Response:\n', response.response.text());
}
