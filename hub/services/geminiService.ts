
import { GoogleGenAI, Type } from "@google/genai";

// Helper to get API key from localStorage or environment
const getApiKey = (): string => {
  // Check for runtime-set key first (from settings panel)
  if (typeof window !== 'undefined' && (window as any).__NEXGEN_API_KEY__) {
    return (window as any).__NEXGEN_API_KEY__;
  }
  // Check localStorage
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem('nexgen_api_key');
    if (storedKey) return storedKey;
  }
  // Fall back to environment variable
  return process.env.API_KEY || '';
};

// Using gemini-3-pro-preview for complex coding and game development assistance
export const generateDevResponse = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
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

// NexGen Hub AI Assistant - Context-aware game development helper with navigation
export const generateAssistantResponse = async (
  message: string,
  context: {
    assets: any[];
    gameState: any;
    activeModule: string;
    projectVariables: any[];
    gameConfig?: any;
    assetSummaries?: string[];
  }
) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  // Build deep context section if available
  const deepContextSection = context.assetSummaries?.length
    ? `\n\nDEEP FILE CONTEXT (synced asset contents):\n${context.assetSummaries.slice(0, 10).join('\n')}`
    : '';

  const gameConfigSection = context.gameConfig
    ? `\n\nGAME CONFIG FILE:\n${JSON.stringify(context.gameConfig, null, 2).slice(0, 1000)}`
    : '';

  const systemPrompt = `You are the NexGen AI Assistant, integrated into the NexGen Hub game development suite.
  
You help users:
1. Create games (plots, quests, logic, code)
2. Navigate the application (Assembler, Synapse, Echo, Genesis, Atlas, Airlock, Nova)
3. Understand their project (assets, entities, logic nodes)

MODULES:
- ASSEMBLER: Asset pipeline, import sprites/audio, organize resources
- SYNAPSE: Sprite editor, animation, rigging
- ECHO: Audio generation, editing, effects
- GENESIS: Quest editor, logic board, game flow
- ATLAS: UI builder
- NOVA: Game engine, preview, testing
- AIRLOCK: Deployment

Current user context:
- Active Module: ${context.activeModule}
- Assets: ${context.assets.length} items (${context.assets.filter((a: any) => a.type === 'Sprite').length} sprites, ${context.assets.filter((a: any) => a.type === 'Audio').length} audio)
- Entities: ${context.gameState?.entities?.length || 0}
- Logic Nodes: ${context.gameState?.nodes?.length || 0}
- Quests: ${context.gameState?.quests?.length || 0}
${deepContextSection}${gameConfigSection}

When responding:
- Be concise and helpful
- If you have deep context, use it to give specific answers about file contents
- If the user needs a specific module, include a navigation suggestion
- For game content requests, provide structured data (JSON for quests, pseudocode for logic)
- Format code blocks with proper markdown

FILE EDITING:
When the user asks you to edit a file (like game_context.json or any project file), suggest changes using this exact format:
<FILE_EDIT path="filename.json">
{complete new file content here}
</FILE_EDIT>

The user will see a diff preview and can choose to download or apply your changes. Always include the complete updated file content, not just the changes.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    },
  });

  return response.text;
};

// Using gemini-3-pro-preview for advanced asset and logic orchestration
export const orchestrateNexusLinks = async (assets: any[], variables: any[]) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

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
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

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

// Gemini Live API Stub for real-time character performance
export const generateLivePerformance = async (persona: string, prompt: string, context?: any) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  // Implementation for Gemini Live 3 Flash with BidiContent
  console.log(`ECHO_LIVE: Orchestrating performance for ${persona}...`);

  // For now returning a placeholder that will be caught by the UI
  return `blob:live-session-${Date.now()}`;
};

// Lyria 2 API Stub for adaptive music generation
export const generateAtmosphericTrack = async (prompt: string, params: { bpm: number, density: number, brightness: number }) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  console.log(`LYRIA_OST: Forging track with BPM:${params.bpm} DENSITY:${params.density}...`);

  // Mocking the Lyria 2 response
  return `blob:lyria-ost-${Date.now()}`;
};
