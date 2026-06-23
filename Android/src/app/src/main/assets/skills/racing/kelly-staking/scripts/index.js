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
    const edgePercent = parseFloat(input['edge_percent']);
    const bankroll = parseFloat(input['bankroll']);

    if (edgePercent < 0 || bankroll <= 0) {
      return JSON.stringify({error: 'Invalid input. Edge must be >= 0, bankroll must be > 0.'});
    }

    // Full Kelly: stake = bankroll * (edge / 100)
    // Half-Kelly: stake = bankroll * (edge / 100) * 0.5
    // Capped at 5% of bankroll per bet
    const halfKellyStake = bankroll * (edgePercent / 100.0) * 0.5;
    const maxStake = Math.min(halfKellyStake, bankroll * 0.05);

    return JSON.stringify({
      half_kelly_stake: parseFloat(maxStake.toFixed(2)),
      max_stake_capped: parseFloat(maxStake.toFixed(2)),
      current_bankroll: bankroll,
      edge_percent: edgePercent,
      percent_of_bankroll: parseFloat(((maxStake / bankroll) * 100).toFixed(2)),
      kelly_fraction: 0.5,
    });
  } catch (e) {
    console.error(e);
    return JSON.stringify({error: `Failed to calculate stake: ${e.message}`});
  }
};
