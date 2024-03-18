<script setup>
definePageMeta({
  layout: false,
});

const toast = useToast();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const isDisabled = ref(false);
const openConfirmationInput = ref(false);
const code = ref(null);

const loginToSystem = async () => {
  if (email.value === "") {
    return toast.add({ title: "Pochtangizni Kiriting" });
  }
  isLoading.value = true;
  try {
    if (code.value === null) {
      const data = await $fetch(BASE_URL + "/login", {
        method: "POST",
        body: JSON.stringify({
          data: email.value,
          type: "email",
        }),
      });
      toast.add({ title: data.message });
      localStorage.setItem("uuid", data.data.uuid);
      isDisabled.value = true;
      openConfirmationInput.value = true;
      isLoading.value = false;
      return;
    } else {
      const data = await $fetch(
        BASE_URL + "/login/" + localStorage.getItem("uuid"),
        {
          method: "POST",
          body: JSON.stringify({
            code: code.value,
          }),
        }
      );
      toast.add({ title: data.message });
      localStorage.setItem("token", data.data.auth_token);
      isDisabled.value = true;
      return navigateTo("/");
    }
  } catch (error) {
    let message = "Xato yuz berdi";
    if (error.response && error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (typeof error === "string") {
      message = error;
    }
    console.log(error);
    toast.add({ title: message });
  }
  isLoading.value = false;
};

onBeforeMount(() => {
  if (localStorage.getItem("token")) {
    navigateTo("/");
  }
});
</script>

<template>
  <div class="mt-[15%] flex justify-center items-center">
    <UForm class="min-w-[50%]" @submit="loginToSystem">
      <h1 class="text-3xl my-[2%] font-bold">Tizimga Kirish</h1>
      <NuxtLoadingIndicator />

      <UFormGroup
        class="my-[2%]"
        label="Pochtangizni Kiriting"
        name="email"
        size="lg"
      >
        <UInput
          v-model="email"
          size="lg"
          placeholder="Pochtangizni kiriting"
          :disabled="isDisabled"
        />
      </UFormGroup>
      <UFormGroup
        v-if="openConfirmationInput"
        class="my-[2%]"
        label="Kodni Kiriting"
        name="email"
        size="lg"
      >
        <UInput v-model="code" size="lg" placeholder="Kodni kiriting" />
      </UFormGroup>

      <UFormGroup class="my-[2%]" name="submit" size="lg">
        <UButton
          :loading="isLoading"
          type="submit"
          color="primary"
          size="lg"
          block
          >Tasdiqlash</UButton
        >
      </UFormGroup>
    </UForm>
  </div>
</template>