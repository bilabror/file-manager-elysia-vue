import { edenTreaty } from "@elysiajs/eden";
import type { App } from "backend/src";

export const backend = edenTreaty<App>("http://0.0.0.0:3000/");
