<script setup>
onBeforeMount(() => {
  if (!localStorage.getItem("token")) {
    navigateTo("/login");
  }
});
</script>

<template>
  <div>Hello World</div>
</template>