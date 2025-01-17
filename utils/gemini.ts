import { GoogleGenerativeAI } from '@google/generative-ai';
import { QueryResponse, RecordMetadata } from '@pinecone-database/pinecone';

const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function geminiKnowledgePortal(query: string, queryResponse: QueryResponse<RecordMetadata>) {
  const gmodel = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const context =
    queryResponse.matches?.map((match) => match.metadata?.text).join('\n') || 'No matching context found.';

  console.log('COntexxxttt', context);
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

export async function geminiMemberFinder(query: string, queryResponse: QueryResponse<RecordMetadata>): Promise<string> {
  // Initialize the Gemini model
  const gmodel = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  console.log(queryResponse.matches);
  // Extract relevant context from Pinecone matches
  const context =
    queryResponse.matches?.map((match) => match.metadata?.text).join('\n') || 'No matching context found.';
  // const context =
  //   queryResponse.matches
  //     ?.map((match) => match.metadata?.description) // Trim whitespace
  //     .filter((description) => description) // Remove undefined or empty descriptions
  //     .join('\n') || 'No matching context found.';
  console.log('Contextt', context);
  // Construct the prompt
  const prompt = `
You are an intelligent assistant helping a community find the most relevant members from a database. The database contains profiles of Superteam members, including their expertise, interests, and projects. Use the following context data to suggest the best matches for the user's request. If the context does not provide a relevant match, respond with "NO".

Context:
${context}

Task:
1. Analyze the context to identify members who best match the user's query.
2. Explain why each member is a good fit.
3. If no relevant match is found, reply with "NO".

User Query:
${query}

Your response should clearly identify the relevant members, explaining why they match the user's requirements. Use concise and clear language.
`;

  // Generate response using Gemini LLM
  console.log('Generating response with Google AI...');
  const response = await gmodel.generateContent(prompt);

  const assistantResponse = response.response.text();
  console.log('Response:\n', assistantResponse);

  return assistantResponse;
}

export interface TweetContext {
  recentTweets: string[];
  followedAccounts: { name: string; handle: string }[];
  trendingTopics: string[];
}

export async function geminiGenerateTweetSuggestions(context: TweetContext, draft?: string): Promise<string> {
  const gmodel = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are assisting Superteam Vietnam with managing their Twitter account. Based on the provided context, propose engaging tweets or refine a draft tweet, also correct misspelt handles, using the list of followed accounts given.

Context:
Recent Tweets:
${context.recentTweets.join('\n')}

Followed Accounts:
${context.followedAccounts.map((acc) => `${acc.name} (@${acc.handle})`).join('\n')}

Trending Topics:
${context.trendingTopics.join(', ')}

${draft ? `Draft: ${draft}` : ''}

Now provide 3 engaging tweet suggestions:
`;

  const response = await gmodel.generateContent(prompt);
  return response.response.text();
}
