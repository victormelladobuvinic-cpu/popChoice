import { openai, supabase } from './config.js';
import { CharacterTextSplitter } from "@langchain/textsplitters";
import fs from 'fs';

async function splitDocument(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const splitter = new CharacterTextSplitter({
    separator: "\n\n", 
    chunkSize: 700,
    chunkOverlap: 0,
  });
  const output = await splitter.createDocuments([text]);
  return output.map(chunk => chunk.pageContent);
}

async function createAndStoreEmbeddings() {
  try {
    const chunkData = await splitDocument("movies.txt");
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunkData,
    });
    const pairedData = chunkData.map((text, index) => ({
      content: text,
      embedding: response.data[index].embedding
    }));
    await supabase.from("popChoiceData").insert(pairedData);
    console.log("¡Éxito! Base de datos cargada.");
  } catch (err) {
    console.error("Error:", err);
  }
}

createAndStoreEmbeddings();