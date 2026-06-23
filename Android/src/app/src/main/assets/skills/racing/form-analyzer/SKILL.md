---
name: form-analyzer
description: Analyze horse racing form data and generate ratings.
---

# Form Analyzer

Analyze horse form data (recent runs, distance, track, weight) and generate a structured rating.

## Examples

* "Analyze form for Storm Chaser: last 3 runs were 2nd, 1st, 3rd at 1600m, 1400m, 1600m"
* "Rate horse form: 5yo gelding, 3 starts this season, best time 98.5"

## Instructions

Call the `run_js` tool with the following exact parameters:

- script name: `index.html`
- data: A JSON string with form data fields.

Fields:
- horse: horse name (optional)
- age: age in years (optional)
- recent_positions: array of recent finishing positions (e.g., [2, 1, 3])
- recent_distances: array of distances in meters (e.g., [1600, 1400, 1600])
- best_time: best recent time in seconds (optional)
- starts_this_season: number of starts this season (optional)
- wins_this_season: number of wins this season (optional)
- track: track name (optional)
- distance: today's distance in meters (optional)
- weight: weight carried in kg (optional)
- days_since_last_run: days since last race (optional)
