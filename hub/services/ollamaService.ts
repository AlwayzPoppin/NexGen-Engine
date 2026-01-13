/**
 * Ollama Local AI Service
 * Provides local code generation using Ollama models
 * Reads from shared context buffer for maximum efficiency
 */

interface SharedContext {
    gameConfig: any;
    chatHistory: { role: string; content: string }[];
    currentModule: string;
    assets: any[];
}

interface OllamaResponse {
    model: string;
    response: string;
    done: boolean;
}

const OLLAMA_BASE_URL = 'http://localhost:11434';


// Get current Ollama model from settings
const getSelectedModel = (): string => {
    return localStorage.getItem('nexgen_ollama_model') || 'qwen2.5-coder:7b';
};

// Check if Ollama is enabled
export const isOllamaEnabled = (): boolean => {
    return localStorage.getItem('nexgen_ollama_enabled') === 'true';
};

// Generate code using Ollama with shared context
export const generateWithOllama = async (
    task: string,
    sharedContext: SharedContext,
    modelOverride?: string
): Promise<string> => {
    if (!isOllamaEnabled()) {
        throw new Error('Ollama is not enabled. Enable it in Settings.');
    }

    const model = modelOverride || getSelectedModel();

    // Build context-aware prompt (Ollama reads shared context directly)
    const contextPrompt = buildContextPrompt(sharedContext, task);

    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                prompt: contextPrompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 2000,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}`);
        }

        const data: OllamaResponse = await response.json();
        return data.response;
    } catch (error: any) {
        console.error('Ollama generation failed:', error);
        throw new Error(`Local AI generation failed: ${error.message}`);
    }
};

const NEXSCRIPT_BIBLE = `
NEXSCRIPT (NEXGEN ENGINE SCRIPTING) SYNTAX:
- Entities: entity Name: { blocks }
- Variables: let name = value (untyped) or let name: type = value
- Signals: signal name(p1: type, p2: type)
- Functions: fn name(p1: type) -> return_type: { body }
- Async: async fn name(): { await wait(1.0) }
- Control: if/elif/else, for item in list:
- Engine: emit signal_name(args), print("msg"), schedule_task(fn_name)
- Access: obj.property or obj["key"]

ORCHESTRATION & NAVIGATION COMMANDS:
You are the primary Hub Orchestrator. Use these commands to help the user:
- __NAV__[MODULE]: Navigate to a module. Modules: ASSEMBLER, GENESIS, SYNAPSE, ECHO, NOVA, ATLAS, AIRLOCK.
- __CMD__NEW_PROJECT: Open new project wizard.
- __CMD__CLEAR_SESSION: Reset context/assets.
- __DELEGATE_TO_GEMINI__: Use ONLY for extremely complex reasoning, lore generation, or tasks beyond simple coding/navigation.
`;


// Detect if a task is conversational or code-related
const isConversationalQuery = (task: string): boolean => {
    const lowerTask = task.toLowerCase().trim();

    // Conversational patterns
    const conversationalPatterns = [
        /^(hi|hello|hey|yo|sup)/,
        /^(what|how|why|when|where|who|which)/,
        /\?$/,  // Questions
        /^(help|explain|tell me|describe|show me)/,
        /^(thanks|thank you|ok|okay|got it|cool|nice)/,
        /^(what (is|are|does|do|can|should))/,
        /(what should i|what can i|how do i)/,
        /^(analyze|check|verify|review)/,
        /(linked|working|correct|wrong|missing|need)/,
    ];

    // Code patterns - explicit code requests
    const codePatterns = [
        /(write|create|generate|build|make).*(code|script|entity|function|system)/i,
        /^(code|script|implement|program)/,
        /nexscript/i,
        /(create|write|add).*(logic|handler|signal|event)/i,
    ];

    // Check if explicitly asking for code
    for (const pattern of codePatterns) {
        if (pattern.test(lowerTask)) return false;
    }

    // Check if conversational
    for (const pattern of conversationalPatterns) {
        if (pattern.test(lowerTask)) return true;
    }

    // Default to conversational for short messages
    return lowerTask.split(' ').length < 5;
};

// Build a context-aware prompt from shared context
const buildContextPrompt = (context: SharedContext, task: string): string => {
    const isConversational = isConversationalQuery(task);

    let prompt = `You are the NexGen Engine AI Assistant - a helpful game development copilot.
    
${NEXSCRIPT_BIBLE}

MODULES & CAPABILITIES:
- ASSEMBLER: Asset pipeline - scan folders, import sprites/audio, organize resources
- SYNAPSE: AI sprite generation, animation, frame slicing, rigging  
- ECHO: AI audio generation - dialogue, SFX, music, ambient sounds
- GENESIS: Quest/narrative editor, visual logic board
- ATLAS: AI UI design - HUDs, menus, maps
- NOVA: Game engine preview, entity testing
- AIRLOCK: Build & deployment

Current View: ${context.currentModule}
Assets: ${context.assets.length} items.
`;

    // Add game info if available
    if (context.gameConfig?.game) {
        prompt += `
GAME CONTEXT:
- Title: ${context.gameConfig.game.title || 'Unknown'}
- Genre: ${context.gameConfig.game.genre || 'Unknown'}
- Perspective: ${context.gameConfig.game.perspective || '2D'}
`;
    }

    // Add character info if available
    if (context.gameConfig?.characters?.player) {
        prompt += `- Player Agent: ${context.gameConfig.characters.player.name || 'Hero'}
`;
    }

    // Add recent chat context (last 5 messages for better continuity)
    if (context.chatHistory.length > 0) {
        const recentChat = context.chatHistory.slice(-5);
        prompt += `\nCONVERSATION HISTORY:\n`;
        for (const msg of recentChat) {
            prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
        }
    }

    prompt += `
USER MESSAGE: ${task}

`;

    if (isConversational) {
        prompt += `RESPONSE MODE: CONVERSATIONAL
The user is asking a question or having a conversation. Respond naturally and helpfully.
- Answer their question directly
- Be friendly and helpful
- Suggest next steps based on their project state
- If they need to navigate somewhere, suggest __NAV__[MODULE]
- Only provide code if they specifically ask for it
- Keep responses concise but informative`;
    } else {
        prompt += `RESPONSE MODE: CODE GENERATION
The user wants code. Follow NexScript conventions precisely.
- Use 'entity', 'state', and 'signal' patterns
- Provide working NexScript code
- Include brief comments explaining the code
- Format code in a \`\`\`nexscript block`;
    }

    return prompt;
};

// Switch Ollama model
export const switchOllamaModel = (modelName: string): void => {
    localStorage.setItem('nexgen_ollama_model', modelName);
    (window as any).__NEXGEN_OLLAMA_MODEL__ = modelName;
    console.log(`Ollama model switched to: ${modelName}`);
};

// Check Ollama connection
export const checkOllamaConnection = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        return response.ok;
    } catch {
        return false;
    }
};
