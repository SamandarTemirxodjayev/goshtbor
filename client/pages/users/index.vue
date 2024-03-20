<script setup>
const toast = useToast();

let users = ref([]);
let isOpen = ref(false);
let isLoading = ref(true);
let categoryText = ref("");
let editedItem = ref(null);
let isEditOpen = ref(false);
let page = ref(1);
let pageCount = ref(5);

onMounted(async () => {
  try {
    const data = await $fetch(BASE_URL + "/user/get-all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    users.value = data.data;
    isLoading.value = false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
    console.log(error);
  }
});

const columns = [
  {
    key: "_id",
    label: "ID",
  },
  {
    key: "username",
    label: "Username",
  },
  {
    key: "name",
    label: "Ismi",
  },
  {
    key: "surname",
    label: "Familiyasi",
  },
  {
    key: "phone_number",
    label: "Telefon Raqami",
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
      click: () => deleteUser(row._id),
    },
  ],
];
const deleteUser = async (id) => {
  isLoading.value = true;
  try {
    const data = await $fetch(BASE_URL + "/user/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (data.status === 200) {
      toast.add({ title: data.message });
      const res = await $fetch(BASE_URL + "/user/get-all", {
        method: "GET",
      });
      users.value = res.data;
    } else {
      toast.add({ title: data.message });
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
  }
  isLoading.value = false;
};
const rows = computed(() => {
  return users.value.slice(
    (page.value - 1) * pageCount.value,
    page.value * pageCount.value
  );
});
</script>

<template>
  <div>
    <div class="text-2xl font-bold">Foydalanuvchilar</div>
    <UTable
      :loading="isLoading"
      :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Yuklanmoqda...',
      }"
      :progress="{ color: 'primary', animation: 'carousel' }"
      :columns="columns"
      :rows="rows"
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
    <div
      class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700"
    >
      <UPagination
        v-model="page"
        :page-count="pageCount"
        :total="users.length"
      />
    </div>
  </div>
</template>