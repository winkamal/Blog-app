import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateHashtags = async (content: string): Promise<string[]> => {
  if (!API_KEY) {
    return Promise.resolve(["#lifestyle", "#inspiration"]);
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following blog post content and generate 5 relevant, concise hashtags. The content is about everyday life moments. Format the output as a JSON array of strings. For example: ["#mindfulness", "#morningcoffee", "#citylife"].\n\nContent:\n${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const hashtags = JSON.parse(jsonText);
    return hashtags.map((tag: string) => tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '')}`);
  } catch (error) {
    console.error("Error generating hashtags:", error);
    // Fallback in case of API error
    return ["#error", "#generation_failed"];
  }
};

export const checkSpellingAndGrammar = async (content: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.reject(new Error("API_KEY is not set. AI features will be disabled."));
  }
  
  try {
    const prompt = `Please proofread the following text for any spelling and grammar errors. Return only the corrected text. Preserve the original line breaks and any markdown formatting. If the text is already perfect, return it unchanged.

Original Text:
---
${content}
---
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error with spellcheck:", error);
    throw new Error("Sorry, I encountered an error while checking the text.");
  }
};

export const askChatbot = async (question: string, context: string, blogTitle: string): Promise<string> => {
  if (!API_KEY) {
    return "The chatbot is currently unavailable as the API key is not configured.";
  }

  const prompt = `You are a helpful assistant for a blog named "${blogTitle}". Your task is to answer the user's question based *only* on the provided blog post content. Do not use any external knowledge. If the answer cannot be found within the provided content, you must clearly state that you don't have enough information from the blog posts to answer.

Here is the blog content:
---
${context}
---

User's Question: "${question}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error with chatbot:", error);
    return "Sorry, I encountered an error while trying to answer your question.";
  }
};