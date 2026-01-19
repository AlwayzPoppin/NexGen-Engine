
/**
 * Shared image processing utilities for canvas-based operations.
 */

export const processTransparency = async (imgUrl: string, tolerance: number = 15): Promise<string> => {
  const img = new Image();
  img.src = imgUrl;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imgUrl;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate Euclidean distance from pure white (255, 255, 255)
    const dist = Math.sqrt(Math.pow(255 - r, 2) + Math.pow(255 - g, 2) + Math.pow(255 - b, 2));
    
    if (dist < tolerance) {
      data[i + 3] = 0; // Transparent
    } else if (dist < tolerance * 2) {
      // Soft edge transition for semi-white pixels
      const alpha = (dist - tolerance) / tolerance;
      data[i + 3] = Math.round(alpha * 255);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};

/**
 * Detects the bounding box of non-transparent content in a data URL image.
 */
export const getContentBounds = async (dataUrl: string): Promise<{x: number, y: number, w: number, h: number} | null> => {
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 5) { // Small threshold to ignore artifacts
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1) return null; // No content found
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
};

/**
 * Crops a data URL image to the specified bounds.
 */
export const cropImage = async (dataUrl: string, bounds: {x: number, y: number, w: number, h: number}): Promise<string> => {
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = bounds.w;
  canvas.height = bounds.h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  ctx.drawImage(img, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, bounds.w, bounds.h);
  return canvas.toDataURL('image/png');
};

/**
 * Extracts unique colors from an image.
 */
export const extractPalette = async (dataUrl: string, maxColors: number = 32): Promise<string[]> => {
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = 64; // downsample for performance
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, 64, 64);
  const { data } = ctx.getImageData(0, 0, 64, 64);
  
  const colors = new Set<string>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // ignore transparent
    const hex = '#' + [data[i], data[i+1], data[i+2]].map(x => x.toString(16).padStart(2, '0')).join('');
    colors.add(hex.toUpperCase());
    if (colors.size >= maxColors) break;
  }
  return Array.from(colors);
};

/**
 * Replaces all instances of a color in an image.
 */
export const remapColor = async (dataUrl: string, fromHex: string, toHex: string): Promise<string> => {
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const from = {
    r: parseInt(fromHex.slice(1, 3), 16),
    g: parseInt(fromHex.slice(3, 5), 16),
    b: parseInt(fromHex.slice(5, 7), 16)
  };
  const to = {
    r: parseInt(toHex.slice(1, 3), 16),
    g: parseInt(toHex.slice(3, 5), 16),
    b: parseInt(toHex.slice(5, 7), 16)
  };

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === from.r && data[i+1] === from.g && data[i+2] === from.b) {
      data[i] = to.r;
      data[i+1] = to.g;
      data[i+2] = to.b;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};
