# NexGen Workspace Architecture

> **For Audit Tools**: This document defines the purpose of each directory and component. Use this as the source of truth for understanding the workspace structure.

---

## 🏗️ Workspace Structure

```
NexGen Engine/
├── NexGen-Hub/           # PRIMARY: The main IDE/Editor application (React + Vite)
├── NexGen-Engine/        # LOW-LEVEL: NexScript DSL compiler and runtime tools (Rust)
├── NexGen-Framework/     # SHARED: Reusable Rust libraries for game logic
├── Sanctuarys End Game/  # SAMPLE PROJECT: Demo game built with NexGen
└── workspaces/           # USER PROJECTS: Project storage directory
```

---

## 📦 Component Definitions

### NexGen-Hub (Primary Application)
**Type**: React + TypeScript + Vite SPA  
**Purpose**: AI-powered game development IDE with visual editors  
**Port**: `localhost:3001`

| Plugin | Location | Purpose |
|--------|----------|---------|
| **ASSEMBLER** | `components/NexusPlugin.tsx` | Asset management and project file browser |
| **GENESIS** | `components/NexusPlugin.tsx` | Visual logic node editor for game behaviors |
| **SYNAPSE** | `components/synapse/` | AI sprite generation and animation tools |
| **CONDUCTOR** | `components/conductor/` | Audio/voice synthesis and performance toolkit |
| **ATLAS** | `components/AtlasUI.tsx` | HUD/UI design and world map editor |
| **NOVA/ENGINE** | `components/NexGenEngine.tsx` | Game runtime preview and simulation |
| **AIRLOCK** | `components/Airlock.tsx` | Build pipeline and deployment tools |

---

### NexGen-Engine (NOT a duplicate of Hub)
**Type**: Rust project with TypeScript tooling  
**Purpose**: Low-level scripting engine and DSL compiler  

| Component | Purpose |
|-----------|---------|
| **NexScript** | Python-like scripting language for game logic |
| `nexscript/` | Rust compiler/interpreter for NexScript DSL |
| `nexscript-vscode/` | VS Code extension for NexScript syntax highlighting |
| `hub/` | Legacy: TypeScript definitions (deprecated, do not use) |

> ⚠️ **IMPORTANT**: `NexGen-Engine` is NOT a copy of `NexGen-Hub`. They serve different purposes:
> - **Hub** = The IDE interface (React app)
> - **Engine** = The scripting runtime (Rust compiler)

---

### NexScript DSL
**Type**: Domain-Specific Language  
**File Extension**: `.nx`  
**Purpose**: Simplified Python-like syntax for game scripting

```nexscript
entity Player:
    let health: int = 100
    let speed: float = 5.0

    on_ready():
        print("Player spawned!")

    on_update(delta):
        if input.is_pressed("move_right"):
            self.x += speed * delta
```

---

## 🔌 Plugin Architecture

### Module Loading (NexusPlugin.tsx)
The main plugin container manages these modules:

| Module ID | Component | Description |
|-----------|-----------|-------------|
| `ASSEMBLER` | Inline | Project file management |
| `GENESIS` | Inline | Node-based logic editor |
| `SYNAPSE` | External | `synapse/` folder - Sprite AI |
| `CONDUCTOR` | External | `conductor/` folder - Audio AI |
| `ATLAS` | External | `AtlasUI.tsx` - UI/Map design |
| `NOVA` | External | `NexGenEngine.tsx` - Runtime |
| `AIRLOCK` | External | `Airlock.tsx` - Build tools |
| `EDITOR` | External | `NexScriptEditor.tsx` - Code editing |

---

## 🗂️ Services Layer

| Service | File | Purpose |
|---------|------|---------|
| Gemini AI | `services/geminiService.ts` | Google Gemini API integration |
| Ollama | `services/ollamaService.ts` | Local LLM integration |
| Synth Engine | `services/synthEngine.ts` | Audio synthesis |
| Sample Bank | `services/sampleBank.ts` | Audio sample management |

---

## ⚠️ Cleanup Notes for Audit

**Safe to Delete (after verification)**:
- `NexGen-Hub-BROKEN/` - Corrupted backup from recovery
- `NexGen-Hub-New/` - Temporary clone used for restoration
- `hub/` in `NexGen-Engine/` - Legacy, replaced by proper Hub

**Do NOT Delete**:
- `NexGen-Hub/` - Main application
- `NexGen-Engine/nexscript/` - Active DSL compiler
- `workspaces/` - User project data
