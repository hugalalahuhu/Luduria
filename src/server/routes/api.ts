import { Hono } from 'hono';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { reddit } from '@devvit/web/server';
import { appRouter } from '../trpc';

export const api = new Hono();

api.all('/trpc/*', (c) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: async () => ({
      userId: (await reddit.getCurrentUsername()) ?? undefined,
    }),
  })
);
