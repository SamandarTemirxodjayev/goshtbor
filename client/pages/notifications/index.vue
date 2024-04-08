<script setup>
const toast = useToast();

let categories = ref([]);
let isOpen = ref(false);
let isLoading = ref(true);
let categoryText_uz = ref("");
let categoryText_en = ref("");
let categoryText_ru = ref("");
let categoryText2_uz = ref("");
let categoryText2_en = ref("");
let categoryText2_ru = ref("");
let photo_url = ref(null);
let editedItem = ref(null);
let isEditOpen = ref(false);

onMounted(async () => {
  try {
    const data = await $fetch(BASE_URL + "/notification", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    categories.value = data.data;
    isLoading.value = false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
    return console.log(error);
  }
});

const columns = [
  {
    key: "title_uz",
    label: "Nomi (O'zbek tilida)",
  },
  {
    key: "title_ru",
    label: "Nomi (Rus tilida)",
  },
  {
    key: "content_en",
    label: "Nomi (Ingliz tilida)",
  },
  {
    key: "content_uz",
    label: "Tavsifi (O'zbek tilida)",
  },
  {
    key: "content_ru",
    label: "Tavsifi (Rus tilida)",
  },
  {
    key: "title_en",
    label: "Tavsifi (Ingliz tilida)",
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
  try {
    const data = await $fetch(BASE_URL + "/notification/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (data.status === 200) {
      toast.add({ title: data.message });
      const res = await $fetch(BASE_URL + "/notification", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      categories.value = res.data;
    } else {
      toast.add({ title: data.message });
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
    console.log(error);
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
    const fetchBanner = await $fetch(BASE_URL + "/notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        photo_url: data.fileUrl,
        title_uz: categoryText_uz.value,
        title_ru: categoryText_ru.value,
        title_en: categoryText_en.value,
        content_uz: categoryText2_uz.value,
        content_ru: categoryText2_ru.value,
        content_en: categoryText2_en.value,
      }),
    });
    isOpen.value = false;
    toast.add({ title: fetchBanner.message });
    const res = await $fetch(BASE_URL + "/notification", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    photo_url.value = null;
    categories.value = res.data;
    categoryText_uz.value = "";
    categoryText_ru.value = "";
    categoryText_en.value = "";
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
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
    editedItem.value = null;
    categories.value = res.data;
    categoryText.value = "";
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
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
    <div class="text-2xl font-bold">Xabarnomalar</div>
    <div
      class="shadow-2xl border border-gray-300 dark:border-gray-500 items-center my-4"
    >
      <div class="flex p-2 justify-end">
        <UButton size="lg" @click="isOpen = true"
          >Xabarnomalar Yuborish</UButton
        >
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
          <UButton label="Xabarnomalar Yuborish" @click="isOpen = true" />
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
              Xabarnomani Tahrirlash
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
              Xabarnoma Qo'shish
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
            label="Kategoriya Uchun Sarlavha Kiriting (O'zbek tilida)"
            name="photo"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="categoryText_uz" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Kategoriya Uchun Sarlavha Kiriting (Rus tilida)"
            name="photo"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="categoryText_ru" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Kategoriya Uchun Sarlavha Kiriting (Ingliz tilida)"
            name="photo"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="categoryText_en" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Kategoriya Uchun Tavsif Kiriting (O'zbek tilida)"
            name="photo"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="categoryText2_uz" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Kategoriya Uchun Tavsif Kiriting (Rus tilida)"
            name="photo"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="categoryText2_ru" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Kategoriya Uchun Tavsif Kiriting (Ingliz tilida)"
            name="photo"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="categoryText2_en" />
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