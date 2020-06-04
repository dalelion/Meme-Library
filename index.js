const child_process = require("child_process");
const Bundler = require('parcel-bundler');
const Path = require('path');
const {name: PACKAGE_NAME, main: PACKAGE_ENTRY} = require(`./package.json`);

const MATCH = process.cwd().match(new RegExp(PACKAGE_NAME, "i"));
const ROOT_PATH = MATCH.input.substr(0, MATCH.index + MATCH[0].length);
const RELATIVE_PATH = `./${MATCH.input.substr(MATCH.index + MATCH[0].length)}`;
if (RELATIVE_PATH !== "./") {
  console.error(`Please run this command in the Root Directory: ${ROOT_PATH}`)
}
const ENTRY = Path.join(ROOT_PATH, PACKAGE_ENTRY);
// Bundler options
const options = {
  outDir: './dist', // The out directory to put the build files in, defaults to dist
  outFile: `./${PACKAGE_NAME}.js`, // The name of the outputFile
  publicUrl: './', // The url to serve on, defaults to '/'
  watch: false, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
  cache: true, // Enabled or disables caching, defaults to true
  cacheDir: '.cache', // The directory cache gets put in, defaults to .cache
  contentHash: true, // Disable content hash from being included on the filename
  minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
  scopeHoist: false, // Turn on experimental scope hoisting/tree shaking flag, for smaller production bundles
  target: 'node', // Browser/node/electron, defaults to browser
  bundleNodeModules: false, // By default, package.json dependencies are not included when using 'node' or 'electron' with 'target' option above. Set to true to adds them to the bundle, false by default
  // https: { // Define a custom {key, cert} pair, use true to generate one or false to use http
  //   cert: './ssl/c.crt', // Path to custom certificate
  //   key: './ssl/k.key' // Path to custom key
  // },
  logLevel: 4, // 5 = save everything to a file, 4 = like 3, but with timestamps and additionally log http requests to dev server, 3 = log info, warnings & errors, 2 = log warnings & errors, 1 = log errors
  hmr: false, // Enable or disable HMR while watching
  hmrPort: 0, // The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
  sourceMaps: false, // Enable or disable sourcemaps, defaults to enabled (minified builds currently always create sourcemaps)
  hmrHostname: '', // A hostname for hot module reload, default to ''
  detailedReport: true // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
};

async function main() {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = new Bundler(ENTRY, options);
  return bundler.bundle();
}

main().then(result => {
  return child_process.spawnSync("node", [Path.join(ROOT_PATH, options.outDir, options.outFile)], {stdio: "inherit"});
}).catch(x => {
  process.exit(1);
});
