import { GoogleGenerativeAI } from '@google/generative-ai';
import { QueryResponse, RecordMetadata } from '@pinecone-database/pinecone';
import { redisClient } from '../bot';

const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export interface InteractionHistory {
  role: string; // "user" or "assistant"
  content: string;
}

// export async function generateSuggestions(
//   query: string,
//   queryResponse: QueryResponse<RecordMetadata>,
//   history: InteractionHistory[]
// ) {
const gmodel = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//   // Extract context from Pinecone matches
//   const context =
//     queryResponse.matches?.map((match) => match.metadata?.text).join('\n') || 'No matching context found.';

//   // Build the prompt with history and context
//   const formattedHistory = history
//     .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
//     .join('\n');

//   const prompt = `
// You are assisting a content creator in generating and refining content ideas. Use the following history of interactions and context to provide thoughtful and relevant suggestions.

// Context:
// ${context}

// Interaction History:
// ${formattedHistory}

// Now, respond to the latest question or request:
// User: ${query}
// Assistant:
//   `;

//   // Generate response using Gemini
//   console.log('Sending prompt to Google AI...');
//   const response = await gmodel.generateContent(prompt);

//   // Add new assistant response to history
//   history.push({
//     role: 'assistant',
//     content: response.response.text(),
//   });

//   console.log('Generated response:\n', response.response.text());
//   return response.response.text();
// }

// // Define interface for interaction history
// export interface InteractionHistory {
//   role: string; // 'user' or 'assistant'
//   content: string;
// }

// Initialize Google Generative AI client
// const googleAIClient = new GoogleGenerativeAI({
//   apiKey: process.env.GEMINI_API_KEY as string, // Ensure the API key is available in the environment
// });

const TWEET_REFINEMENT_PROMPT = `
You are assisting a content creator in generating and refining content ideas, specifically tweets. Use the following history of interactions to provide thoughtful and relevant suggestions.

Interaction History:
{formattedHistory}

Now, refine the following tweet:
"{userInput}"
`;

/**
 * Function to interact with Google Generative AI (Gemini) and generate tweet suggestions.
 * @param userId The unique identifier for the user.
 * @param query The current user input (query).
 * @param messageHistory The history of messages exchanged between the user and the assistant.
 * @returns A string with the generated suggestion from the LLM.
 */
export async function generateSuggestions(
  userId: number,
  query: string,
  messageHistory: InteractionHistory[]
): Promise<string> {
  const sessionKey = `session:${userId}:history`;

  // Fetch session data (history) from Redis
  const historyJson = await redisClient.get(sessionKey);
  const history: InteractionHistory[] = historyJson ? JSON.parse(historyJson) : messageHistory;

  // Build the formatted interaction history
  const formattedHistory = history
    .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
    .join('\n');

  // Prepare the prompt for the model
  const prompt = TWEET_REFINEMENT_PROMPT.replace('{formattedHistory}', formattedHistory).replace('{userInput}', query);

  try {
    // Send the prompt to the Google Generative AI (Gemini) model
    const gmodel = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await gmodel.generateContent(prompt);
    const assistantResponse = response.response.text();

    // Update the history with the user's query and the assistant's response
    history.push({ role: 'user', content: query });
    history.push({ role: 'assistant', content: assistantResponse });

    // Persist updated history to Redis (with a 1-hour expiration)
    await redisClient.set(sessionKey, JSON.stringify(history), 'EX', 3600); // Session expires in 1 hour

    return assistantResponse;
  } catch (error) {
    console.error('Error generating suggestions from Gemini AI:', error);
    return 'Sorry, I couldn’t generate a refinement at the moment. Please try again later.';
  }
}
