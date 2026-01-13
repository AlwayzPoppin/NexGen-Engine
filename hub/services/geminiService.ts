
import { GoogleGenAI, Type } from "@google/genai";
import { ModelType, SpriteStyle, GridConfig } from "../../types";
import { STYLES_PROMPTS } from "../constants";

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

const getAI = async (requirePro = false) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key not found in environment.");

    if (requirePro) {
        const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio?.openSelectKey();
        }
    }
    return new GoogleGenAI({ apiKey });
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

    // Access usage metadata if available
    const usage = response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        candidatesTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0
    } : undefined;

    return { text: response.text, usage };
};

const NEXSCRIPT_BIBLE = `
NEXSCRIPT (NEXGEN ENGINE SCRIPTING) SYNTAX RULES:
- INDENTATION: Use Python-like indentation. NO curly braces { } for blocks.
- Entity Declaration: entity Name:
- State Variables: let variable_name = value (or let x: type = val)
- Signals: signal signal_name(param: type)
- Firing Signals: emit signal_name(args)
- Functions: fn name(param: type) -> return_type:
- Async Functions: async fn name():
- Hooks: on_ready(), on_update(delta), on_exit() (Use snake_case)
- Logic Commands: wait(seconds), print(msg), emit_signal(name, args)
- Core Types: int, float, bool, string, list, dict
`;

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
        projectName?: string;
    },
    history: { role: 'user' | 'model'; content: string }[] = []
) => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    // Convert ChatMessage history to Gemini contents format
    const formattedHistory = history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
    }));

    // Build deep context section if available (Increased limits)
    const deepContextSection = context.assetSummaries?.length
        ? `\n\nDEEP FILE CONTEXT (synced asset contents - Top 50):\n${context.assetSummaries.slice(0, 50).join('\n')}`
        : '';

    const gameConfigSection = context.gameConfig
        ? `\n\nGAME CONFIG FILE (The Project Bible):\n${JSON.stringify(context.gameConfig, null, 2).slice(0, 10000)}`
        : '';

    const systemPrompt = `You are the NexGen AI Assistant, integrated into the NexGen Hub game development suite.
  
${NEXSCRIPT_BIBLE}

You help users:
1. Create games (plots, quests, logic, code)
2. Author and Debug NexScript (You are a master of the NexScript language)
3. Navigate the application (Assembler, Synapse, Echo, Genesis, Atlas, Airlock, Nova)
4. Understand their project (assets, entities, logic nodes)

MODULES & CAPABILITIES:
- ASSEMBLER: Asset pipeline - scan project folders, import sprites/audio, organize resources. START HERE for new projects.
- SYNAPSE: Sprite generation & editing - AI-powered character/environment art creation, animation, frame slicing, rigging
- ECHO: Audio generation & editing - AI-powered dialogue, SFX, music, ambient sounds with voice selection and effects
- GENESIS: Quest/narrative editor, visual logic board with node connections, game flow design
- ATLAS: UI Design Lab - AI-powered HUD, menu, map generation
- NOVA: Game engine preview, entity testing, runtime simulation
- AIRLOCK: Build & deployment, platform export

CURRENT PROJECT: **${context.projectName || 'Unspecified - Ask user to open a project'}**

CURRENT PROJECT STATE:
- Active Module: ${context.activeModule}
- Assets: ${context.assets.length} items (${context.assets.filter((a: any) => a.type === 'Sprite').length} sprites, ${context.assets.filter((a: any) => a.type === 'Audio').length} audio, ${context.assets.filter((a: any) => a.type === 'Data').length} data files)
- Entities: ${context.gameState?.entities?.length || 0}
- Logic Nodes: ${context.gameState?.nodes?.length || 0}
- Quests: ${context.gameState?.quests?.length || 0}
${deepContextSection}${gameConfigSection}

WORKFLOW GUIDANCE (be proactive!):
When the user asks "what should I do next?" or similar, analyze their project state and suggest:
1. **No assets yet?** → Suggest scanning a project folder in ASSEMBLER or generating content in SYNAPSE
2. **Sprites but no audio?** → Recommend ECHO for SFX, dialogue, or music
3. **Assets but no quests?** → Suggest GENESIS to create narrative structure
4. **No UI elements?** → Recommend ATLAS for HUD/menu design
5. **Content exists?** → Suggest NOVA to test or AIRLOCK to deploy

GAP ANALYSIS:
When asked to analyze the project, identify what's missing for a complete game:
- Characters (player, NPCs, enemies)
- Environments (backgrounds, tilesets)
- Audio (SFX, music, dialogue)
- UI (HUD, menus, icons)
- Logic (quests, dialogue trees, game mechanics)

Be a helpful game dev copilot! Proactively suggest the next logical step based on what exists.

When responding:
- Be concise and helpful.
- HALLUCINATION GUARD: You only have access to the modules listed below. **DO NOT invent modules like 'QUINTUS'.**
- If you have deep context, use it to give specific answers about file contents.
- If the user needs a specific module, include a navigation suggestion.
- For game content requests, provide structured data (JSON for quests, NexScript for logic).
- Format code blocks with proper markdown and language identifier 'nexscript'.
- DEBUGGING: If the user has errors, check for Python-like indentation and snake_case hook names.

FILE EDITING:
When the user asks you to edit a file (like game_context.json or any project file), suggest changes using this exact format:
<FILE_EDIT path="filename.json">
{complete new file content here}
</FILE_EDIT>

The user will see a diff preview and can choose to download or apply your changes. Always include the complete updated file content, not just the changes.

AI COMMANDS:
You can trigger special actions by including these command markers in your response:
- __CMD_NEW_PROJECT__ - Opens the new project wizard modal
- __CMD_CLEAR_SESSION__ - Clears the current session (assets, context, game state)
- __CMD_SCAFFOLD__ - Scaffolds basics
  - __CMD_SCAFFOLD_STEALTH__ - Scaffolds the "Guard's Dilemma" stealth template
- __CMD_NAVIGATE_[MODULE]__ - Navigate to a specific module (e.g., __CMD_NAVIGATE_GENESIS__)
- __CMD_AUTO_FORGE__[name] - Initiates the FULL autonomous pipeline (Generate -> Entity -> Logic)
- __CMD_FILL_GAPS__ - Triggers a proactive gap analysis of the project

AUTONOMOUS CAPABILITIES:
You are now an ACTIVE PILOT. You should proactively notice missing elements and offer to fix them.
- If the user has a "Player" sprite but no "Jump" sound, ask: "I see a Player sprite but no jump SFX. Shall I auto-forge one?"
- If the user has no Main Quest, ask: "No Main Quest detected. Shall I scaffold the 'Hero's Journey'?"
- Use __CMD_AUTO_FORGE__ when the user gives you 'carte blanche' to build something.

GAME FILE CREATION (Auto-Build):
When you generate NexScript code or game files, you can CREATE THEM DIRECTLY in the user's project folder:
- __CMD_CREATE_FILE__[path/to/file.nx] - Creates a file with the code that follows

Example:
__CMD_CREATE_FILE__[scripts/entities/player.nx]
\`\`\`nexscript
entity Player: {
    state health = 100
    // ... code
}
\`\`\`

The file will be created at the specified path relative to the project root. Use this after generating any NexScript code!

ASSET GENERATION (phased approval):
When the user wants to generate assets, use these commands with optimized prompts based on game context:
- __CMD_GEN_SPRITE__[name]:[optimized prompt] - Generates a sprite in Synapse
- __CMD_GEN_AUDIO__[name]:[category]:[optimized prompt] - Generates audio in Echo

Example for a dark fantasy game:
- __CMD_GEN_SPRITE__[Hero]:[pixel art warrior character, dark armor, gothic fantasy style, idle pose, transparent background]
- __CMD_GEN_AUDIO__[sword_slash]:[SFX]:[metallic sword slash, dark reverb, fantasy combat]

PHASED GENERATION WORKFLOW (Strict 6-Phase Pipeline):
1.  **SPRITE GEN**: Generate sprite sheet/asset. **STOP & WAIT for approval.**
2.  **ANIMATION**: Ask user for animation type (Idle, Walk, Attack) or slicing config. **STOP & WAIT.**
3.  **AUDIO**: Generate SFX/Dialogue provided it aligns with the sprite. **STOP & WAIT.**
4.  **LOGIC/CODE**: Generate NexScript behavior, Data files, or stats. **STOP & WAIT.**
5.  **FORGE (LINK)**: Bundle assets into an Entity and link logic. Link audio to sprite states.
6.  **TEST**: Offer to launch NOVA for testing.

RULES:
- Do NOT jump ahead.
- Do NOT generate everything in one go.
- Ask for confirmation at each step.
- Use __CMD_GEN_SPRITE__, __CMD_GEN_AUDIO__, __CMD_CREATE_FILE__ as appropriate for the phase.
- Use __CMD_AUTO_FORGE__ only if the user explicitly authorizes a "Carte Blanche" full run, otherwise stick to the phases.

LOCAL AI (OLLAMA) - EXPERT CODE DELEGATION:
When the user asks for complex system-wide code or heavy logic, you can delegate to the local Ollama model (optimized with Qwen2.5-Coder).
Use these commands:

- __OLLAMA_CODE__[task description] - Signal Ollama to generate code
  Example: __OLLAMA_CODE__[Create player physics controller in NexScript]
  
- __OLLAMA_MODEL__[model name] - Switch Ollama model before task

IMPORTANT: You can write NexScript YOURSELF for quick snippets or logic helpers. Only delegate complex/heavy tasks to Ollama.
When the user asks to:
- "Create a new project" → include __CMD_NEW_PROJECT__
- "Generate [asset name]" → use __CMD_GEN_SPRITE__ or __CMD_GEN_AUDIO__
- "Write a script/logic for [X]" → write NexScript AND use __CMD_CREATE_FILE__ to save it to the project`;


    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [...formattedHistory, { role: 'user', parts: [{ text: message }] }],
        config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
        },
    });

    const usage = response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        candidatesTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0
    } : undefined;

    return { text: response.text, usage };
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

