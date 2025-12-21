const VERSION = "1.0.0";
const BANNER = `/* Mite.js v${VERSION} | MIT License | https://github.com/n2geoff/mite */\n`;

const flavors = [
    { name: "core",entry: "./src/builds/core.js" },
    { name: "standard",entry: "./src/mite.js" }
];

async function build() {
    for (const flavor of flavors) {
        const filename = `mite.${flavor.name}.min.js`;
        const outpath = `./dist/${filename}`;

        const result = await Bun.build({
            entrypoints: [flavor.entry],
            outdir: './dist',
            naming: filename,
            minify: true,
            sourcemap: "none",
        });

        if (result.success) {
            // 1. Read the newly created minified file
            const file = Bun.file(outpath);
            const originalContent = await file.text();

            // 2. Overwrite it with the Banner + Content
            await Bun.write(outpath,BANNER + originalContent);

            console.log(`✅ ${filename} built (${(BANNER.length + originalContent.length)} bytes)`);
        } else {
            console.error(`❌ Build failed: ${flavor.name}`,result.logs);
        }
    }
}

build();