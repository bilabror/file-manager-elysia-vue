import Elysia from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { folders } from "./modules";

const app = new Elysia({
  prefix: "/api/v1",
})
  .use(cors())
  .use(swagger())
  .use(folders)
  .listen(3000);

export type App = typeof app;
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