export const generatePoseVariation = async (
    frameUri: string,
    style: SpriteStyle,
    prompt: string,
    model: ModelType = 'gemini-2.5-flash-image'
): Promise<string> => {
    const ai = await getAI(model === 'gemini-3-pro-image-preview');
    const [header, data] = frameUri.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    const stylePrompt = STYLES_PROMPTS[style] || style;

    const finalPrompt = `ACT AS A CHARACTER DESIGNER.
TASK: Take the provided character sprite and generate a NEW alternative pose.
CHARACTER: ${prompt}.
STYLE: ${stylePrompt}.
RULES:
1. Match character details perfectly.
2. The pose must be a logical animation frame for this character.
3. Background: Solid PURE WHITE (#FFFFFF) only.
4. Output: Return ONLY the single isolated sprite.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data, mimeType } },
                { text: finalPrompt }
            ],
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Variation failed.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
};

export const interpolateFrames = async (
    frameA: string,
    frameB: string,
    style: SpriteStyle,
    prompt: string,
    model: ModelType = 'gemini-2.5-flash-image'
): Promise<string> => {
    const ai = await getAI(model === 'gemini-3-pro-image-preview');

    const [headerA, dataA] = frameA.split(',');
    const mimeTypeA = headerA.split(':')[1].split(';')[0];

    const [headerB, dataB] = frameB.split(',');
    const mimeTypeB = headerB.split(':')[1].split(';')[0];

    const stylePrompt = STYLES_PROMPTS[style] || style;

    const finalPrompt = `ACT AS A LEAD 2D ANIMATOR.
TASK: Generate ONE single intermediate animation frame (a "tween") that perfectly transitions from Frame A to Frame B.
CONTEXT: This is for a character described as: ${prompt}.
STYLE: ${stylePrompt}.
TECHNICAL RULES:
1. Consistency: The character's anatomy, color, and clothing must match exactly.
2. Pose: The movement must be the logical mathematical middle point between the two provided frames.
3. Background: Solid PURE WHITE (#FFFFFF) only.
4. Output: Return only the single isolated sprite.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data: dataA, mimeType: mimeTypeA } },
                { text: "This is Frame A (Start)" },
                { inlineData: { data: dataB, mimeType: mimeTypeB } },
                { text: "This is Frame B (End)" },
                { text: finalPrompt }
            ],
        },
        config: {
            imageConfig: { aspectRatio: "1:1" }
        }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Interpolation failed.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
};

