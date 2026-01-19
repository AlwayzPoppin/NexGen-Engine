/**
 * Sample Bank Service - Neural Core Audio Sample Management
 * Loads, caches, and provides access to audio samples for the synth engine.
 */

export interface SampleEntry {
    id: string;
    name: string;
    category: 'weapons' | 'impacts' | 'explosions' | 'zombies' | 'footsteps' | 'ambience' | 'synths' | 'drums' | 'pads' | 'misc';
    path: string;
    duration?: number;
    loaded?: boolean;
}

export interface LoadedSample {
    entry: SampleEntry;
    buffer: AudioBuffer;
}

// Sample Bank Registry - Maps sample IDs to their metadata
// This is a curated subset of the most useful samples for quick access
export const SAMPLE_REGISTRY: SampleEntry[] = [
    // === WEAPONS - PISTOLS ===
    { id: 'pistol_beretta', name: 'Beretta M9', category: 'weapons', path: 'AI SAMPLE LIBRARY/151065__vabadus__beretta-m9-shot.wav' },
    { id: 'pistol_deagle', name: 'Desert Eagle', category: 'weapons', path: 'AI SAMPLE LIBRARY/151069__vabadus__desert-eagle.wav' },
    { id: 'pistol_silenced', name: 'Silenced Shot', category: 'weapons', path: 'AI SAMPLE LIBRARY/100465__hoot_avi__silenced-shot.wav' },
    { id: 'pistol_9mm_rapid', name: '9mm Rapid Fire', category: 'weapons', path: 'AI SAMPLE LIBRARY/647594__oneshotofficial__9mm-pistol-rapid-fire-10-shots.wav' },
    { id: 'pistol_magnum', name: '.22 Magnum', category: 'weapons', path: 'AI SAMPLE LIBRARY/427594__michorvath__22-magnum-pistol-shot.wav' },

    // === WEAPONS - RIFLES ===
    { id: 'rifle_m16', name: 'M16 Single', category: 'weapons', path: 'AI SAMPLE LIBRARY/162403__qubodup__m16-single-shot-5.flac' },
    { id: 'rifle_ak47', name: 'AK-47', category: 'weapons', path: 'AI SAMPLE LIBRARY/514894__dwightsabeast__ak-47-steel-case-3.wav' },
    { id: 'rifle_ar15', name: 'AR-15', category: 'weapons', path: 'AI SAMPLE LIBRARY/432366__superphat__ar15-real-recording.wav' },
    { id: 'rifle_auto', name: 'Assault Rifle Auto', category: 'weapons', path: 'AI SAMPLE LIBRARY/416417__superphat__automatic-assault-rifle.wav' },

    // === WEAPONS - SHOTGUNS ===
    { id: 'shotgun_blast', name: 'Shotgun Blast', category: 'weapons', path: 'AI SAMPLE LIBRARY/416280__evanboyerman__shotgun-shotblast-outdoorsclose.wav' },
    { id: 'shotgun_epic', name: 'Epic Shotgun Reverb', category: 'weapons', path: 'AI SAMPLE LIBRARY/732127__noahbangs__epic-shotgun-blast-reverb-80s-style.wav' },

    // === WEAPONS - SMG/MG ===
    { id: 'smg_burst', name: 'SMG Burst', category: 'weapons', path: 'AI SAMPLE LIBRARY/769634__saangosu__smg-burst-fire.wav' },
    { id: 'mg_heavy', name: 'Heavy Machine Gun', category: 'weapons', path: 'AI SAMPLE LIBRARY/396324__superphat__heavymachinegun.wav' },

    // === WEAPONS - SNIPER ===
    { id: 'sniper_shot', name: 'Sniper Shot', category: 'weapons', path: 'AI SAMPLE LIBRARY/108852__emsiarma__snipershot.wav' },
    { id: 'sniper_silenced', name: 'Silenced Sniper', category: 'weapons', path: 'AI SAMPLE LIBRARY/182815__qubodup__silenced-sniper-rifle.flac' },

    // === WEAPONS - SCI-FI ===
    { id: 'laser_pistol', name: 'Plasma Laser Pistol', category: 'weapons', path: 'AI SAMPLE LIBRARY/plasma-lazer-pistol-gun-shot-1.wav' },
    { id: 'blaster', name: 'Blaster Shot', category: 'weapons', path: 'AI SAMPLE LIBRARY/514048__newlocknew__blaster-shot-11_3sytrusrsmpl2lrsmultiprcsngsingle.wav' },

    // === WEAPONS - MECHANICAL ===
    { id: 'gun_cock', name: 'Gun Cock', category: 'weapons', path: 'AI SAMPLE LIBRARY/179011__smartwentcody__gun-cock.wav' },
    { id: 'mag_reload', name: 'Magazine Reload', category: 'weapons', path: 'AI SAMPLE LIBRARY/363167__samsterbirdies__mag-reload.wav' },
    { id: 'shell_casing', name: 'Shell Casings', category: 'weapons', path: 'AI SAMPLE LIBRARY/210102__grayjoy__brass-bullet-shell-casing-drop-onto-concrete-multiple-takes.mp3' },

    // === IMPACTS ===
    { id: 'bullet_ricochet', name: 'Bullet Ricochet', category: 'impacts', path: 'AI SAMPLE LIBRARY/74394__benboncan__ricochet-2.wav' },
    { id: 'bullet_whiz', name: 'Bullet Whiz', category: 'impacts', path: 'AI SAMPLE LIBRARY/123222__cgeffex__bullet_whiz.wav' },
    { id: 'bullet_metal', name: 'Bullet Hit Metal', category: 'impacts', path: 'AI SAMPLE LIBRARY/182240__martian__foley-bullet-hit-metal.wav' },
    { id: 'bullet_body', name: 'Bullet Hit Body', category: 'impacts', path: 'AI SAMPLE LIBRARY/719198__poundsounduk__sfx_impact_bullet_hit_body_1.wav' },
    { id: 'bullet_trash', name: 'Bullet Hit Trash', category: 'impacts', path: 'AI SAMPLE LIBRARY/BULLET HIT TRASH CAN.wav' },

    // === EXPLOSIONS ===
    { id: 'explosion_close', name: 'Close Explosion', category: 'explosions', path: 'AI SAMPLE LIBRARY/108641__juskiddink__nearby-explosion-with-debris.wav' },
    { id: 'explosion_massive', name: 'Massive Blast', category: 'explosions', path: 'AI SAMPLE LIBRARY/58507__daveincamas__massiveblast.wav' },
    { id: 'explosion_distant', name: 'Distant Explosion', category: 'explosions', path: 'AI SAMPLE LIBRARY/DISTANT EXPLOSION.wav' },
    { id: 'explosion_scifi', name: 'Sci-Fi Explosion', category: 'explosions', path: 'AI SAMPLE LIBRARY/393374__evanboyerman__big-sci-fi-explosionbomb-close-mixed.wav' },
    { id: 'grenade', name: 'Grenade', category: 'explosions', path: 'AI SAMPLE LIBRARY/609587__unfa__grenade-explosion-sfx-medium-sized-meaty-realistic.flac' },
    { id: 'missile', name: 'Missile Blast', category: 'explosions', path: 'AI SAMPLE LIBRARY/528258__magnuswaker__missile-blast-1.wav' },

    // === ZOMBIES ===
    { id: 'zombie_roar', name: 'Zombie Roar', category: 'zombies', path: 'AI SAMPLE LIBRARY/315846__gneube__zombie-roar.wav' },
    { id: 'zombie_growl', name: 'Zombie Growl', category: 'zombies', path: 'AI SAMPLE LIBRARY/555415__tonsil5__zombie-growl-2.wav' },
    { id: 'zombie_attack', name: 'Zombie Attack', category: 'zombies', path: 'AI SAMPLE LIBRARY/213509__soykevin__zombie-attack.wav' },
    { id: 'zombie_horde', name: 'Zombie Horde', category: 'zombies', path: 'AI SAMPLE LIBRARY/111044__garyq__zombie-group-2-small.wav' },
    { id: 'zombie_hit', name: 'Zombie Hit', category: 'zombies', path: 'AI SAMPLE LIBRARY/555420__tonsil5__zombie-hit-1.wav' },

    // === FOOTSTEPS ===
    { id: 'footstep_concrete', name: 'Concrete Footstep', category: 'footsteps', path: 'AI SAMPLE LIBRARY/166508__yoyodaman234__concrete-footstep-2.wav' },
    { id: 'footstep_grass', name: 'Grass Footsteps', category: 'footsteps', path: 'AI SAMPLE LIBRARY/464609__d001447733__grass_footsteps.wav' },
    { id: 'footstep_wood', name: 'Wood Footsteps', category: 'footsteps', path: 'AI SAMPLE LIBRARY/543685__nox_sound__footsteps_wood_walk_mono.wav' },
    { id: 'footstep_metal', name: 'Metal Running', category: 'footsteps', path: 'AI SAMPLE LIBRARY/583714__dexd73__running-on-metal-loop.wav' },
    { id: 'cloth_rustle', name: 'Cloth Rustle', category: 'footsteps', path: 'AI SAMPLE LIBRARY/334219__wasabiwielder__clothes-rustling-1.wav' },

    // === AMBIENCE ===
    { id: 'wind_howl', name: 'Howling Wind', category: 'ambience', path: 'AI SAMPLE LIBRARY/109371__dobroide__20101121windhowlfurious01.wav' },
    { id: 'wind_spooky', name: 'Spooky Wind', category: 'ambience', path: 'AI SAMPLE LIBRARY/177936__nhaudio__spooky-wind-5.wav' },
    { id: 'rain_indoor', name: 'Rain Indoors', category: 'ambience', path: 'AI SAMPLE LIBRARY/242889__samesamesame__rain-from-indoors-perfect-loop.wav' },
    { id: 'thunder_close', name: 'Close Thunder', category: 'ambience', path: 'AI SAMPLE LIBRARY/76342__robinhood76__01139-thunder-big-very-close-36.wav' },
    { id: 'fire_crackle', name: 'Fire Crackle', category: 'ambience', path: 'AI SAMPLE LIBRARY/620324__marb7e__campfire-crackling-loop.wav' },
    { id: 'electric_hum', name: 'Electric Hum', category: 'ambience', path: 'AI SAMPLE LIBRARY/162146__beerbelly38__electricity_generator_loop.wav' },
    { id: 'powerline_hum', name: 'Powerline Hum', category: 'ambience', path: 'AI SAMPLE LIBRARY/835088__subsystemv__powerline-humming-loop.wav' },

    // === DESTRUCTION ===
    { id: 'glass_shatter', name: 'Glass Shatter', category: 'misc', path: 'AI SAMPLE LIBRARY/221528__unfa__glass-break.flac' },
    { id: 'debris_fall', name: 'Debris Fall', category: 'misc', path: 'AI SAMPLE LIBRARY/550342__nox_sound__foley_stones_falls_debris_stereo_dr05.wav' },
    { id: 'rubble', name: 'Rubble Settling', category: 'misc', path: 'AI SAMPLE LIBRARY/RUBBLE SETTLING.wav' },

    // === MUSIC PRODUCTION - CYBERPUNK ===
    { id: 'synth_acid', name: 'Acid Synth', category: 'synths', path: 'AI SAMPLE PACKS/Cyberpunk/Cyberpunk_Mini_Noiiz/100_ D_AcidKindaSynth_849.wav' },
    { id: 'bass_evil', name: 'Evil Bass', category: 'synths', path: 'AI SAMPLE PACKS/Cyberpunk/Cyberpunk_Mini_Noiiz/100_D_EvilBass_01_849.wav' },
    { id: 'bass_wobble', name: 'Wobble Bass', category: 'synths', path: 'AI SAMPLE PACKS/Cyberpunk/Cyberpunk_Mini_Noiiz/100_F#_WobbleArpBass_03_849.wav' },
    { id: 'drums_cyberpunk', name: 'Cyberpunk Drums', category: 'drums', path: 'AI SAMPLE PACKS/Cyberpunk/Cyberpunk_Mini_Noiiz/100_CyberpunkDrums_01_849.wav' },
    { id: 'kick_punchy', name: 'Punchy Kick', category: 'drums', path: 'AI SAMPLE PACKS/Cyberpunk/Cyberpunk_Mini_Noiiz/PunchierKick_849.wav' },
    { id: 'snare_smack', name: 'Smack Snare', category: 'drums', path: 'AI SAMPLE PACKS/Cyberpunk/Cyberpunk_Mini_Noiiz/SmackSnare_849.wav' },

    // === MUSIC PRODUCTION - PADS ===
    { id: 'pad_drone', name: 'Eternal Drone', category: 'pads', path: 'AI SAMPLE PACKS/HiddenLands/HiddenLands_Mini_Noiiz/70_B_EternalReverseDrone_851.wav' },
    { id: 'pad_ghost', name: 'Ghost Pad', category: 'pads', path: 'AI SAMPLE PACKS/HiddenLands/HiddenLands_Mini_Noiiz/Gm_GhostPadDrone_851.wav' },
    { id: 'pad_shine', name: 'Shine Pad', category: 'pads', path: 'AI SAMPLE PACKS/HiddenLands/HiddenLands_Mini_Noiiz/80_Eb_ShinePad_851.wav' },
    { id: 'pad_acoustic', name: 'Acoustic Pad', category: 'pads', path: 'AI SAMPLE PACKS/HiddenLands/HiddenLands_Mini_Noiiz/G_AcousticPad_851.wav' },
    { id: 'pad_textured', name: 'Textured Pad', category: 'pads', path: 'AI SAMPLE PACKS/HybridTextures/HybridTextures_Mini_SP/150_F_TexturedPad_718.wav' },
];

