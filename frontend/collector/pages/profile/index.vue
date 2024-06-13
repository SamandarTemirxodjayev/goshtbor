<template>
  <div v-if="!pageData.loading">
    <UForm
      class="max-w-[40%]"
      :state="state"
      @submit="handleSubmitChangeProfile"
    >
      <UFormGroup label="Ismingiz" name="name" class="mb-4">
        <UInput v-model="state.name" />
      </UFormGroup>
      <UFormGroup label="Familiyangiz" name="surname" class="mb-4">
        <UInput v-model="state.surname" />
      </UFormGroup>
      <UFormGroup label="Login" name="login" class="mb-4">
        <UInput v-model="state.login" />
      </UFormGroup>
      <UFormGroup label="Yangi Parolingiz" name="password" class="mb-4">
        <UInput v-model="state.password" />
      </UFormGroup>
      <UFormGroup
        label="Yangi Parolingizni Takrorlang"
        name="repeated_password"
        class="mb-4"
      >
        <UInput v-model="state.repeated_password" />
      </UFormGroup>
      <UButton size="xl" type="submit" block :loading="pageData.buttonLoading"
        >Tasdiqlash</UButton
      >
    </UForm>
  </div>
  <div v-else>
    <Loader />
  </div>
</template>

<script setup>
const toast = useToast();
const state = reactive({
  name: undefined,
  surname: undefined,
  login: undefined,
  password: undefined,
  repeated_password: undefined,
});
const pageData = reactive({
  loading: true,
  buttonLoading: false,
});
const handleSubmitChangeProfile = async () => {
  try {
    pageData.buttonLoading = true;
    if (state.password != state.repeated_password) {
      return;
    }
    await $fetch(`${BASE_URL}/collectors/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
      body: JSON.stringify(state),
    });
    navigateTo("/exit");
  } catch (error) {
    console.error("Error during onMounted:", error);
    toast.add({ title: error.message || "An error occurred" });
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
  }
  pageData.buttonLoading = false;
};
onMounted(async () => {
  try {
    const resData = await $fetch(`${BASE_URL}/collectors/get-me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
    });
    state.name = resData.data.name;
    state.surname = resData.data.surname;
    state.login = resData.data.login;
  } catch (error) {
    console.error("Error during onMounted:", error);
    toast.add({ title: error.message || "An error occurred" });
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
  }
  pageData.loading = false;
});
</script>