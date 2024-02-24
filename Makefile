serve:
	node esbuild.mjs serve

build:
	NODE_ENV='production' node esbuild.mjs build
