import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
    // The Reels ad renderer is a standalone browser/Node project, not part of the Next app.
    globalIgnores(["showreel/**"]),
    {
        extends: [...next],
    },
]);
