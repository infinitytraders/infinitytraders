/**
 * Converts a standard color name to its corresponding Hex code.
 * If the input is already a Hex code (e.g. starts with '#'), it returns it directly.
 */
export function getHexFromColorName(colorName: string): string {
  if (!colorName) return '#000000';
  
  const name = colorName.trim().toLowerCase();
  
  if (name.startsWith('#')) return colorName;
  
  const colorMap: Record<string, string> = {
    white: '#ffffff',
    green: '#22c55e',
    red: '#ef4444',
    tan: '#d2b48c',
    grey: '#8b8b8b',
    gray: '#8b8b8b',
    cyan: '#06b6d4',
    orange: '#f97316',
    lavender: '#a855f7',
    black: '#000000',
    blue: '#3b82f6',
    yellow: '#eab308',
    pink: '#ec4899'
  };
  
  return colorMap[name] || name;
}
