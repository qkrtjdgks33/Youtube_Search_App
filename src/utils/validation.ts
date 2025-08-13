export const isValidSearchKeyword = (keyword: string): boolean => {
    return keyword.trim().length >= 2;
};

export const getThumbnailUrl = (thumbnails: {
  medium?: { url: string };
  default?: { url: string };
}): string | null => {
    return thumbnails?.medium?.url || thumbnails?.default?.url || null;
};