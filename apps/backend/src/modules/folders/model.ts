import Elysia, { t } from "elysia";

// Define models using Elysia's validation system
export const FoldersModel = new Elysia({ name: "folders.model" }).model({
  // API models for the current endpoints
  "folders.api.response": t.Object({
    success: t.Boolean(),
    data: t.Optional(
      t.Array(
        t.Object({
          id: t.String(),
          name: t.String(),
          parentId: t.Union([t.String(), t.Null()]),
          path: t.String(),
          createdAt: t.Union([t.Date(), t.Null()]),
          updatedAt: t.Union([t.Date(), t.Null()]),
        })
      )
    ),
    error: t.Optional(t.String()),
  }),

  "folders.api.files.response": t.Object({
    success: t.Boolean(),
    data: t.Optional(
      t.Array(
        t.Object({
          id: t.String(),
          name: t.String(),
          parentId: t.String(),
          path: t.String(),
          size: t.Union([t.Number(), t.Null()]),
          createdAt: t.Union([t.Date(), t.Null()]),
          updatedAt: t.Union([t.Date(), t.Null()]),
        })
      )
    ),
    error: t.Optional(t.String()),
  }),

  "folders.api.children.response": t.Object({
    success: t.Boolean(),
    data: t.Optional(
      t.Object({
        folders: t.Array(
          t.Object({
            id: t.String(),
            name: t.String(),
            parentId: t.Union([t.String(), t.Null()]),
            path: t.String(),
            createdAt: t.Union([t.Date(), t.Null()]),
            updatedAt: t.Union([t.Date(), t.Null()]),
          })
        ),
        files: t.Array(
          t.Object({
            id: t.String(),
            name: t.String(),
            parentId: t.String(),
            path: t.String(),
            size: t.Union([t.Number(), t.Null()]),
            createdAt: t.Union([t.Date(), t.Null()]),
            updatedAt: t.Union([t.Date(), t.Null()]),
          })
        ),
      })
    ),
    error: t.Optional(t.String()),
  }),

  "folders.api.params": t.Object({
    parentId: t.String(),
  }),
});
