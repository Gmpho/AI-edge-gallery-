---
name: paper-trader
description: Track virtual bets, bankroll, and P&L with optional API-backed live odds.
---

# Paper Trader

Track virtual horse racing bets and bankroll performance.

## Examples

* "Record a R50 bet on Storm Chaser at Turffontein Race 3 at 6.5 odds"
* "Show my current bankroll and P&L"
* "Settle bet ABC123 as WON"

## Instructions

Call the `run_js` tool with the following exact parameters:

- script name: `index.html`
- data: A JSON string with the action and parameters.

Actions:

**record_bet**: Record a new bet
- action: "record_bet"
- track, race_number, horse, odds, stake, edge_percent, confidence

**get_summary**: Show bankroll status
- action: "get_summary"

**settle_bet**: Settle a bet as WON or LOST
- action: "settle_bet"
- bet_id, result ("WON" or "LOST")

**reset**: Reset bankroll to initial value
- action: "reset"
- bankroll (optional, defaults to 10000)

Optional: Set api_url to fetch live odds from a remote MCP server.
