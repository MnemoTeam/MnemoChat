import type { FastifyInstance } from "fastify";

export async function ollamaProxyRoutes(app: FastifyInstance) {
  app.post<{ Body: { endpoint: string } }>(
    "/api/ollama/health",
    async (request) => {
      const { endpoint } = request.body;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${endpoint}/api/tags`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        return { ok: res.ok };
      } catch {
        return { ok: false };
      }
    }
  );

  app.post<{ Body: { endpoint: string } }>(
    "/api/ollama/models",
    async (request) => {
      const { endpoint } = request.body;
      try {
        const res = await fetch(`${endpoint}/api/tags`);
        if (!res.ok) return { models: [] };
        const data = (await res.json()) as {
          models?: Array<{
            name: string;
            size: number;
            details?: {
              parameter_size?: string;
              family?: string;
              quantization_level?: string;
            };
          }>;
        };
        return { models: data.models || [] };
      } catch {
        return { models: [] };
      }
    }
  );
}
