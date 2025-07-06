/* eslint-disable @typescript-eslint/no-extraneous-class */
import { db } from "../../database/db";
import type { Folder, File } from "../../database/schema";
import { folders as foldersTable, files as filesTable } from "../../database/schema";
import { eq, isNull } from "drizzle-orm";

// Define interface for API response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface FolderChildren {
  folders: Folder[];
  files: File[];
}

// Using abstract class with static methods to avoid class allocation
export abstract class FoldersService {
  // New API methods
  static async getAllFolders(): Promise<ApiResponse<Folder[]>> {
    try {
      const allFolders = await db.select().from(foldersTable);
      return { success: true, data: allFolders };
    } catch (error) {
      console.error("Error fetching folders:", error);
      return { success: false, error: "Failed to fetch folders" };
    }
  }

  static async getAllFiles(): Promise<ApiResponse<File[]>> {
    try {
      const allFiles = await db.select().from(filesTable);
      return { success: true, data: allFiles };
    } catch (error) {
      console.error("Error fetching files:", error);
      return { success: false, error: "Failed to fetch files" };
    }
  }

  static async getFolderChildren(parentId: string): Promise<ApiResponse<FolderChildren>> {
    try {
      const actualParentId = parentId === "root" ? null : parentId;
      const childFolders = await db
        .select()
        .from(foldersTable)
        .where(actualParentId ? eq(foldersTable.parentId, actualParentId) : isNull(foldersTable.parentId));
      const childFiles = actualParentId ? await db.select().from(filesTable).where(eq(filesTable.parentId, actualParentId)) : [];

      return {
        success: true,
        data: {
          folders: childFolders,
          files: childFiles,
        },
      };
    } catch (error) {
      console.error("Error fetching folder children:", error);
      return { success: false, error: "Failed to fetch folder children" };
    }
  }
}
