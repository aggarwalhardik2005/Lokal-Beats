// Decode HTML entities in strings
export const decodeHTMLEntities = (text: string | undefined | null): string => {
  if (!text) return '';
  
  const entities: { [key: string]: string } = {
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&#039;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };

  return text.replace(/&[^;]+;/g, (entity) => entities[entity] || entity);
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatTime = (millis: number): string => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};