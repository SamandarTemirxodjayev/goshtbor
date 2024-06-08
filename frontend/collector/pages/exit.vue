<script setup>
onMounted(() => {
  localStorage.clear();
  navigateTo("/login");
});
definePageMeta({
  layout: false,
});
</script>

<template>
  <div>
    <Loader />
  </div>
</template>
