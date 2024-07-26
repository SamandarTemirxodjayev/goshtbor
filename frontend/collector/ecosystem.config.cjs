module.exports = {
	apps: [
		{
			name: "Collector",
			script: "./.output/server/index.mjs",
			exec_mode: "cluster",
			instances: "max",
			env: {
				PORT: 3003,
				NODE_ENV: "production",
			},
		},
	],
};