// Sample cache - stores loaded AudioBuffers
const sampleCache = new Map<string, AudioBuffer>();

// Base path for samples (relative to project)
const SAMPLE_BASE_PATH = '/agent_driver/';

/**
 * Load a sample from the registry by ID
 */
export async function loadSample(sampleId: string, audioContext: AudioContext): Promise<AudioBuffer | null> {
    // Check cache first
    if (sampleCache.has(sampleId)) {
        return sampleCache.get(sampleId)!;
    }

    const entry = SAMPLE_REGISTRY.find(s => s.id === sampleId);
    if (!entry) {
        console.warn(`Sample not found: ${sampleId}`);
        return null;
    }

    try {
        const response = await fetch(SAMPLE_BASE_PATH + entry.path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Cache the loaded buffer
        sampleCache.set(sampleId, audioBuffer);
        return audioBuffer;
    } catch (error) {
        console.error(`Failed to load sample ${sampleId}:`, error);
        return null;
    }
}

/**
 * Preload multiple samples
 */
export async function preloadSamples(sampleIds: string[], audioContext: AudioContext): Promise<void> {
    await Promise.all(sampleIds.map(id => loadSample(id, audioContext)));
}

/**
 * Get list of available samples by category
 */
export function getSamplesByCategory(category: SampleEntry['category']): SampleEntry[] {
    return SAMPLE_REGISTRY.filter(s => s.category === category);
}

/**
 * Get all available sample IDs for AI prompt
 */
export function getSampleIdsForPrompt(): string {
    const categories = [...new Set(SAMPLE_REGISTRY.map(s => s.category))];
    return categories.map(cat => {
        const samples = getSamplesByCategory(cat);
        return `${cat}: ${samples.map(s => s.id).join(', ')}`;
    }).join('\n');
}

/**
 * Play a sample directly
 */
export function playSample(
    sampleId: string,
    audioContext: AudioContext,
    startTime: number = 0,
    options: { gain?: number; playbackRate?: number } = {}
): AudioBufferSourceNode | null {
    const buffer = sampleCache.get(sampleId);
    if (!buffer) {
        console.warn(`Sample not loaded: ${sampleId}`);
        return null;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = options.playbackRate || 1;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = options.gain || 1;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(audioContext.currentTime + startTime);
    return source;
}

/**
 * Clear the sample cache
 */
export function clearSampleCache(): void {
    sampleCache.clear();
}
