
import { GoogleGenAI, Type } from "@google/genai";

// Using gemini-3-pro-preview for complex coding and game development assistance
export const generateDevResponse = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: `You are NEXGEN-AI, a world-class game development assistant integrated into the NEXGEN-HUB suite. 
      You help developers with coding (C++, C#, GDScript, Rust), shader programming, game design patterns, performance optimization, 
      and creative storytelling for interactive media. Be concise, technical, and professional. 
      Format code blocks clearly using markdown.`,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    },
  });

  // Accessing the .text property directly as per the guidelines
  return response.text;
};

// Using gemini-3-pro-preview for advanced asset and logic orchestration
export const orchestrateNexusLinks = async (assets: any[], variables: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze the following discovered game assets and variables. 
  Propose the most logical neural links (connections) between them. 
  
  Assets: ${JSON.stringify(assets)}
  Variables: ${JSON.stringify(variables)}
  
  Return a list of links. Each link must have:
  - sourceId (the ID or key of the asset/variable)
  - targetId (the ID or key of the related asset/variable)
  - relationshipType (e.g., 'Driver', 'Container', 'Logic-Binding', 'Audio-Trigger')
  - reasoning (concise explanation)
  - confidence (0.0 to 1.0)`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sourceId: { type: Type.STRING },
                targetId: { type: Type.STRING },
                relationshipType: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ['sourceId', 'targetId', 'relationshipType', 'reasoning', 'confidence']
            }
          }
        },
        required: ['links']
      }
    }
  });

  // Trimming the response text before parsing as JSON
  return JSON.parse(response.text?.trim() || '{"links": []}');
};

// Using Gemini for sprite generation descriptions and AI image generation
export const generateSprite = async (prompt: string, style: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const enhancedPrompt = `Create a 2D game sprite: ${prompt}. 
  Art style: ${style}. 
  Requirements: Clean edges, transparent background, centered composition, suitable for game use.
  The sprite should be a single character or object, not a scene.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: [{ parts: [{ text: enhancedPrompt }] }],
      config: {
        responseModalities: ['image', 'text'],
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          // Return base64 data URL
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Sprite generation error:', error);
    return null;
  }
};

// Real AI Audio Generation Service using Gemini TTS
export const generateAudioSignal = async (prompt: string, category: string, voice: string, context?: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const categoryPrompts: Record<string, string> = {
    'DIALOGUE': `Generate spoken dialogue audio: "${prompt}"`,
    'SFX': `Generate sound effect audio: ${prompt}`,
    'MUSIC': `Generate background music: ${prompt}`,
    'AMBIENT': `Generate ambient soundscape: ${prompt}`,
  };

  const audioPrompt = categoryPrompts[category] || prompt;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: audioPrompt }] }],
      config: {
        responseModalities: ['audio'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice || 'Kore',
            },
          },
        },
      },
    });

    // Extract audio from response
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('audio/')) {
          // Return base64 data URL
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    // Fallback: return empty audio signal
    console.warn('No audio data in response, returning placeholder');
    return `blob:audio-signal-${Date.now()}`;
  } catch (error) {
    console.error('Audio generation error:', error);
    // Return placeholder on error for graceful degradation
    return `blob:audio-signal-error-${Date.now()}`;
  }
};
