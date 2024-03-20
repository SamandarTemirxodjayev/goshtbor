<script setup>
const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});
const route = useRoute();

const links = [
  {
    label: "Asosiy Sahifa",
    icon: "i-heroicons-home",
    to: "/",
  },
  {
    label: "Profil",
    icon: "i-heroicons-user-circle",
    to: "/profile",
  },
  {
    label: "Foydalanuvchilar",
    icon: "i-heroicons-users",
    to: "/users",
  },
  {
    label: "Bannerlar",
    icon: "i-heroicons-cpu-chip",
    to: "/banners",
  },
  {
    label: "Kategoriyalar",
    icon: "i-heroicons-bars-4",
    to: "/categories",
  },
  {
    label: "Brendlar",
    icon: "i-heroicons-cube-transparent",
    to: "/brands",
  },
  {
    label: "Chiqish",
    icon: "i-heroicons-chevron-double-left",
    to: "/exit",
  },
];
</script>
<template>
  <div>
    <aside
      class="fixed left-0 w-[15%] top-0 h-full transition-transform -translate-x-full sm:translate-x-0 border-r border-gray-300 shadow-inner z-10"
    >
      <ul class="mt-4">
        <UVerticalNavigation :links="links"> </UVerticalNavigation>
      </ul>
      <div class="ml-2 absolute bottom-[5%]">
        <ClientOnly>
          <UButton
            :icon="
              isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'
            "
            color="gray"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark"
          />
          <template #fallback>
            <div class="w-8 h-8" />
          </template>
        </ClientOnly>
      </div>
    </aside>
  </div>
  <div class="ml-[15%] mt-[1%]">
    <slot />
  </div>
</template>