<script setup>
const toast = useToast();

let categories = ref([]);
let isOpen = ref(false);
let isLoading = ref(true);
let categoryText = ref("");
let photo_url = ref(null);
let editedItem = ref(null);
let isEditOpen = ref(false);

onMounted(async () => {
  try {
    const data = await $fetch(BASE_URL + "/category", {
      method: "GET",
    });
    categories.value = data.data;
    toast.add({ title: data.message });
    isLoading.value = false;
  } catch (error) {
    return console.log(error);
  }
});

const columns = [
  {
    key: "_id",
    label: "ID",
  },
  {
    key: "name",
    label: "Nomi",
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
      label: "Tahrirlash",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => editCategory(row),
    },
    {
      label: "O'chirish",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteCategory(row._id),
    },
  ],
];
const deleteCategory = async (id) => {
  isLoading.value = true;
  const data = await $fetch(BASE_URL + "/category/" + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (data.status === 200) {
    toast.add({ title: data.message });
    const res = await $fetch(BASE_URL + "/category", {
      method: "GET",
    });
    categories.value = res.data;

    toast.add({ title: "Ma'lumotlar Yuklandi" });
  } else {
    toast.add({ title: data.message });
  }
  isLoading.value = false;
};
const addCategory = async () => {
  isLoading.value = true;
  try {
    const formdata = new FormData();
    formdata.append("file", photo_url.value);
    const { data } = await $fetch(CDN_URL + "/upload", {
      method: "POST",
      body: formdata,
    });
    const fetchBanner = await $fetch(BASE_URL + "/category", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        photo_url: data.fileUrl,
        name: categoryText.value,
      }),
    });
    isOpen.value = false;
    toast.add({ title: fetchBanner.message });
    const res = await $fetch(BASE_URL + "/category", {
      method: "GET",
    });
    toast.add({ title: res.message });
    photo_url.value = null;
    categories.value = res.data;
  } catch (error) {
    console.log(error);
  }
  isLoading.value = false;
};
const editCategory = (row) => {
  editedItem.value = JSON.parse(JSON.stringify(row));
  isEditOpen.value = true;
};
const handleEditCategory = async () => {
  isLoading.value = true;
  try {
    const fetchCategory = await $fetch(
      BASE_URL + "/category/" + editedItem.value._id,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: editedItem.value.name,
        }),
      }
    );
    isEditOpen.value = false;
    toast.add({ title: fetchCategory.message });
    const res = await $fetch(BASE_URL + "/category", {
      method: "GET",
    });
    toast.add({ title: res.message });
    editedItem.value = null;
    categories.value = res.data;
  } catch (error) {
    console.log(error);
  }
  isLoading.value = false;
};
function handleFileChange(event) {
  if (event.target.files.length > 0) {
    photo_url.value = event.target.files[0];
  }
}
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
    <div class="text-2xl font-bold">Kategoriyalar</div>
    <div class="shadow-2xl border border-gray-500 items-center my-4">
      <div class="flex p-2 justify-end">
        <UButton size="lg" @click="isOpen = true">Kategoriya Qo'shish</UButton>
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
      :rows="categories"
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
          <UButton label="Kategoriya Qo'shish" @click="isOpen = true" />
        </div>
      </template>
    </UTable>

    <UModal v-model="isEditOpen" prevent-close>
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
              Kategoriyani Tahrirlash
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isEditOpen = false"
            />
          </div>
        </template>

        <UForm @submit="handleEditCategory">
          <UFormGroup
            class="my-[2%]"
            label="Kategoriya Uchun Nom Kiriting"
            name="photo"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="editedItem.name" />
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
      </UCard>
    </UModal>
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
              Kategoriya Qo'shish
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

        <UForm @submit="addCategory">
          <UFormGroup
            class="my-[2%]"
            label="Kategoriya Uchun Nom Kiriting"
            name="photo"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="categoryText" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Rasm yuklang"
            name="photo"
            size="lg"
          >
            <UInput type="file" size="lg" @change="handleFileChange" />
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
      </UCard>
    </UModal>
  </div>
</template>