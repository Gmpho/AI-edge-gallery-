import type { StrikeTipsMcp } from './index';

interface Env {
  API_KEY?: string;
  RACING_API_KEY?: string;
  AI_SEARCH?: AiSearchNamespace;
  AI?: Fetcher;
  BROWSER?: Fetcher;
  MCP_SERVER_NAME: string;
  MCP_SERVER_VERSION: string;
  MCP_OBJECT: DurableObjectNamespace<StrikeTipsMcp>;
}
