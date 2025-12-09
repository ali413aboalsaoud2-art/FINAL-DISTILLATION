import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, Message } from "../types";

// Initialize the client
// The API key is guaranteed to be available in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are DistillAI, an expert assistant for distillation device operations, maintenance, and troubleshooting.
Your target audience operates distillation equipment but requires guidance on best practices, safety, and efficiency.

STRICT GUIDELINES:
1. **Conciseness**: Be extremely concise. Avoid fluff. Get straight to the answer.
2. **Tone**: Professional and Academic, yet accessible.
3. **Complexity**: Do not exceed High School Chemistry concepts. Explain complex phenomena simply.
4. **Domain**: Focus on distillation (fractional, simple, steam, vacuum) with a specialized expertise in WATER DISTILLATION.
5. **Capabilities**:
    - Troubleshoot issues (leaks, purity problems, heating failures).
    - Analyze uploaded graphs (temperature vs time, vapor pressure curves).
    - Predict outputs based on input parameters.
    - Provide maintenance checklists.
    - Analyze raw data provided in JSON format (e.g. Temperature, Pressure, Time logs).

When the user asks about predicting outputs, ask for: Mixture Type, Initial Volume, Temperature, and Pressure if not provided.
`;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  images: string[] = [],
  mode: AppMode
): Promise<Message> => {
  try {
    const isSearchMode = mode === AppMode.SEARCH;
    
    // Model Selection based on Mode
    // Search Mode -> gemini-2.5-flash (fast, supports search tool)
    // Expert Mode -> gemini-3-pro-preview (reasoning, complex analysis)
    const modelName = isSearchMode ? "gemini-2.5-flash" : "gemini-3-pro-preview";

    const parts: any[] = [];
    
    // Add images if present
    for (const img of images) {
      // Expecting base64 string like "data:image/png;base64,..."
      // We need to strip the prefix for the API
      const base64Data = img.split(',')[1];
      const mimeType = img.split(';')[0].split(':')[1];
      
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    parts.push({ text: newMessage });

    // Prepare history
    // We map history items. If a history item has chartData, we serialize it into the text
    // so the model can "see" the data context.
    const chatHistory = history.map(h => {
      const partsArr: any[] = [];
      
      if (h.images && h.images.length > 0) {
        h.images.forEach(img => {
          partsArr.push({ 
            inlineData: { 
              mimeType: img.split(';')[0].split(':')[1], 
              data: img.split(',')[1] 
            } 
          });
        });
      }

      let textContent = h.text;
      if (h.chartData && h.chartData.length > 0) {
        // Limit data to prevent token overflow, taking first 50 rows if relevant
        // Using JSON.stringify for structured data representation
        const dataSummary = JSON.stringify(h.chartData.slice(0, 50));
        textContent += `\n[Attached Data for Analysis: ${dataSummary}...]`;
      }

      partsArr.push({ text: textContent });

      return {
        role: h.role,
        parts: partsArr
      };
    });
    
    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more academic/precise answers
        tools: isSearchMode ? [{ googleSearch: {} }] : [],
      },
      history: chatHistory
    });

    const response = await chat.sendMessage({
      message: {
        role: 'user',
        parts: parts
      }
    });

    const responseText = response.text || "I couldn't generate a text response. Please check the inputs.";
    
    // Extract grounding metadata if available (for Search Mode)
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return {
      id: crypto.randomUUID(),
      role: 'model',
      text: responseText,
      timestamp: Date.now(),
      groundingMetadata: groundingMetadata ? {
        webSearchQueries: groundingMetadata.webSearchQueries,
        groundingChunks: groundingMetadata.groundingChunks
      } : undefined
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      id: crypto.randomUUID(),
      role: 'model',
      text: "An error occurred while communicating with the distillation expert system. Please try again.",
      timestamp: Date.now()
    };
  }
};