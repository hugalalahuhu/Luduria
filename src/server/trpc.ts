import { initTRPC, TRPCError } from '@trpc/server';
import { parseProfileInput, parseSendInput } from '../shared/input';
import { getProfile, getState, joinQueue, leaveQueue, send, setProfile } from './service';

export type Context = { userId: string | undefined };

const t = initTRPC.context<Context>().create();

// Every procedure requires a Reddit user.
const authed = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Open Luduria from Reddit.' });
  return next({ ctx: { userId: ctx.userId } });
});

export const appRouter = t.router({
  game: t.router({
    state: authed.query(({ ctx }) => getState(ctx.userId)),
    join: authed.mutation(({ ctx }) => joinQueue(ctx.userId)),
    leave: authed.mutation(({ ctx }) => leaveQueue(ctx.userId)),
    send: authed
      .input(parseSendInput)
      .mutation(({ ctx, input }) => send(ctx.userId, input.text, input.choice)),
  }),
  profile: t.router({
    get: authed.query(({ ctx }) => getProfile(ctx.userId)),
    save: authed
      .input(parseProfileInput)
      .mutation(({ ctx, input }) => setProfile(ctx.userId, input)),
  }),
});

export type AppRouter = typeof appRouter;
