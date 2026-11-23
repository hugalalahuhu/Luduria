export type Context = {
    userId: string | undefined;
};
export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    game: import("@trpc/server").TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        state: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: import("../shared/types").GameState;
            meta: object;
            errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        }>;
        join: import("@trpc/server").TRPCMutationProcedure<{
            input: void;
            output: import("../shared/types").GameState;
            meta: object;
            errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        }>;
        leave: import("@trpc/server").TRPCMutationProcedure<{
            input: void;
            output: import("../shared/types").GameState;
            meta: object;
            errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        }>;
        send: import("@trpc/server").TRPCMutationProcedure<{
            input: import("../shared/input").SendInput;
            output: import("../shared/types").GameState & {
                posted: boolean;
            };
            meta: object;
            errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        }>;
    }>>;
    profile: import("@trpc/server").TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        get: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: import("../shared/types").Profile;
            meta: object;
            errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        }>;
        save: import("@trpc/server").TRPCMutationProcedure<{
            input: import("../shared/input").ProfileInput;
            output: import("../shared/types").Profile;
            meta: object;
            errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        }>;
    }>>;
}>>;
export type AppRouter = typeof appRouter;
