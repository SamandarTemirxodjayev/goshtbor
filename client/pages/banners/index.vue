<script setup>
const toast = useToast();

let banners = ref([]);
let isOpen = ref(false);
let isLoading = ref(true);
let photo_url = ref(null);
let brands = ref([]);
let brand = ref("");
let text_uz = ref("");
let text_ru = ref("");
let text_en = ref("");
let discount = ref(0);
let bannerColor = ref("#000000");
let discountColor = ref("#000000");
let discountAmountColor = ref("#000000");
onMounted(async () => {
  try {
    const data = await $fetch(BASE_URL + "/banners", {
      method: "GET",
    });
    banners.value = data.data;
    const res = await $fetch(BASE_URL + "/brands", {
      method: "GET",
    });
    brands.value = res.data;
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
  try {
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
function handleFileChange(event) {
  if (event.target.files.length > 0) {
    photo_url.value = event.target.files[0];
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
        brand: brand.value,
        title_uz: text_uz.value,
        title_ru: text_ru.value,
        title_en: text_en.value,
        discount: discount.value,
        background_color: bannerColor.value,
        sub_background_color: discountColor.value,
        discount_background_color: discountAmountColor.value,
      }),
    });
    isOpen.value = false;
    toast.add({ title: fetchBanner.message });
    const res = await $fetch(BASE_URL + "/banners", {
      method: "GET",
    });
    photo_url.value = null;
    brand.value = "";
    text_uz.value = "";
    text_ru.value = "";
    text_en.value = "";
    discount.value = 0;
    bannerColor.value = "#000000";
    discountColor.value = "#000000";
    discountAmountColor.value = "#000000";
    banners.value = res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
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
    <div
      class="shadow-2xl border border-gray-300 dark:border-gray-500 items-center my-4"
    >
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
        <div
          class="rounded-[20px] p-[12px] flex justify-between items-center"
          :style="`background-color: ${row.background_color}`"
        >
          <div class="card-left">
            <p class="text-[25px] font-semibold leading-[32px] text-white">
              {{ row.title_uz }}
            </p>
            <p
              :style="`background-color: ${row.sub_background_color}`"
              class="text-white text-[25px] p-[8px] rounded-[100px] leading-[25px] font-semibold inline-block z-[2] relative"
            >
              chegirma
            </p>
            <div class="flex items-center">
              <div
                class="bg-white w-[40px] h-[32px] rounded-[9px] flex justify-center items-center mt-[4px]"
              >
                <img :src="row.brand.photo_url" alt="" />
              </div>
              <div
                :style="`background-color: ${row.discount_background_color}`"
                class="text-[25px] text-white font-semibold p-[12px] rounded-full ml-[60px] -mt-[10px] z-[1]"
              >
                10%
              </div>
            </div>
          </div>
          <div class="card-right">
            <img :src="row.photo_url" alt="img" class="" />
          </div>
        </div>
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
          <UFormGroup
            class="my-[2%]"
            label="Banner Uchun Brend Tanglang"
            name="photo"
            size="lg"
          >
            <USelect
              :options="brands"
              size="lg"
              v-model="brand"
              option-attribute="name"
              value-attribute="_id"
            />
          </UFormGroup>

          <UFormGroup
            class="my-[2%]"
            label="Banner Uchun Tekst Yozin (O'zbek tilida)"
            name="text"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="text_uz" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Banner Uchun Tekst Yozin (Rus tilida)"
            name="text"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="text_ru" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Banner Uchun Tekst Yozin (Ingliz tilida)"
            name="text"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="text_en" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Banner Uchun Chegirma Miqdorini Yozin"
            name="photo"
            size="lg"
          >
            <UInput type="text" size="lg" v-model="discount" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Banner Uchun Rang Tanglang"
            name="photo"
            size="lg"
          >
            <UInput type="color" size="lg" v-model="bannerColor" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Chegirma Uchun Rang Tanglang"
            name="photo"
            size="lg"
          >
            <UInput type="color" size="lg" v-model="discountColor" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Chegirma Miqdori Uchun Rang Tanglang"
            name="photo"
            size="lg"
          >
            <UInput type="color" size="lg" v-model="discountAmountColor" />
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