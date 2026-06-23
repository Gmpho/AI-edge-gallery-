/*
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function calculateFormRating(input) {
  let score = 50;
  const reasons = [];

  // Recent form (positions)
  const positions = input['recent_positions'];
  if (positions && positions.length > 0) {
    const avgPos = positions.reduce((a, b) => a + b, 0) / positions.length;
    if (avgPos <= 2) { score += 20; reasons.push('Consistent top-2 form'); }
    else if (avgPos <= 4) { score += 10; reasons.push('Consistent top-4 form'); }
    else if (avgPos <= 6) { score += 5; reasons.push('Mid-field form'); }
    else { score -= 10; reasons.push('Poor recent form'); }

    // Trend: improving?
    if (positions.length >= 3) {
      const firstHalf = positions.slice(0, Math.floor(positions.length / 2));
      const secondHalf = positions.slice(Math.floor(positions.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      if (secondAvg < firstAvg) { score += 5; reasons.push('Improving form trend'); }
    }
  }

  // Distance specialist
  const distances = input['recent_distances'];
  const todayDist = input['distance'];
  if (distances && distances.length > 0 && todayDist) {
    const dists = distances.map(d => Math.abs(d - todayDist));
    const avgDistDiff = dists.reduce((a, b) => a + b, 0) / dists.length;
    if (avgDistDiff <= 100) { score += 10; reasons.push('Proven at this distance'); }
    else if (avgDistDiff <= 400) { score += 5; reasons.push('Close to preferred distance'); }
    else { score -= 5; reasons.push('Untested at this distance'); }
  }

  // Win rate this season
  const starts = input['starts_this_season'];
  const wins = input['wins_this_season'];
  if (starts && wins && starts > 0) {
    const winRate = wins / starts;
    if (winRate >= 0.3) { score += 15; reasons.push('Strong win rate this season'); }
    else if (winRate >= 0.15) { score += 8; reasons.push('Decent win rate'); }
    if (winRate === 0 && starts >= 3) { score -= 5; reasons.push('Winless this season'); }
  }

  // Days since last run
  const daysOff = input['days_since_last_run'];
  if (daysOff !== undefined) {
    if (daysOff >= 7 && daysOff <= 30) { score += 5; reasons.push('Ideal freshening period'); }
    else if (daysOff > 90) { score -= 5; reasons.push('Long layoff'); }
    else if (daysOff < 3) { score -= 3; reasons.push('Quick backup'); }
  }

  // Best time
  if (input['best_time']) {
    // Higher is better in this simplified model
    score += 3;
    reasons.push('Has recorded a competitive time');
  }

  score = Math.max(0, Math.min(100, score));

  let grade = 'D';
  if (score >= 85) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';

  return {
    horse: input['horse'] || 'Unknown',
    rating: score,
    grade: grade,
    factors: reasons,
    confidence: reasons.length >= 3 ? 'HIGH' : reasons.length >= 1 ? 'MEDIUM' : 'LOW',
  };
}

window['ai_edge_gallery_get_result'] = async (data) => {
  try {
    const input = JSON.parse(data);

    // If race_data URL is provided, fetch and analyze
    if (input['race_data_url']) {
      try {
        const resp = await fetch(input['race_data_url']);
        if (resp.ok) {
          const raceData = await resp.json();
          if (Array.isArray(raceData)) {
            const ratings = raceData.map(h => calculateFormRating({...input, ...h}));
            return JSON.stringify({ results: ratings, count: ratings.length, source: 'api' });
          }
        }
      } catch (e) {
        // API unavailable, use input data
      }
    }

    const result = calculateFormRating(input);
    return JSON.stringify(result);
  } catch (e) {
    console.error(e);
    return JSON.stringify({ error: `Form analysis error: ${e.message}` });
  }
};
