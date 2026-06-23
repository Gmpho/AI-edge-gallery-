interface AiSearchNamespace {
  get(name: string): AiSearchInstance;
}

interface AiSearchInstance {
  search(params: {
    messages: { role: string; content: string }[];
    ai_search_options?: {
      retrieval?: {
        max_num_results?: number;
      };
    };
  }): Promise<{ results?: any[] } | null>;
  chatCompletions(params: {
    messages: { role: string; content: string }[];
    model: string;
    ai_search_options?: {
      retrieval?: {
        max_num_results?: number;
      };
    };
  }): Promise<any>;
}
