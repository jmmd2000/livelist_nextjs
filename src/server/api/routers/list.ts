import { z } from "zod";
import { type List } from "types";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const listRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentUser = ctx.currentUser;
      try {
        const list = await ctx.db.list.findUnique({
          where: { name: input.name, created_by_google_id: currentUser },
        });

        if (list) {
          return {
            success: false,
            message: "List with this name already exists.",
          };
        }

        await ctx.db.list.create({
          data: {
            name: input.name,
            created_by_google_id: currentUser,
          },
        });

        const createdList = await ctx.db.list.findUnique({
          where: { name: input.name },
        });

        if (createdList?.id) {
          await ctx.db.userList.create({
            data: {
              user_google_id: currentUser,
              list_id: createdList?.id,
            },
          });
        }

        return createdList;
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          return {
            success: false,
            message: error.message,
          };
        } else {
          return {
            success: false,
            message: "An error occurred while creating the list.",
          };
        }
      }
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const lists = await ctx.db.list.findMany();
    return lists;
  }),
  getAllWithMember: privateProcedure.query(async ({ ctx }) => {
    const currentUser = ctx.currentUser;

    const lists = (await ctx.db.list.findMany({
      where: {
        members: {
          some: {
            user_google_id: currentUser,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    })) as List[];

    return lists;
  }),
  // getByName: privateProcedure
  //   .input(z.string())
  //   .query(async ({ input, ctx }) => {
  //     const team = (await ctx.db.team.findUnique({
  //       where: { name: input },
  //       include: {
  //         members: {
  //           include: {
  //             user: true,
  //           },
  //         },
  //         matches: {
  //           include: {
  //             map: true,
  //           },
  //           orderBy: {
  //             created_at: "desc",
  //           },
  //         },
  //       },
  //     })) as unknown as Team;

  //     return team;
  //   }),
  getByID: privateProcedure.input(z.number()).query(async ({ input, ctx }) => {
    const list = (await ctx.db.list.findUnique({
      where: { id: input },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    })) as List;

    return list;
  }),
  // checkName: privateProcedure
  //   .input(z.string())
  //   .query(async ({ input, ctx }) => {
  //     const currentUser = ctx.currentUser;

  //     const team = await ctx.db.team.findUnique({
  //       where: { name: input },
  //     });

  //     if (team) {
  //       return {
  //         name_available: false,
  //       };
  //     }

  //     return {
  //       name_available: true,
  //     };
  //   }),
  updateName: privateProcedure
    .input(
      z.object({
        list_id: z.number(),
        new_name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // const currentUser = ctx.currentUser;

      const list = await ctx.db.list.findUnique({
        where: { id: input.list_id },
      });

      if (list?.name !== input.new_name) {
        const updatedList = await ctx.db.list.update({
          where: { id: input.list_id },
          data: {
            name: input.new_name,
          },
        });

        return updatedList;
      }

      return {
        success: true,
        message: "Successfully updated team name.",
      };
    }),
  delete: privateProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      // const currentUser = ctx.currentUser;

      // const list = await ctx.db.list.findUnique({
      //   where: { id: input },
      //   include: {
      //     members: {
      //       include: {
      //         user: true,
      //       },
      //     },
      //     // matches: {
      //     //   include: {
      //     //     map: true,
      //     //   },
      //     // },
      //   },
      // });

      await ctx.db.userList.deleteMany({
        where: { list_id: input },
      });

      await ctx.db.listRequest.deleteMany({
        where: { list_id: input },
      });

      const deletedList = await ctx.db.list.delete({
        where: { id: input },
      });

      return deletedList;
    }),
});
