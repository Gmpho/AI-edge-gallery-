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

const STORAGE_KEY = 'racing_paper_trader';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { bankroll: 10000, initialBankroll: 10000, bets: [], nextId: 1 };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function recordBet(state, input) {
  const bet = {
    bet_id: `BET${String(state.nextId).padStart(6, '0')}`,
    track: input['track'] || 'Unknown',
    race_number: input['race_number'] || 0,
    horse: input['horse'] || 'Unknown',
    odds: parseFloat(input['odds']) || 0,
    stake: parseFloat(input['stake']) || 0,
    edge_percent: parseFloat(input['edge_percent']) || 0,
    confidence: input['confidence'] || 'NONE',
    status: 'OPEN',
    timestamp: new Date().toISOString(),
  };

  if (bet.stake > state.bankroll) {
    return { status: 'REJECTED', reason: 'Insufficient bankroll', bankroll: state.bankroll };
  }

  if (bet.stake > state.bankroll * 0.05) {
    return { status: 'REJECTED', reason: 'Stake exceeds 5% bankroll limit', bankroll: state.bankroll };
  }

  state.bankroll -= bet.stake;
  state.bets.push(bet);
  state.nextId++;
  saveState(state);

  return { status: 'RECORDED', bet_id: bet.bet_id, stake: bet.stake, remaining_bankroll: state.bankroll };
}

function settleBet(state, input) {
  const betId = input['bet_id'];
  const result = input['result'] || 'LOST';
  const isWin = result.toUpperCase() === 'WON';
  const bet = state.bets.find(b => b.bet_id === betId);

  if (!bet) return { status: 'ERROR', reason: `Bet ${betId} not found` };
  if (bet.status !== 'OPEN') return { status: 'ERROR', reason: `Bet ${betId} already settled` };

  bet.status = isWin ? 'WON' : 'LOST';
  if (isWin) {
    const payout = bet.stake * bet.odds;
    state.bankroll += payout;
    bet.payout = payout;
  }
  saveState(state);

  return { status: 'SETTLED', bet_id: betId, result: bet.status, new_balance: state.bankroll };
}

function getSummary(state) {
  const totalBets = state.bets.length;
  const settledBets = state.bets.filter(b => b.status !== 'OPEN');
  const won = settledBets.filter(b => b.status === 'WON').length;
  const lost = settledBets.filter(b => b.status === 'LOST').length;
  const totalStaked = state.bets.reduce((sum, b) => sum + b.stake, 0);
  const totalReturned = state.bets.filter(b => b.payout).reduce((sum, b) => sum + (b.payout || 0), 0);
  const profitLoss = totalReturned - totalStaked;
  const peak = Math.max(state.initialBankroll, ...state.bets.filter(b => b.payout).map(b => (b.payout || 0) - b.stake + state.initialBankroll - totalStaked + totalReturned));
  const drawdown = peak > 0 ? ((peak - state.bankroll) / peak * 100) : 0;

  return {
    current_balance: state.bankroll,
    initial_bankroll: state.initialBankroll,
    total_profit_loss: parseFloat(profitLoss.toFixed(2)),
    open_bets: state.bets.filter(b => b.status === 'OPEN').length,
    total_bets: totalBets,
    won: won,
    lost: lost,
    win_rate: settledBets.length > 0 ? parseFloat((won / settledBets.length * 100).toFixed(1)) : 0,
    drawdown_percent: parseFloat(drawdown.toFixed(2)),
    recent_bets: state.bets.slice(-5).reverse(),
  };
}

window['ai_edge_gallery_get_result'] = async (data) => {
  try {
    const input = JSON.parse(data);
    const action = input['action'] || 'get_summary';
    const state = loadState();

    // If api_url is provided, optionally fetch live data
    if (input['api_url'] && (action === 'fetch_odds' || action === 'get_summary')) {
      try {
        const resp = await fetch(input['api_url'] + '/odds');
        if (resp.ok) {
          const odds = await resp.json();
          return JSON.stringify({ action, odds, ...getSummary(state) });
        }
      } catch (e) {
        // API unavailable, use local data
      }
    }

    let result;
    switch (action) {
      case 'record_bet':
        result = recordBet(state, input);
        break;
      case 'settle_bet':
        result = settleBet(state, input);
        break;
      case 'reset':
        state.bankroll = parseFloat(input['bankroll']) || 10000;
        state.initialBankroll = state.bankroll;
        state.bets = [];
        state.nextId = 1;
        saveState(state);
        result = { status: 'RESET', bankroll: state.bankroll };
        break;
      case 'get_summary':
      default:
        result = getSummary(state);
        break;
    }

    return JSON.stringify(result);
  } catch (e) {
    console.error(e);
    return JSON.stringify({ error: `Paper trader error: ${e.message}` });
  }
};
