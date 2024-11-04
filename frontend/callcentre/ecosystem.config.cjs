module.exports = {
	apps: [
		{
			name: "CallCentre",
			script: "./.output/server/index.mjs",
			exec_mode: "fork",
			instances: 1,
			env: {
				PORT: 3004,
				NODE_ENV: "production",
			},
		},
	],
};
