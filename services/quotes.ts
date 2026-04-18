// 18/04/26: Fetch motivational quote.
export type MotivationalQuote = {
  text: string;
  author: string;
};

// 18/04/26: Load random quote API.
export async function fetchMotivationalQuote(): Promise<MotivationalQuote> {
  const response = await fetch('https://zenquotes.io/api/random');
  if (!response.ok) {
    throw new Error(`Quote API failed: ${response.status}`);
  }

  const payload = (await response.json()) as Array<{ q?: string; a?: string }>;
  const first = payload?.[0];
  const text = first?.q?.trim();
  const author = first?.a?.trim();

  if (!text) {
    throw new Error('Quote text missing');
  }

  return {
    text,
    author: author || 'Unknown',
  };
}
