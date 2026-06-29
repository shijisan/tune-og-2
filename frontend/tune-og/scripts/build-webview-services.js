const esbuild = require("esbuild");
const fs = require("fs");

async function build() {
  const result = await esbuild.build({
    entryPoints: ["web-view/index.ts"],
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    minify: true,
    define: {
      global: "window",
      "process.env.NODE_ENV": '"production"',
    },
  });

  const bundle = result.outputFiles[0].text;

  const html = `<html>
<head><meta charset="utf-8" /></head>
<body>
<script>${bundle}</script>
</body>
</html>`;

  fs.writeFileSync("web-view/index.html", html);

  // ← also export as TS module so RN can import it as a string
  fs.writeFileSync(
    "web-view/html.ts",
    `export default ${JSON.stringify(html)};`
  );

  console.log("✅ WebView built and inlined");
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});