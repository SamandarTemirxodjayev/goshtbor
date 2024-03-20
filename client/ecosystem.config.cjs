module.exports = {
	apps: [
		{
			name: "client",
			exec_mode: "cluster",
			instances: "max",
			port: 3002,
			script: "./.output/server/index.mjs",
		},
	],
};
