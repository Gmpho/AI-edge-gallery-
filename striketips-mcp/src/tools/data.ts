import { z } from 'zod';
import { calculateProbabilityEdge } from './probability';

export const verifyRaceExistsSchema = {
  track: z.string().min(1),
  race_number: z.number().min(1),
};

export async function verifyRaceExists(
  env: Env,
  track: string,
  race_number: number,
) {
  try {
    const resp = await fetch(`https://api.racingapi.com/v1/race/${track}/${race_number}`, {
      headers: env.RACING_API_KEY
        ? { 'X-API-Key': env.RACING_API_KEY }
        : undefined,
    });
    if (resp.ok) {
      return { track, race_number, exists: true };
    }
    return { track, race_number, exists: false };
  } catch {
    return { track, race_number, exists: false, error: 'Failed to check race' };
  }
}

export const evaluateRaceSchema = {
  track: z.string().min(1),
  race_number: z.number().min(1),
  horses: z
    .array(
      z.object({
        name: z.string(),
        odds: z.number().optional(),
        estimated_probability: z.number().optional(),
      }),
    )
    .optional(),
};

export async function evaluateRace(
  env: Env,
  track: string,
  race_number: number,
  horses?: { name: string; odds?: number; estimated_probability?: number }[],
) {
  const results: any[] = [];

  if (horses) {
    for (const horse of horses) {
      if (horse.odds && horse.estimated_probability) {
        const edge = calculateProbabilityEdge(horse.odds, horse.estimated_probability);
        results.push({
          horse: horse.name,
          odds: horse.odds,
          ...edge,
        });
      } else {
        results.push({
          horse: horse.name,
          odds: horse.odds || null,
          note: 'Insufficient data for edge calculation',
        });
      }
    }
  }

  return {
    track,
    race_number,
    analyzed: results.length,
    selections: results.filter((r) => r.has_value),
    all_runners: results,
  };
}

export const getOddsSnapshotSchema = {
  track: z.string().optional(),
};

export async function getOddsSnapshot(env: Env, track?: string) {
  try {
    const url = track
      ? `https://api.racingapi.com/v1/odds/${track}`
      : 'https://api.racingapi.com/v1/odds';
    const resp = await fetch(url, {
      headers: env.RACING_API_KEY
        ? { 'X-API-Key': env.RACING_API_KEY }
        : undefined,
    });
    if (resp.ok) {
      const data = await resp.json();
      return { status: 'success', data, track: track || 'all' };
    }
    return { status: 'error', error: 'Failed to fetch odds', track: track || 'all' };
  } catch (e) {
    return { status: 'error', error: String(e), track: track || 'all' };
  }
}
