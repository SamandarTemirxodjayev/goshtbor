<template>
  <div>
    <UForm @submit="handleSubmit">
      <div class="w-[50%] flex justify-between">
        <UInput
          icon="i-heroicons-magnifying-glass-20-solid"
          size="lg"
          class="w-[90%] mr-2"
          color="white"
          :trailing="false"
          v-model="pageData.searchData"
          placeholder="Buyurtma ID yoki telefon raqam"
        />
        <UButton size="lg" type="submit" @click="handleSubmit"
          >Qidirish</UButton
        >
      </div>
    </UForm>
  </div>
</template>
<script setup>
const pageData = reactive({
  searchData: "",
});
const handleSubmit = async () => {
  try {
    const resData = await $fetch(`${BASE_URL}/helper/order/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
      body: JSON.stringify({
        data: pageData.searchData,
      }),
    });
    console.log(resData);
  } catch (error) {
    console.log(error);
  }
};
</script>