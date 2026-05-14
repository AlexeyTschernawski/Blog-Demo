// src/utils/stripHtml.js
export const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, ''); 
};