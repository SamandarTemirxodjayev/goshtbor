<script setup>
const toast = useToast();

let banners = ref([]);
let isOpen = ref(false);
let isLoading = ref(true);
let photo_url = ref(null);

onMounted(async () => {
  try {
    const data = await $fetch(BASE_URL + "/banners", {
      method: "GET",
    });
    banners.value = data.data;
    isLoading.value = false;
    toast.add({ title: data.message });
  } catch (error) {
    console.log(error);
  }
});
const columns = [
  {
    key: "_id",
    label: "ID",
  },
  {
    key: "photo_url",
    label: "Rasm",
  },
  {
    key: "createdAt",
    label: "Yaratilgan vaqti",
  },
  {
    key: "updatedAt",
    label: "Yangilangan vaqti",
  },
  {
    key: "actions",
    label: "Action",
  },
];
const items = (row) => [
  [
    {
      label: "O'chirish",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteBanner(row._id),
    },
  ],
];
const deleteBanner = async (id) => {
  isLoading.value = true;
  const data = await $fetch(BASE_URL + "/banners/" + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (data.status === 200) {
    toast.add({ title: data.message });
    const res = await $fetch(BASE_URL + "/banners", {
      method: "GET",
    });
    banners.value = res.data;

    toast.add({ title: "Ma'lumotlar Yuklandi" });
  } else {
    toast.add({ title: data.message });
  }
  isLoading.value = false;
};
function handleFileChange(event) {
  if (event.target.files.length > 0) {
    photo_url.value = event.target.files[0]; // Capture the first file
  }
}
const addBanner = async () => {
  isLoading.value = true;
  try {
    const formdata = new FormData();
    formdata.append("file", photo_url.value);
    const { data } = await $fetch(CDN_URL + "/upload", {
      method: "POST",
      body: formdata,
    });
    const fetchBanner = await $fetch(BASE_URL + "/banners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        photo_url: data.fileUrl,
      }),
    });
    isOpen.value = false;
    toast.add({ title: fetchBanner.message });
    const res = await $fetch(BASE_URL + "/banners", {
      method: "GET",
    });
    toast.add({ title: res.message });
    photo_url.value = null;
    banners.value = res.data;
  } catch (error) {
    console.log(error);
  }
  isLoading.value = false;
};
defineShortcuts({
  escape: {
    usingInput: true,
    whenever: [isOpen],
    handler: () => {
      isOpen.value = false;
    },
  },
});
</script>

<template>
  <div>
    <div class="text-2xl font-bold">Bannerlar</div>
    <div class="shadow-2xl border border-gray-500 items-center my-4">
      <div class="flex p-4 justify-end">
        <UButton size="lg" @click="isOpen = true">Banner Qo'shish</UButton>
      </div>
    </div>
    <UTable
      :loading="isLoading"
      :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Yuklanmoqda...',
      }"
      :progress="{ color: 'primary', animation: 'carousel' }"
      :columns="columns"
      :rows="banners"
      :empty-state="{
        icon: 'i-heroicons-circle-stack-20-solid',
        label: 'Bannerlar Mavjud Emas',
      }"
    >
      <template #photo_url-data="{ row }">
        <img :src="row.photo_url" alt="" />
      </template>
      <template #createdAt-data="{ row }">
        {{ dateFormat(row.createdAt) }}
      </template>
      <template #updatedAt-data="{ row }">
        {{ dateFormat(row.updatedAt) }}
      </template>
      <template #actions-data="{ row }">
        <UDropdown :items="items(row)">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal-20-solid"
          />
        </UDropdown>
      </template>
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-6 gap-3">
          <span class="italic text-sm">Ma'lumot Mavjud Emas</span>
          <UButton label="Banner Qo'shish" @click="isOpen = true" />
        </div>
      </template>
    </UTable>
    <UModal v-model="isOpen" prevent-close>
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              Banner Qo'shish
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>

        <UForm @submit="addBanner">
          <UFormGroup
            class="my-[2%]"
            label="Banner Uchun Rasm Tanglang"
            name="photo"
            size="lg"
          >
            <UInput type="file" size="lg" @change="handleFileChange" />
          </UFormGroup>
          <UFormGroup class="my-[2%]" name="submit" size="xl">
            <UButton
              :loading="isLoading"
              type="submit"
              color="primary"
              size="xl"
              block
              >Tasdiqlash</UButton
            >
          </UFormGroup>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>