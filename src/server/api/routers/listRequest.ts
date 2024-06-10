import { z } from "zod";
import { type List, type ListRequest } from "types";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const listRequestRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        list_id: z.number(),
        to_user_google_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentUser = ctx.currentUser;

      const request = await ctx.db.listRequest.create({
        data: {
          list_id: input.list_id,
          from_user_google_id: currentUser,
          to_user_google_id: input.to_user_google_id,
        },
      });

      return request;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const lists = (await ctx.db.list.findMany()) as unknown as List[];
    return lists;
  }),
  getAllWithMember: privateProcedure.query(async ({ ctx }) => {
    const currentUser = ctx.currentUser;

    const requests = await ctx.db.listRequest.findMany({
      where: {
        to_user_google_id: currentUser,
      },
      include: {
        list: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return requests as ListRequest[];
  }),
  getAllWithTeam: privateProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      // const currentUser = ctx.currentUser;

      const requests = await ctx.db.listRequest.findMany({
        where: {
          list_id: input,
        },
        include: {
          list: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // console.log(requests);

      return requests as ListRequest[];
    }),
  accept: privateProcedure
    .input(
      z.object({
        list_id: z.number(),
        from_user_google_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentUser = ctx.currentUser;

      const request = await ctx.db.listRequest.update({
        where: {
          from_user_google_id_to_user_google_id_list_id: {
            from_user_google_id: input.from_user_google_id,
            to_user_google_id: currentUser,
            list_id: input.list_id,
          },
        },
        data: {
          status: "accepted",
        },
      });

      await ctx.db.userList.create({
        data: {
          list_id: input.list_id,
          user_google_id: currentUser,
        },
      });

      return request;
    }),
  decline: privateProcedure
    .input(
      z.object({
        list_id: z.number(),
        from_user_google_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentUser = ctx.currentUser;

      const request = await ctx.db.listRequest.update({
        where: {
          from_user_google_id_to_user_google_id_list_id: {
            from_user_google_id: input.from_user_google_id,
            to_user_google_id: currentUser,
            list_id: input.list_id,
          },
        },
        data: {
          status: "rejected",
        },
      });

      return request;
    }),
  revoke: privateProcedure
    .input(
      z.object({
        list_id: z.number(),
        member_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentUser = ctx.currentUser;

      const listRequest = await ctx.db.listRequest.delete({
        where: {
          from_user_google_id_to_user_google_id_list_id: {
            from_user_google_id: currentUser,
            to_user_google_id: input.member_id,
            list_id: input.list_id,
          },
        },
      });

      return listRequest;
    }),
  delete: privateProcedure
    .input(
      z.object({
        to_user_google_id: z.string(),
        list_id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentUser = ctx.currentUser;

      const request = await ctx.db.listRequest.delete({
        where: {
          from_user_google_id_to_user_google_id_list_id: {
            from_user_google_id: currentUser,
            to_user_google_id: input.to_user_google_id,
            list_id: input.list_id,
          },
        },
      });

      return request;
    }),
});