export const normalizeSpriteSheet = async (
    imageUri: string,
    grid: GridConfig,
    model: ModelType = 'gemini-2.5-flash-image'
): Promise<string> => {
    const ai = await getAI(model === 'gemini-3-pro-image-preview');
    const [header, data] = imageUri.split(',');
    const mimeType = header.split(':')[1].split(';')[0];

    const finalPrompt = `The provided image contains character sprites or items that are irregularly spaced or misaligned.
Task: Act as a Sprite Layout Engineer. Extract every individual element and RE-LAYOUT them into a mathematically perfect ${grid.cols}x${grid.rows} grid.
Rules:
1. Identical Pixels: DO NOT change colors, shapes, or artistic details.
2. Centering: Each sprite MUST be perfectly centered within its grid cell.
3. Normalization: Compensate for any slight rotations or inconsistent spacing in the source.
4. Background: Solid PURE WHITE (#FFFFFF) only.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data, mimeType } },
                { text: finalPrompt }
            ],
        },
        config: {
            imageConfig: {
                aspectRatio: "1:1",
                imageSize: model === 'gemini-3-pro-image-preview' ? "1K" : undefined
            }
        }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Normalization failed.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
};

export const detectIndividualSprites = async (imageUri: string): Promise<{ x: number, y: number, w: number, h: number }[]> => {
    const ai = await getAI();
    const [header, data] = imageUri.split(',');
    const mimeType = header.split(':')[1].split(';')[0];

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { data, mimeType } },
                { text: "Identify every distinct isolated part, item, or sprite. Return a JSON array of bounding boxes {x, y, w, h} (0-1000 range)." }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        w: { type: Type.NUMBER },
                        h: { type: Type.NUMBER }
                    },
                    required: ["x", "y", "w", "h"]
                }
            }
        }
    });

    try { return JSON.parse(response.text || "[]"); } catch (e) { return []; }
};

export const generateSpriteSheet = async (
    prompt: string,
    style: SpriteStyle,
    grid: GridConfig,
    model: ModelType = 'gemini-2.5-flash-image',
    referenceImages: string[] = []
): Promise<string> => {
    const ai = await getAI(model === 'gemini-3-pro-image-preview');
    const stylePrompt = STYLES_PROMPTS[style] || style;

    const finalPrompt = `ACT AS A LEAD GAME ANIMATOR. Generate a ${grid.cols}x${grid.rows} grid sprite sheet.
CHARACTER: ${prompt}
STYLE: ${stylePrompt}
LAYOUT: Sequential frames of a fluid animation showing the character ${prompt}.
RULES: Perfectly aligned grid, consistent character details across all frames, solid pure white background (#FFFFFF) only. No overlapping sprites. Ensure character scale is consistent.`;

    const parts: any[] = referenceImages.map(imgUri => {
        const [header, data] = imgUri.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        return { inlineData: { data, mimeType } };
    });

    parts.push({ text: finalPrompt });

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                    imageSize: model === 'gemini-3-pro-image-preview' ? "1K" : undefined
                }
            },
        });

        const candidate = response.candidates?.[0];
        if (!candidate) throw new Error("No response from AI.");

        for (const part of candidate.content.parts) {
            if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        throw new Error("No image data found.");
    } catch (error: any) {
        if (error.message?.includes("Requested entity was not found") || error.message?.includes("404")) {
            // Fallback to 2.0-flash-exp if 2.5/3.0 is not available
            if (model !== 'gemini-2.0-flash-exp') {
                console.warn(`Model ${model} failed, falling back to gemini-2.0-flash-exp`);
                return generateSpriteSheet(prompt, style, grid, 'gemini-2.0-flash-exp', referenceImages);
            }
        }
        throw error;
    }
};

