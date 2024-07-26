module.exports = {
	apps: [
		{
			name: "CallCentre",
			script: "./.output/server/index.mjs",
			exec_mode: "cluster",
			instances: "max",
			env: {
				PORT: 3004,
				NODE_ENV: "production",
			},
		},
	],
};
