import { z } from 'zod';

const RACING_SYSTEM_PROMPT = `You are a horse racing intelligence assistant. Answer questions about past races, horses, jockeys, trainers, and racing statistics based on your training data. Be specific with dates, names, and numbers when possible. If you don't know something, say so clearly.`;

export const searchPastRacesSchema = {
  query: z.string().min(1),
  n_results: z.number().optional().default(5),
};

export async function searchPastRaces(
  env: Env,
  query: string,
  n_results: number = 5,
) {
  if (env.AI) {
    try {
      const response = await env.AI.run('@cf/qwen/qwen3-30b-a3b-fp8', {
        messages: [
          { role: 'system', content: RACING_SYSTEM_PROMPT },
          { role: 'user', content: `Search for information about: ${query}\n\nProvide up to ${n_results} key facts or findings in a structured format.` },
        ],
        max_tokens: 1024,
      });
      const text = typeof response === 'object' && response !== null
        ? (response as Record<string, unknown>)?.response ?? JSON.stringify(response)
        : String(response ?? '');
      return {
        query,
        results: [{ text }],
        count: 1,
        source: 'workers_ai',
      };
    } catch (e) {
      return { query, results: [], count: 0, source: 'workers_ai', error: String(e) };
    }
  }

  return { query, results: [], count: 0, source: 'none',
    error: 'AI binding not configured. Add \"ai\": { \"binding\": \"AI\" } to wrangler.jsonc' };
}

export const searchRacingKeywordsSchema = {
  query: z.string().min(1),
  n: z.number().optional().default(10),
};

export async function searchRacingKeywords(
  env: Env,
  query: string,
  n: number = 10,
) {
  if (!env.AI) {
    return { query, results: [], count: 0,
      error: 'AI binding not configured. Add \"ai\": { \"binding\": \"AI\" } to wrangler.jsonc' };
  }

  try {
    const response = await env.AI.run('@cf/qwen/qwen3-30b-a3b-fp8', {
      messages: [
        { role: 'system', content: RACING_SYSTEM_PROMPT },
        { role: 'user', content: `Find racing information about: ${query}\n\nProvide up to ${n} relevant facts or entries in a structured list format.` },
      ],
      max_tokens: 1024,
    });
    const text = typeof response === 'object' && response !== null
      ? (response as Record<string, unknown>)?.response ?? JSON.stringify(response)
      : String(response ?? '');
    return {
      query,
      results: [{ text }],
      count: 1,
    };
  } catch (e) {
    return { query, results: [], count: 0, error: String(e) };
  }
}
