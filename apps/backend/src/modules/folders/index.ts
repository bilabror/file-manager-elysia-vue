import Elysia from "elysia";
import { FoldersModel } from "./model";
import { FoldersService } from "./service";

export const folders = new Elysia({ prefix: "/folders" })
  .use(FoldersModel)
  .get(
    "/",
    async () => {
      return await FoldersService.getAllFolders();
    },
    {
      response: {
        200: "folders.api.response",
      },
      detail: {
        tags: ["Folders"],
        summary: "Get all folders",
        description: "Retrieve all folders from the database",
      },
    }
  )
  .get(
    "/files",
    async () => {
      return await FoldersService.getAllFiles();
    },
    {
      response: {
        200: "folders.api.files.response",
      },
      detail: {
        tags: ["Folders"],
        summary: "Get all files",
        description: "Retrieve all files from the database",
      },
    }
  )
  .get(
    "/:parentId/children",
    async ({ params }) => {
      const parentId = params.parentId;
      return await FoldersService.getFolderChildren(parentId);
    },
    {
      params: "folders.api.params",
      response: {
        200: "folders.api.children.response",
      },
      detail: {
        tags: ["Folders"],
        summary: "Get folder children",
        description: "Retrieve folders and files within a specific parent folder",
      },
    }
  );
