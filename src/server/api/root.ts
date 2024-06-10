import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { listRequestRouter } from "./routers/listRequest";
import { userRouter } from "./routers/user";
import { listRouter } from "./routers/list";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  listRequest: listRequestRouter,
  list: listRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
