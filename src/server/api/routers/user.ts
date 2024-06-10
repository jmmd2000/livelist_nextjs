import { z } from "zod";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { type User } from "types";

export const userRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        first_name: z.string().or(z.null()),
        last_name: z.string().or(z.null()),
        avatar_url: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentUser = ctx.currentUser;
      try {
        // Check if a user with this google_id already exists
        const existingUser = await ctx.db.user.findUnique({
          where: { google_id: currentUser },
        });

        if (existingUser) {
          return existingUser;
        }

        // Check if a user with this friendcode already exists
        let friendCode;
        while (true) {
          const generatedFriendCode = uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: "-",
            length: 3,
          });

          const friendCodeExists = await ctx.db.user.findUnique({
            where: { friendcode: generatedFriendCode },
          });

          if (!friendCodeExists) {
            friendCode = generatedFriendCode;
            break;
          }
        }

        const user = await ctx.db.user.create({
          data: {
            google_id: currentUser,
            first_name: input.first_name,
            last_name: input.last_name,
            avatar_url: input.avatar_url,
            friendcode: friendCode,
          },
        });

        return user;
      } catch (e) {
        console.error(e);
      }
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany();
    return users;
  }),
  getByFriendcode: privateProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { friendcode: input },
      });

      return user as User;
    }),
  getCurrent: privateProcedure.query(async ({ ctx }) => {
    const currentUser = ctx.currentUser;

    const user = await ctx.db.user.findUnique({
      where: { google_id: currentUser },
    });

    return user as User;
  }),
  // checkName: privateProcedure
  //   .input(z.string())
  //   .query(async ({ input, ctx }) => {
  //     const currentUser = ctx.currentUser;

  //     const user = await ctx.db.user.findUnique({
  //       where: { username: input },
  //     });

  //     if (user) {
  //       return {
  //         name_available: false,
  //       };
  //     }

  //     return {
  //       name_available: true,
  //     };
  //   }),
  // updateUsername: privateProcedure
  //   .input(z.string())
  //   .mutation(async ({ input, ctx }) => {
  //     const currentUser = ctx.currentUser;

  //     const user = await ctx.db.user.update({
  //       where: { google_id: currentUser },
  //       data: { username: input },
  //     });

  //     return user;
  //   }),
});
