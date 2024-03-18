<script setup>
let user = ref({
  username: "",
  name: "",
  surname: "",
  phone_number: "",
  password: "",
});
let isLoading = ref(true);

const toast = useToast();

onMounted(async () => {
  try {
    const data = await $fetch(BASE_URL + "/user/getme", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    toast.add({ title: data.message });
    user.value = data.data;
    isLoading.value = false;
  } catch (error) {
    return console.log(error);
  }
});
const handleSubmitForm = async () => {
  isLoading.value = true;
  try {
    const data = await $fetch(BASE_URL + "/user/edit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: user.value.name,
        surname: user.value.surname,
        email: user.value.email,
      }),
    });
    toast.add({ title: data.message });
    toast.add({ title: "Boshidan Tizimga Kiring" });
    navigateTo("/exit");
  } catch (error) {
    console.log(error);
  }
  isLoading.value = false;
};
</script>

<template>
  <div>
    <UForm class="max-w-[40%]" @submit="handleSubmitForm">
      <h1 class="text-2xl font-semibold">Profil Ma'lumotlari</h1>
      <UFormGroup class="my-[2%]" label="Pochta Manzili" name="name" size="sm">
        <UInput
          v-model="user.email"
          size="sm"
          placeholder="Usernamizni kiriting"
        />
      </UFormGroup>
      <UFormGroup class="my-[2%]" label="Ismingiz" name="name" size="sm">
        <UInput
          v-model="user.name"
          size="sm"
          placeholder="Ismingizni kiriting"
        />
      </UFormGroup>
      <UFormGroup class="my-[2%]" label="Familyangiz" name="surname" size="sm">
        <UInput
          v-model="user.surname"
          size="sm"
          placeholder="Familyangizni kiriting"
        />
      </UFormGroup>
      <UFormGroup class="my-[2%]" name="submit" size="xl">
        <UButton
          :loading="isLoading"
          type="submit"
          color="primary"
          size="sm"
          block
          >Tasdiqlash</UButton
        >
      </UFormGroup>
    </UForm>
  </div>
</template>