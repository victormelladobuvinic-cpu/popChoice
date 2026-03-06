import { openai, supabase } from './config.js';
import { CharacterTextSplitter} from "@langchain/textsplitters"

import fs from 'fs'; 





/* ---------------------------chunk and embedding pairing--------------------------------- */


/* 1. Función para dividir el documento */
async function splitDocument(filePath) {
  // Leemos el archivo del disco
  const text = fs.readFileSync(filePath, 'utf8');

  const splitter = new CharacterTextSplitter({
    separator: "\n\n", 
    chunkSize: 700,
    chunkOverlap: 0,
  });

  const output = await splitter.createDocuments([text]);
  const moviesArray = output.map(chunk => chunk.pageContent);
  
  return moviesArray;
}

/* 2. Crear embeddings y guardar */
async function createAndStoreEmbeddings() {
  try {
    const chunkData = await splitDocument("movies.txt");
    console.log(`Cargando ${chunkData.length} películas...`);

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunkData,
      encoding_format: "float",
    });

    const pairedData = chunkData.map((text, index) => ({
      content: text,
      embedding: response.data[index].embedding
    }));

    const { data, error } = await supabase
      .from("popChoiceData") // Asegúrate de que coincida con tu tabla SQL
      .insert(pairedData);

    if (error) {
      console.error("Error en Supabase:", error);
    } else {
      console.log("¡Éxito! Datos insertados en Supabase.");
    }
  } catch (err) {
    console.error("Error general:", err);
  }
}

createAndStoreEmbeddings();

/* ---------------------------array for prompt--------------------------------- */



/* ---------------------------similarity search--------------------------------- */