 import { openai, supabase } from './config.js'; 

const promptResponse = document.querySelector("form");

promptResponse.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(promptResponse);
    const data = 
    ` favorite movie an why: ${formData.get("question1")},
     mood${formData.get("question2")}, 
     genre: ${formData.get("question3")}  ` 
        
    

    
    
    main(data);

    
});


// Bring all function calls together
async function main(input) {
  const embedding = await createEmbedding(input);
  const match = await findNearestMatch(embedding);
  await getChatCompletion(match, input);
}

// Create an embedding vector representing the input text
async function createEmbedding(input) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: input
  });
  return embeddingResponse.data[0].embedding;
}

// Query Supabase and return a semantically matching text chunk
async function findNearestMatch(embedding) {
  const { data } = await supabase.rpc('match_popchoice_data', {
    query_embedding: embedding,
    match_threshold: 0.50,
    match_count: 1
  });
  return data[0].content;
}

// Use OpenAI to make the response conversational
const chatMessages = [{
    role: 'system',
    content: `You are an movie expert who loves recommending movies to people.
     You will be given two pieces of information - some context about a movie and a topics to choose a movie.
      in 150 words or less, your main job is to formulate a short answer to the question "What movie should I see today?".
       If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer."
        Please do not make up the answer.` 
}];

async function getChatCompletion(text, query) {
  chatMessages.push({
    role: 'user',
    content: `Context: ${text} Question: ${query}`
  });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: chatMessages,
    temperature: 0.5,
    frequency_penalty: 0.5
  });

  console.log(response.choices[0].message.content);
}