export const refineSpriteSheet = async (
    currentImageUri: string,
    correctionPrompt: string,
    model: ModelType = 'gemini-2.5-flash-image'
): Promise<string> => {
    const ai = await getAI(model === 'gemini-3-pro-image-preview');
    const [header, data] = currentImageUri.split(',');
    const mimeType = header.split(':')[1].split(';')[0];

    const finalPrompt = `Refine this asset: ${correctionPrompt}. Maintain style and character consistency. Pure white background.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { data, mimeType } },
                { text: finalPrompt }
            ],
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Refinement failed.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
};

export const detectGridLayout = async (imageUri: string): Promise<GridConfig> => {
    const ai = await getAI();
    const [header, data] = imageUri.split(',');
    const mimeType = header.split(':')[1].split(';')[0];

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { data, mimeType } },
                {
                    text: `Act as a Computer Vision Expert for Game Assets. 
Analyze this sprite sheet carefully. The sprites might be slightly misaligned, have variable whitespace, or have inconsistent margins. 
Task: Determine the underlying LOGICAL grid structure (count the number of distinct poses horizontally and vertically). 
Ignore the exact pixel distances and instead focus on the intentional sequence of character frames.
Return a JSON object with 'rows' and 'cols'. Default to {rows: 1, cols: 1} if the layout is too chaotic to determine a grid.` }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    rows: { type: Type.INTEGER, description: "Number of logical rows of animation frames." },
                    cols: { type: Type.INTEGER, description: "Number of logical columns of animation frames." }
                },
                required: ["rows", "cols"]
            }
        }
    });

    try {
        const result = JSON.parse(response.text || '{"rows":1, "cols":1}');
        return {
            rows: Math.max(1, result.rows || 1),
            cols: Math.max(1, result.cols || 1)
        };
    } catch (e) {
        return { rows: 1, cols: 1 };
    }
};

export const generateMotionVideo = async (
    prompt: string,
    imageUri: string,
    onStatus: (status: string) => void
): Promise<string> => {
    const ai = await getAI(true);
    const [header, data] = imageUri.split(',');
    const mimeType = header.split(':')[1].split(';')[0];

    onStatus("Initializing motion engine...");
    // Fix: Veo models require 16:9 or 9:16 aspect ratio. Changed '1:1' to '16:9'.
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Dynamic animation of this character ${prompt}.`,
        image: { imageBytes: data, mimeType: mimeType },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });

    while (!operation.done) {
        onStatus("Rendering motion...");
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const videoResponse = await fetch(`${downloadLink}&key=${getApiKey()}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

// Legacy support
export const generateSprite = async (prompt: string, style: string, referenceImage?: string): Promise<string | null> => {
    try {
        return await generateSpriteSheet(prompt, style as SpriteStyle, { rows: 1, cols: 1 }, 'gemini-2.5-flash-image', referenceImage ? [referenceImage] : []);
    } catch (e) {
        console.error("Legacy generateSprite failed:", e);
        return null;
    }
};

export const analyzeSpriteSheet = async (imageUrl: string): Promise<{ cols: number, rows: number }> => {
    return await detectGridLayout(imageUrl);
};

export const correctSpriteSheet = async (imageUrl: string, styleHint: string): Promise<string | null> => {
    try {
        return await refineSpriteSheet(imageUrl, `Fix inconsistent spacing and crowding. Maintain style: ${styleHint}`);
    } catch (e) {
        console.error("Refinement failed:", e);
        return null;
    }
};
