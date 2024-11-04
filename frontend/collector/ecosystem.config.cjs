module.exports = {
	apps: [
		{
			name: "Collector",
			script: "./.output/server/index.mjs",
			exec_mode: "fork",
			instances: 1,
			env: {
				PORT: 3003,
				NODE_ENV: "production",
			},
		},
	],
};
