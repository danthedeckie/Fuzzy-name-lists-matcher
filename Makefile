build:
	NODE_ENV='production' node esbuild.mjs build

serve:
	node esbuild.mjs serve

test:
	node --experimental-vm-modules node_modules/jest/bin/jest.js

autotest:
	node --experimental-vm-modules node_modules/jest/bin/jest.js --watchAll

format:
	npm run format --write src/

format-check:
	npm run format --write src/

lint:
	npm run lint src/
