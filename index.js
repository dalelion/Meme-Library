const child_process = require("child_process");
const Bundler = require('parcel-bundler');
const Path = require('path');

const [ARGV, ARGV0] = [process.argv, process.argv0];

// Path Specification
const {name: PACKAGE_NAME} = require(`./package.json`);
const MATCH = process.cwd().match(new RegExp(PACKAGE_NAME, "i"));
const ROOT_PATH = MATCH.input.substr(0, MATCH.index + MATCH[0].length);
const RELATIVE_PATH = `./${MATCH.input.substr(MATCH.index + MATCH[0].length)}`;
if (RELATIVE_PATH !== "./") {
	console.error(`Please run this command in the Root Directory: ${ROOT_PATH}`)
}
const CLIENT_ENTRY = Path.join(ROOT_PATH, "./client/*.tsx");
const SERVER_ENTRY = Path.join(ROOT_PATH, "./server/index.js");
// Bundler options
const options = {
	publicUrl: './', // The url to serve on, defaults to '/'
	cacheDir: '.cache', // The directory cache gets put in, defaults to .cache
	contentHash: false, // Disable content hash from being included on the filename
	scopeHoist: false, // Turn on experimental scope hoisting/tree shaking flag, for smaller production bundles
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

const CLIENT_OPTIONS = {
	...options,
	cache: true, // Enabled or disables caching, defaults to true
	target: 'browser', // Browser/node/electron, defaults to browser
	watch: true, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
	minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
	bundleNodeModules: true, // By default, package.json dependencies are not included when using 'node' or 'electron' with 'target' option above. Set to true to adds them to the bundle, false by default
	outDir: './public/js' // The out directory to put the build files in, defaults to dist
	// outFile: `./index.js` // The name of the outputFile
};

const SERVER_OPTIONS = {
	...options,
	cache: false, // Enabled or disables caching, defaults to true
	target: 'node', // Browser/node/electron, defaults to browser
	watch: true, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
	minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
	bundleNodeModules: false, // By default, package.json dependencies are not included when using 'node' or 'electron' with 'target' option above. Set to true to adds them to the bundle, false by default
	outDir: './dist/server', // The out directory to put the build files in, defaults to dist
	outFile: `./index.js` // The name of the outputFile
};

async function run(resolve, reject) {
	let CLIENT, SERVER, CLIENT_BUNDLE, SERVER_BUNDLE, SERVER_PROCESS;
	CLIENT = new Bundler(CLIENT_ENTRY, CLIENT_OPTIONS);
	CLIENT_BUNDLE = await CLIENT.bundle();
	
	SERVER = new Bundler(SERVER_ENTRY, SERVER_OPTIONS);
	SERVER.on("buildStart", () => {
		if (SERVER_PROCESS) {
			SERVER_PROCESS.kill(9);
			SERVER_PROCESS = null;
		}
	});
	SERVER.on("buildEnd", async() => {
		let rm = new Promise(resolve => {
			child_process.spawn(...["rm", ["-rf", "./public"], {
				stdio: "inherit",
				cwd: Path.join(ROOT_PATH, SERVER_OPTIONS.outDir)
			}]).on("close", resolve);
		});
		await rm;
		let ln = new Promise(resolve => {
			child_process.spawn(...["ln", ["-fs", "../../public"], {
				stdio: "inherit",
				cwd: Path.join(ROOT_PATH, SERVER_OPTIONS.outDir)
			}]).on("close", resolve);
		});
		await ln;
		Promise.all([rm, ln]).then(results => child_process.fork(...[SERVER_OPTIONS.outFile, ARGV.slice(2), {
			stdio: "inherit",
			cwd: Path.join(ROOT_PATH, SERVER_OPTIONS.outDir)
		}])).then(server => {
			SERVER_PROCESS = server;
		}).catch(err => {
			process.stderr.write(`${err.stack}`);
		});
	});
	SERVER_BUNDLE = await SERVER.bundle();
	resolve([await CLIENT_BUNDLE, await SERVER_BUNDLE]);
}

async function main() {
	// Initializes a bundler using the entrypoint location and options provided
	return new Promise((resolve, reject) => {
		run(resolve, reject);
	})
}

global.setTimeout(function () {
	main().then(result => {
	}).catch(x => {
		process.stderr.write(`${x}\n`);
		process.exit(1);
	});
}, 2000);

