---
name: calculate-probability-edge
description: Calculate the betting edge given decimal odds and estimated probability.
---

# Calculate Probability Edge

This skill calculates the probability edge for a horse racing bet.

## Examples

* "What is the edge on Horse X at 6.5 odds if I estimate 25%?"
* "Calculate edge for 3.2 odds with 35% probability"

## Instructions

Call the `run_js` tool with the following exact parameters:

- script name: `index.html`
- data: A JSON string with the following fields
  - odds_decimal: the decimal odds (e.g., 6.5)
  - estimated_probability: your estimated win probability as a decimal (e.g., 0.25)
