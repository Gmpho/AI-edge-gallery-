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

window['ai_edge_gallery_get_result'] = async (data) => {
  try {
    const input = JSON.parse(data);
    const odds = parseFloat(input['odds_decimal']);
    const estimatedProb = parseFloat(input['estimated_probability']);

    if (odds < 1.01 || estimatedProb <= 0 || estimatedProb >= 1) {
      return JSON.stringify({error: 'Invalid input. Odds must be >= 1.01, probability between 0 and 1.'});
    }

    const impliedProb = 1.0 / odds;
    const edgePercent = (estimatedProb - impliedProb) * 100.0;

    let confidence = 'NO_VALUE';
    if (edgePercent >= 15) confidence = 'STRONG_VALUE';
    else if (edgePercent >= 8) confidence = 'VALUE';
    else if (edgePercent >= 5) confidence = 'MARGINAL';

    return JSON.stringify({
      implied_probability: parseFloat(impliedProb.toFixed(4)),
      estimated_probability: estimatedProb,
      edge_percent: parseFloat(edgePercent.toFixed(2)),
      has_value: edgePercent >= 5.0,
      confidence: confidence,
    });
  } catch (e) {
    console.error(e);
    return JSON.stringify({error: `Failed to calculate edge: ${e.message}`});
  }
};
