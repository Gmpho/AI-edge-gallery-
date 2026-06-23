import { z } from 'zod';

export const calculateProbabilityEdgeSchema = {
  odds_decimal: z.number().min(1.01, 'Odds must be >= 1.01'),
  estimated_probability: z.number().min(0.001).max(0.999, 'Probability must be between 0 and 1'),
};

export function calculateProbabilityEdge(
  odds_decimal: number,
  estimated_probability: number,
) {
  const impliedProb = 1.0 / odds_decimal;
  const edgePercent = (estimated_probability - impliedProb) * 100.0;

  let confidence = 'NO_VALUE';
  if (edgePercent >= 15) confidence = 'STRONG_VALUE';
  else if (edgePercent >= 8) confidence = 'VALUE';
  else if (edgePercent >= 5) confidence = 'MARGINAL';

  return {
    implied_probability: parseFloat(impliedProb.toFixed(4)),
    estimated_probability,
    edge_percent: parseFloat(edgePercent.toFixed(2)),
    has_value: edgePercent >= 5.0,
    confidence,
  };
}

export const calculateMaxPositionSchema = {
  edge_percent: z.number().min(0, 'Edge must be >= 0'),
  bankroll: z.number().positive('Bankroll must be > 0'),
};

export function calculateMaxPosition(edge_percent: number, bankroll: number) {
  const halfKellyStake = bankroll * (edge_percent / 100.0) * 0.5;
  const maxStake = Math.min(halfKellyStake, bankroll * 0.05);

  return {
    half_kelly_stake: parseFloat(maxStake.toFixed(2)),
    max_stake_capped: parseFloat(maxStake.toFixed(2)),
    current_bankroll: bankroll,
    edge_percent,
    percent_of_bankroll: parseFloat(((maxStake / bankroll) * 100).toFixed(2)),
    kelly_fraction: 0.5,
  };
}
