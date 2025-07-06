import { pgTable, varchar, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const folders = pgTable(
  "folders",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    parentId: varchar("parent_id", { length: 36 }),
    path: text("path").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [index("idx_folders_parent_id").on(t.parentId)]
);

export const files = pgTable(
  "files",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    parentId: varchar("parent_id", { length: 36 })
      .notNull()
      .references(() => folders.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    size: integer("size").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [index("idx_files_parent_id").on(t.parentId)]
);

// Define relations
export const foldersRelations = relations(folders, ({ many, one }) => ({
  children: many(folders),
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
  }),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  parent: one(folders, {
    fields: [files.parentId],
    references: [folders.id],
  }),
}));

// Export types
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
