---
name: kelly-staking
description: Calculate the maximum stake for a bet using Half-Kelly criterion.
---

# Kelly Staking

This skill calculates the optimal stake size using the Half-Kelly criterion.

## Examples

* "What is my max stake for a 12% edge with R5000 bankroll?"
* "Calculate Kelly stake for 8% edge"

## Instructions

Call the `run_js` tool with the following exact parameters:

- script name: `index.html`
- data: A JSON string with the following fields
  - edge_percent: the probability edge percentage (e.g., 12.0)
  - bankroll: current bankroll amount (e.g., 5000)
