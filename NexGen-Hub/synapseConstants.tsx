import { SpriteStyle } from "./types";
import React from 'react';

export const STYLES_PROMPTS: Record<SpriteStyle, string> = {
  'Pixel Art': 'Classic retro 8-bit/16-bit pixel art, limited color palette, clean dithering',
  'HD Pixel': 'High-definition pixel art, modern shading, detailed textures, crisp edges',
  'Gritty HD Pixel': 'Dark, atmospheric pixel art, high contrast, cyberpunk/noir aesthetic, gritty textures',
  'Vector': 'Clean vector art, bold shapes, professional illustration',
  'Vector Flat': 'Clean vector art, flat colors, no gradients, bold outlines, modern UI style',
  'Hand Drawn': 'Sketchy, pencil or ink style, organic lines, textured look, visible strokes',
  'Flat Design': 'Minimalist flat design, solid colors, geometric shapes',
  'Cel-shaded': 'Cel-shaded, comic book style, thick outlines',
  'Retro 8-bit': '8-bit retro gaming style, high contrast, chunky pixels',
  'Anime/Manga': 'Japanese animation style, cel-shaded, expressive features, dynamic shading',
  'Low Poly 3D': 'Retro PlayStation 1 era 3D style, jagged edges, low resolution textures, blocky',
  'Cyberpunk/Neon': 'Futuristic, neon glowing accents, dark backgrounds, tech-heavy details',
  'Isometric': 'Isometric projection, 3D-like depth, clean geometric lines, strategy game style',
  'Watercolor': 'Soft watercolor painting style, bleeding colors, paper texture, artistic',
  'Oil Painting': 'Thick brush strokes, rich colors, canvas texture, classical art style',
  'Retro 16-bit': 'SNES/Genesis era pixel art, vibrant colors, clear outlines',
  'Blueprint/Schematic': 'Technical drawing style, blue/white lines, grid background, engineering look',
  'Claymation': 'Stop-motion clay style, plasticine texture, soft lighting, tactile feel',
  'Voxel': '3D cubic voxel art, MagicaVoxel style, blocky, clean lighting',
  'Noir/Black & White': 'High contrast black and white, dramatic lighting, film noir atmosphere'
};

export const Icons = {
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /> <path d="M19 17v4" /><path d="M3 5h4" /> <path d="M17 19h4" /></svg >
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> <polyline points="7 10 12 15 17 10" /> <line x1="12" x2="12" y1="15" y2="3" /> </svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /> <path d="M3 3v5h5" /> <path d="M12 7v5l4 2" /> </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M12.22 2h-.44a2 2 0 0 0-2 2l-.2.1a2 2 0 0 1-2.81 0l-.12-.1a2 2 0 0 0-2.81 0l-.31.31a2 2 0 0 0 0 2.81l.1.12a2 2 0 0 1 0 2.81l-.1.2a2 2 0 0 0-2.01 2.01v.44a2 2 0 0 0 2.01 2.01l.2.1a2 2 0 0 1 0 2.81l-.1.12a2 2 0 0 0 0 2.81l.31.31a2 2 0 0 0 2.81 0l.12-.1a2 2 0 0 1 2.81 0l.2.1a2 2 0 0 0 2.01 2.01h.44a2 2 0 0 0 2.01-2.01l.1-.2a2 2 0 0 1 2.81 0l.12.1a2 2 0 0 0 2.81 0l.31-.31a2 2 0 0 0 0-2.81l-.1-.12a2 2 0 0 1 0-2.81l.1-.2a2 2 0 0 0-2.01-2.01v-.44a2 2 0 0 0-2.01-2.01l-.2-.1a2 2 0 0 1 0-2.81l.1-.12a2 2 0 0 0 0-2.81l-.31-.31a2 2 0 0 0-2.81 0l-.12.1a2 2 0 0 1-2.81 0l-.2-.1a2 2 0 0 0-2.01-2.01z" /> <circle cx="12" cy="12" r="3" /> </svg>
  ),
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <polygon points="5 3 19 12 5 21 5 3" /> </svg>
  ),
  Pause: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <rect x="6" y="4" width="4" height="16" /> <rect x="14" y="4" width="4" height="16" /> </svg>
  ),
  Grid: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <rect width="18" height="18" x="3" y="3" rx="2" /> <line x1="3" x2="21" y1="9" y2="9" /> <line x1="3" x2="21" y1="15" y2="15" /> <line x1="9" x2="9" y1="3" y2="21" /> <line x1="15" x2="15" y1="3" y2="21" /> </svg>
  ),
  Studio: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /> <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /> <path d="M7 21h10" /> <path d="M12 3v18" /> <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /> </svg>
  ),
  Scissors: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <circle cx="6" cy="6" r="3" /> <circle cx="6" cy="18" r="3" /> <line x1="20" x2="8.12" y1="4" y2="15.88" /> <line x1="14.47" x2="20" y1="14.48" y2="20" /> <line x1="8.12" x2="12" y1="8.12" y2="12" /> </svg>
  ),
  Scan: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M3 7V5a2 2 0 0 1 2-2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M21 17v2a2 2 0 0 1-2 2h-2" /> <path d="M7 21H5a2 2 0 0 1-2-2v-2" /> <line x1="7" x2="17" y1="12" y2="12" /> </svg>
  ),
  Video: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" /> <rect x="2" y="6" width="14" height="12" rx="2" /> </svg>
  ),
  Magic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /> <path d="M9 18h6" /> <path d="M10 22h4" /> </svg>
  ),
  Image: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /> <circle cx="9" cy="9" r="2" /> <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /> </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M18 6 6 18" /> <path d="m6 6 12 12" /> </svg>
  ),
  Folder: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /> </svg>
  ),
  Maximize: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="m15 3 6 6" /> <path d="M9 21 3 15" /> <path d="M21 3v6h-6" /> <path d="M3 21v-6h6" /> <path d="m21 3-7.5 7.5" /> <path d="M3 21l7.5-7.5" /> </svg>
  ),
  Minimize: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="m8 3 4 4" /> <path d="m12 21-4-4" /> <path d="M3 8h5V3" /> <path d="M21 16h-5v5" /> <path d="m3 8 9 9" /> <path d="m21 16-9-9" /> </svg>
  )
};
