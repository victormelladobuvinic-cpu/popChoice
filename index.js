import { openai, supabase } from './config.js';


/* ---------------------------array for prompt--------------------------------- */



/* ---------------------------chunk and embedding pairing--------------------------------- */
import { CharacterTextSplitter} from "@langchain/textsplitters"


/* Split movies.txt into text chunks.
Return LangChain's "output" – the array of Document objects. */
async function splitDocument(document) {
const response = await fetch(document);
  const text = await response.text();

  const splitter = new CharacterTextSplitter({
    separator: "\n\n ",
    chunkSize: 600,
    chunkOverlap:0 ,
  });
  const output = await splitter.createDocuments([text]);
  const moviesArray = output.map( chunk => chunk.pageContent)
  
  return moviesArray;
};
splitDocument('movies.txt')

/* Create an embedding from each text chunk.
Store all embeddings and corresponding text in Supabase. */
async function createAndStoreEmbeddings() {
  
  const chunkData = await splitDocument("movies.txt");
  
  const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: chunkData,
  encoding_format: "float",
});

const pairedData = chunkData.map((text, index) => {
  return {
    content: text,
    embedding: embedding.data[index].embedding
  }
  
  
   });
  console.log(pairedData)
  const {data, error} =  await supabase.from("popChoiceData").insert(pairedData);
  console.log("DATA:", data);
  console.log("ERROR:", error);
}



createAndStoreEmbeddings() 




/* ---------------------------similarity search--------------------------------- */