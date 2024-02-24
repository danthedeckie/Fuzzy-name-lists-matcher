import * as esbuild from "esbuild";

import { dirname } from "path";
import { fileURLToPath } from "url";

const pwd = dirname(fileURLToPath(import.meta.url));

const [command, ...args] = process.argv.slice(2);

const config = {
  entryPoints: ["src/js/main.js", "src/css/main.css"],
  outdir: "dist",
  // Stuff you shouldn't need to edit:
  target: ["chrome58", "firefox57", "safari11", "edge19"],
  bundle: true,
  sourcemap: true,
  outExtension: { ".js": ".js" },
  logLevel: "info",
};

switch (command) {
  case "serve":
    // config.outdir = "dist/";
    const ctx = await esbuild.context(config);

    await ctx.watch();

    console.log("watching!");

    let { host, port } = await ctx.serve({
      // servedir: "./static",
      port: 8181,
      servedir: "./dist",
    });

    console.log(`Serving live-reload JS on ${host}:${port}`);
    break;
  case "build":
    // config.outdir = "dist/";
    config.minify = true;
    await esbuild.build(config);

    break;
  default:
    console.log('try "serve" or "build"');
    process.exit(1);
}

// await esbuild.build(config);
