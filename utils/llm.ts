import { Ollama } from 'ollama';
import { QueryResponse, RecordMetadata } from '@pinecone-database/pinecone';

const ollama = new Ollama();

export async function llmKnowledgePortal(query: string, queryResponse: QueryResponse) {
  const context =
    queryResponse.matches?.map((match) => match.metadata?.text).join('\n') || 'No matching context found.';

  console.log('Generating response with Ollama...');
  const prompt = `Use the following context to answer the question below. If the context does not contain the answer, say \"I cannot find the answer in the provided context.\"
  
  Context:
  ${context}
  
  Question:
  ${query}`;

  let output = '';
  const response = await ollama.generate({
    model: 'llama3.2',
    prompt,
    stream: true,
  });

  for await (const part of response) {
    // process.stdout.write(part.response);
    output += part.response;
  }
  return output;
}

export async function llmMemberFinder(query: string, queryResponse: QueryResponse<RecordMetadata>): Promise<string> {
  const context =
    queryResponse.matches?.map((match) => match.metadata?.text).join('\n') || 'No matching context found.';

  console.log('Contextt', context);

  // prompt
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

  let output = '';
  const response = await ollama.generate({
    model: 'llama3.2',
    prompt,
    stream: true,
  });

  for await (const part of response) {
    // process.stdout.write(part.response);
    output += part.response;
  }
  return output;
}

export interface TweetContext {
  recentTweets: string[];
  followedAccounts: { name: string; handle: string }[];
  trendingTopics: string[];
}

export async function llmGenerateTweetSuggestions(context: TweetContext, draft?: string): Promise<string> {
  // const gmodel = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are assisting Superteam Vietnam in managing their Twitter account. Your tasks include:

1. Proposing three engaging and relevant tweets based on the provided context.
2. Refining any given draft tweet for improved engagement and correctness.
3. Correcting any misspelled Twitter handles using the list of followed accounts.

Context:
- Recent Tweets:
${context.recentTweets.join('\n')}

- Followed Accounts:
${context.followedAccounts.map((acc) => `${acc.name} (@${acc.handle})`).join('\n')}

- Trending Topics:
${context.trendingTopics.join(', ')}

${draft ? `- Draft to Refine: "${draft}"` : ''}

Your goal:
Write 3 engaging tweets aligned with Superteam Vietnam's style and trending topics. Ensure all handles are accurate, and provide a refined version of the draft (if given). The tweets should not be lengthy, preferably short and precise. Everything replied should not exceed 4000 characters.
`;

  let output = '';
  const response = await ollama.generate({
    model: 'llama3.2',
    prompt,
    stream: true,
  });

  for await (const part of response) {
    // process.stdout.write(part.response);
    output += part.response;
  }
  return output;
}
