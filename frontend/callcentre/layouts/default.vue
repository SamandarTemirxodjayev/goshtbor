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
    label: "Buyurtmalar",
    icon: "i-heroicons-squares-2x2",
    to: "/products",
  },
  {
    label: "Yangi Buyurtma",
    icon: "i-heroicons-paper-airplane",
    to: "/new-order",
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
        <UVerticalNavigation :links="links" size="lg"> </UVerticalNavigation>
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