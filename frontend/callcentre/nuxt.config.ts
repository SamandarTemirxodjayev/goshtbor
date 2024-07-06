// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: {enabled: false},
	colorMode: {
		preference: "light",
	},
	modules: ["@nuxt/ui", "@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt"],
	nitro: {
		experimental: {
			websocket: true,
		},
	},
});
