<template>
  <div
    v-if="!pageData.loading"
    class="justify-center items-center flex h-screen"
  >
    <UForm class="min-w-[50%]" @submit="handleLoginCollector">
      <UFormGroup label="Login" class="mt-4">
        <UInput
          size="xl"
          type="text"
          placeholder="collector"
          icon="i-heroicons-user-circle"
          v-model="user.login"
        />
      </UFormGroup>
      <UFormGroup label="Parol" class="mt-4">
        <UInput
          size="xl"
          type="password"
          placeholder="parol"
          icon="i-heroicons-squares-2x2"
          v-model="user.password"
        />
      </UFormGroup>
      <UButton
        class="mt-4"
        size="xl"
        type="submit"
        block
        :loading="pageData.buttonLoading"
      >
        Tasdiqlash
      </UButton>
    </UForm>
  </div>
  <div v-else>
    <Loader />
  </div>
</template>
<script setup>
const toast = useToast();
const pageData = reactive({
  loading: true,
  buttonLoading: false,
});

const user = reactive({
  login: "",
  password: "",
});

onMounted(() => {
  try {
    if (localStorage.getItem("collectorToken")) {
      return navigateTo("/");
    }
    pageData.loading = false;
  } catch (error) {
    console.log(error);
  }
});
const handleLoginCollector = async () => {
  pageData.buttonLoading = true;
  try {
    const resData = await $fetch(BASE_URL + "/collectors/login", {
      method: "POST",
      body: JSON.stringify(user),
    });
    localStorage.setItem("collectorToken", resData.data.auth_token);
    toast.add({ title: "Muvaffaqiyatli Kirildi" });
    navigateTo("/");
  } catch (error) {
    toast.add({ title: error.data.message });
    pageData.buttonLoading = false;
  }
};
definePageMeta({
  layout: false,
});
</script>