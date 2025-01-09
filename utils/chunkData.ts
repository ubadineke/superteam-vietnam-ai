import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export async function chunkData(data: string) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 0,
  });
  const texts = await textSplitter.splitText(data);
  return texts;
}
