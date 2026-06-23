import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { z } from 'zod';
import {
  calculateProbabilityEdge,
  calculateProbabilityEdgeSchema,
  calculateMaxPosition,
  calculateMaxPositionSchema,
} from './tools/probability';
import {
  searchPastRaces,
  searchPastRacesSchema,
  searchRacingKeywords,
  searchRacingKeywordsSchema,
} from './tools/search';
import {
  verifyRaceExists,
  verifyRaceExistsSchema,
  evaluateRace,
  evaluateRaceSchema,
  getOddsSnapshot,
  getOddsSnapshotSchema,
} from './tools/data';
import { checkApiKey } from './auth';

export class StrikeTipsMcp extends McpAgent<Env> {
  server = new McpServer({
    name: 'StrikeTips Racing Intelligence',
    version: '1.0.0',
  });

  async init() {
    this.server.registerTool(
      'calculate_probability_edge',
      { inputSchema: calculateProbabilityEdgeSchema },
      async ({ odds_decimal, estimated_probability }) => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              calculateProbabilityEdge(odds_decimal, estimated_probability),
            ),
          },
        ],
      }),
    );

    this.server.registerTool(
      'calculate_max_position',
      { inputSchema: calculateMaxPositionSchema },
      async ({ edge_percent, bankroll }) => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify(calculateMaxPosition(edge_percent, bankroll)),
          },
        ],
      }),
    );

    this.server.registerTool(
      'search_past_races',
      { inputSchema: searchPastRacesSchema },
      async ({ query, n_results }) => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify(await searchPastRaces(this.env, query, n_results)),
          },
        ],
      }),
    );

    this.server.registerTool(
      'search_racing_keywords',
      { inputSchema: searchRacingKeywordsSchema },
      async ({ query, n }) => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify(await searchRacingKeywords(this.env, query, n)),
          },
        ],
      }),
    );

    this.server.registerTool(
      'verify_race_exists',
      { inputSchema: verifyRaceExistsSchema },
      async ({ track, race_number }) => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify(await verifyRaceExists(this.env, track, race_number)),
          },
        ],
      }),
    );

    this.server.registerTool(
      'evaluate_race',
      { inputSchema: evaluateRaceSchema },
      async ({ track, race_number, horses }) => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              await evaluateRace(this.env, track, race_number, horses),
            ),
          },
        ],
      }),
    );

    this.server.registerTool(
      'get_odds_snapshot',
      { inputSchema: getOddsSnapshotSchema },
      async ({ track }) => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify(await getOddsSnapshot(this.env, track)),
          },
        ],
      }),
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const authError = checkApiKey(request, env);
    if (authError) return authError;

    const url = new URL(request.url);
    if (url.pathname === '/mcp') {
      return StrikeTipsMcp.serve('/mcp').fetch(request, env, ctx);
    }

    return new Response('StrikeTips MCP server running. Use /mcp endpoint.', {
      status: 200,
    });
  },
};
