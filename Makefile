serve:
	node esbuild.mjs serve

build:
	NODE_ENV='production' node esbuild.mjs build

test:
	node --experimental-vm-modules node_modules/jest/bin/jest.js

autotest:
	node --experimental-vm-modules node_modules/jest/bin/jest.js --watchAll
