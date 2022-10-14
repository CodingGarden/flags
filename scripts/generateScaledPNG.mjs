import cliProgress from "cli-progress";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// TODO: pass these in as CLI arguments
const BACKGROUND = "#0000";
const SCALING_KERNEL = undefined;
const SIZE_RATIO = 1.5;
const SIZES_TO_GENERATE = [
  // each object must have a width or a height or both(contain)
  // can pass kernel property as well to control scaling algorithm
  { height: 16, width: 16 * SIZE_RATIO },
  { height: 24, width: 24 * SIZE_RATIO },
  { height: 32, width: 32 * SIZE_RATIO },
  { height: 40, width: 40 * SIZE_RATIO },
  { height: 56, width: 56 * SIZE_RATIO },
  { height: 64, width: 64 * SIZE_RATIO },
  { height: 96, width: 96 * SIZE_RATIO },
  { height: 128, width: 128 * SIZE_RATIO },
  { height: 192, width: 192 * SIZE_RATIO },
  { height: 256, width: 256 * SIZE_RATIO },
  { height: 512, width: 512 * SIZE_RATIO },
];

async function scaleFlag(metaInfo, options) {
  const svgPath = path.join("svg", `${metaInfo.route}.svg`);

  if (!options.width && !options.height) {
    throw new Error("either width, height or both must be specified");
  }

  const result = await sharp(svgPath)
    .resize(options.width, options.height, {
      fit: "contain",
      background: BACKGROUND,
      kernel: options.kernel || SCALING_KERNEL,
    })
    .png()
    .toBuffer({ resolveWithObject: true });

  const pngPath = path.join(
    "dist",
    "png",
    `${result.info.width}x${result.info.height}`,
    `${metaInfo.route}.png`
  );

  await fs.mkdir(path.dirname(pngPath), { recursive: true });
  await fs.writeFile(pngPath, result.data);
}

(async () => {
  const metaContents = await fs.readFile("dist/metadata.json", "utf-8");
  const metaData = JSON.parse(metaContents);

  const totalFlags = metaData.length * SIZES_TO_GENERATE.length;

  const bar = new cliProgress.SingleBar(
    {},
    { format: "generating flags [{bar}] | {percentage}% | {value}/{total}" }
  );

  bar.start(totalFlags, 0);

  for (const size of SIZES_TO_GENERATE) {
    for (const info of metaData) {
      await scaleFlag(info, size);
      bar.increment();
    }
  }

  bar.stop();
})();
