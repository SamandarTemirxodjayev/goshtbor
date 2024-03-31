<script setup>
const toast = useToast();

let products = ref([]);
let brands = ref([]);
let categories = ref(null);
let isOpen = ref(false);
let isLoading = ref(true);
let photo_url1 = ref(null);
let photo_url2 = ref(null);
let photo_url3 = ref(null);
let isEditOpen = ref(false);
let productId = ref(null);
let product = reactive({
  name_uz: "",
  name_ru: "",
  name_en: "",
  description_uz: "",
  description_ru: "",
  description_en: "",
  weight: 0,
  sale: {
    isSale: false,
    price: 0,
    discount: 0,
  },
  photo_urls: [],
  price: 0,
  category: null,
  brand: null,
});

onMounted(async () => {
  try {
    let data = await $fetch(BASE_URL + "/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    products.value = data.data;
    data = await $fetch(BASE_URL + "/category", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    categories.value = data.data;
    data = await $fetch(BASE_URL + "/brands", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    brands.value = data.data;
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
    key: "name_uz",
    label: "Nomi",
  },
  {
    key: "photo_urls",
    label: "Rasm",
  },
  {
    key: "description_uz",
    label: "Tavsifi",
  },
  {
    key: "weight",
    label: "O'girligi",
  },
  {
    key: "sale",
    label: "Skidka",
  },
  {
    key: "price",
    label: "Narxi",
  },
  {
    key: "category",
    label: "Kategoriyasi",
  },
  {
    key: "brand",
    label: "Brend",
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
      click: () => deleteProduct(row._id),
    },
    {
      label: "Tahrirlash",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => editProduct(row),
    },
  ],
];
const editProduct = (row) => {
  productId.value = row._id;
  product.name_uz = row.name_uz;
  product.name_ru = row.name_ru;
  product.name_en = row.name_en;
  product.description_uz = row.description_uz;
  product.description_ru = row.description_ru;
  product.description_en = row.description_en;
  product.weight = row.weight;
  product.sale.isSale = row.sale.isSale;
  product.sale.price = row.sale.price;
  product.sale.discount = row.sale.discount;
  product.price = row.price;
  product.category = row.category._id;
  product.brand = row.brand._id;
  isEditOpen.value = true;
};
function handleFileChange1(event) {
  if (event.target.files.length > 0) {
    photo_url1.value = event.target.files[0];
  }
}
function handleFileChange2(event) {
  if (event.target.files.length > 0) {
    photo_url2.value = event.target.files[0];
  }
}
function handleFileChange3(event) {
  if (event.target.files.length > 0) {
    photo_url3.value = event.target.files[0];
  }
}
const addProduct = async () => {
  isLoading.value = true;
  if (
    product.name_en.length == 0 ||
    product.name_ru.length == 0 ||
    product.name_uz.length == 0
  ) {
    toast.add({ title: "Mahsulot Nomini Kiriting" });
    isLoading.value = false;
    return;
  }
  if (
    product.description_uz.length == 0 ||
    product.description_ru.length == 0 ||
    product.description_en.length == 0
  ) {
    toast.add({ title: "Mahsulot Tavsiyini Kiriting" });
    isLoading.value = false;
    return;
  }
  if (product.weight <= 0) {
    toast.add({ title: "Mahsulot O'girlini Kiriting" });
    isLoading.value = false;
    return;
  }
  if (
    product.sale.isSale &&
    (product.sale.discount <= 0 || product.sale.price <= 0)
  ) {
    toast.add({ title: "Mahsulot Chegirmalarini To'g'ri Kiriting" });
    isLoading.value = false;
    return;
  }
  if (product.price <= 0) {
    toast.add({ title: "Mahsulot Narxini Kiriting" });
    isLoading.value = false;
    return;
  }
  if (product.category == null) {
    toast.add({ title: "Mahsulot Kategorini Tanlang" });
    isLoading.value = false;
    return;
  }
  if (product.brand == null) {
    toast.add({ title: "Mahsulot Brandini Tanlang" });
    isLoading.value = false;
    return;
  }
  if (photo_url1.value == null || photo_url2.value == null) {
    toast.add({
      title: "Rasmlarni Yuklang",
    });
    isLoading.value = false;
    products.photo_urls = [];
    return;
  }
  try {
    let formdata = new FormData();
    formdata.append("file", photo_url1.value);
    let data = await $fetch(CDN_URL + "/upload", {
      method: "POST",
      body: formdata,
    });
    product.photo_urls.push(data.data.fileUrl);

    formdata = new FormData();
    formdata.append("file", photo_url2.value);
    data = await $fetch(CDN_URL + "/upload", {
      method: "POST",
      body: formdata,
    });
    product.photo_urls.push(data.data.fileUrl);
    if (photo_url3.value) {
      formdata = new FormData();
      formdata.append("file", photo_url3.value);
      data = await $fetch(CDN_URL + "/upload", {
        method: "POST",
        body: formdata,
      });
      product.photo_urls.push(data.data.fileUrl);
    }
    await $fetch(BASE_URL + "/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(product),
    });
    toast.add({ title: "Mahsulot Qo'shildi" });
    data = await $fetch(BASE_URL + "/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    products.value = data.data;
    product = {
      name_uz: "",
      name_ru: "",
      name_en: "",
      description_uz: "",
      description_ru: "",
      description_en: "",
      weight: 0,
      sale: {
        isSale: false,
        price: 0,
        discount: 0,
      },
      photo_urls: [],
      price: 0,
      category: null,
      brand: null,
    };
    photo_url1.value = null;
    photo_url2.value = null;
    photo_url3.value = null;
    isOpen.value = false;
  } catch (error) {
    products.photo_urls = [];

    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
    return;
  }
  isLoading.value = false;
};
const deleteProduct = async (id) => {
  isLoading.value = true;
  try {
    await $fetch(BASE_URL + "/products/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    let data = await $fetch(BASE_URL + "/products", {
      method: "GET",
    });
    products.value = data.data;
  } catch (error) {
    return console.log(error);
  }
  isLoading.value = false;
};
const isEditOpenClose = () => {
  isEditOpen.value = !isEditOpen.value;
  product = {
    name_uz: "",
    name_ru: "",
    name_en: "",
    description_uz: "",
    description_ru: "",
    description_en: "",
    weight: 0,
    sale: {
      isSale: false,
      price: 0,
      discount: 0,
    },
    photo_urls: [],
    price: 0,
    category: null,
    brand: null,
  };
};
const editProductHandler = async () => {
  isLoading.value = true;
  if (
    product.name_en.length == 0 ||
    product.name_ru.length == 0 ||
    product.name_uz.length == 0
  ) {
    toast.add({ title: "Mahsulot Nomini Kiriting" });
    isLoading.value = false;
    return;
  }
  if (
    product.description_uz.length == 0 ||
    product.description_ru.length == 0 ||
    product.description_en.length == 0
  ) {
    toast.add({ title: "Mahsulot Tavsiyini Kiriting" });
    isLoading.value = false;
    return;
  }
  if (product.weight <= 0) {
    toast.add({ title: "Mahsulot O'girlini Kiriting" });
    isLoading.value = false;
    return;
  }
  if (
    product.sale.isSale &&
    (product.sale.discount <= 0 || product.sale.price <= 0)
  ) {
    toast.add({ title: "Mahsulot Chegirmalarini To'g'ri Kiriting" });
    isLoading.value = false;
    return;
  }
  if (product.price <= 0) {
    toast.add({ title: "Mahsulot Narxini Kiriting" });
    isLoading.value = false;
    return;
  }
  if (product.category == null) {
    toast.add({ title: "Mahsulot Kategorini Tanlang" });
    isLoading.value = false;
    return;
  }
  if (product.brand == null) {
    toast.add({ title: "Mahsulot Brandini Tanlang" });
    isLoading.value = false;
    return;
  }
  try {
    await $fetch(BASE_URL + "/products/" + productId.value, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name_uz: product.name_uz,
        name_ru: product.name_ru,
        name_en: product.name_en,
        description_uz: product.description_uz,
        description_ru: product.description_ru,
        description_en: product.description_en,
        weight: product.weight,
        sale: {
          isSale: product.sale.isSale,
          price: product.sale.price,
          discount: product.sale.discount,
        },
        price: product.price,
        category: product.category,
        brand: product.brand,
      }),
    });
    let data = await $fetch(BASE_URL + "/products", {
      method: "GET",
    });
    toast.add({ title: "Mahsulot Yangilandi" });
    products.value = data.data;
    isEditOpen.value = false;
  } catch (error) {
    return console.log(error);
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
defineShortcuts({
  escape: {
    usingInput: true,
    whenever: [isEditOpen],
    handler: () => {
      isEditOpen.value = false;
      product = {
        name_uz: "",
        name_ru: "",
        name_en: "",
        description_uz: "",
        description_ru: "",
        description_en: "",
        weight: 0,
        sale: {
          isSale: false,
          price: 0,
          discount: 0,
        },
        photo_urls: [],
        price: 0,
        category: null,
        brand: null,
      };
    },
  },
});
</script>

<template>
  <div>
    <div class="text-2xl font-bold">Mahsulotlar</div>
    <div
      class="shadow-2xl border border-gray-300 dark:border-gray-500 items-center my-4"
    >
      <div class="flex p-4 justify-end">
        <UButton state size="lg" @click="() => (isOpen = true)"
          >Mahsulot Qo'shish</UButton
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
      :rows="products"
      :empty-state="{
        icon: 'i-heroicons-circle-stack-20-solid',
        label: 'Brendlar Mavjud Emas',
      }"
    >
      <template #photo_urls-data="{ row }">
        <img :src="row.photo_urls[0]" alt="" />
      </template>
      <template #weight-data="{ row }">
        {{ numberFormat(row.weight) }} g
      </template>
      <template #sale-data="{ row }">
        {{
          row.sale.isSale
            ? `Skidka: ${row.sale.discount}%, Narxi: ${numberFormat(
                row.sale.price
              )} so'm`
            : "Mavjud Emas"
        }}
      </template>
      <template #price-data="{ row }">
        {{ numberFormat(row.price) }} so'm
      </template>
      <template #category-data="{ row }">
        {{ row.category.name_uz }}
      </template>
      <template #brand-data="{ row }">
        {{ row.brand.name }}
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
          <UButton
            state
            label="Mahsulot Qo'shish"
            @click="() => (isOpen = true)"
          />
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
              Mahsulot Qo'shish
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="() => (isOpen = false)"
            />
          </div>
        </template>

        <UForm @submit="addProduct">
          <UFormGroup
            error
            class="my-[2%]"
            label="Mahsulot Nomi(O'zbek tilida)"
            name="photo"
            size="lg"
            required
          >
            <UInput type="text" size="lg" v-model="product.name_uz" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Nomi(Rus tilida)"
            name="photo"
            size="lg"
            required
          >
            <UInput type="text" size="lg" v-model="product.name_ru" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Nomi(Ingliz tilida)"
            name="photo"
            size="lg"
            required
          >
            <UInput type="text" size="lg" v-model="product.name_en" />
          </UFormGroup>
          <UFormGroup class="my-[2%]" label="Mahsulot Rasmi" size="lg" required>
            <input
              type="file"
              class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 file:cursor-pointer file:rounded-l-md file:absolute file:left-0 file:inset-y-0 file:font-medium file:m-0 file:border-0 file:ring-1 file:ring-gray-300 dark:file:ring-gray-700 file:text-gray-900 dark:file:text-white file:bg-gray-50 hover:file:bg-gray-100 dark:file:bg-gray-800 dark:hover:file:bg-gray-700/50 ps-[100px] text-sm px-3.5 py-2.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              @change="handleFileChange1"
            />
          </UFormGroup>
          <UFormGroup class="my-[2%]" label="Mahsulot Rasmi" size="lg" required>
            <input
              type="file"
              class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 file:cursor-pointer file:rounded-l-md file:absolute file:left-0 file:inset-y-0 file:font-medium file:m-0 file:border-0 file:ring-1 file:ring-gray-300 dark:file:ring-gray-700 file:text-gray-900 dark:file:text-white file:bg-gray-50 hover:file:bg-gray-100 dark:file:bg-gray-800 dark:hover:file:bg-gray-700/50 ps-[100px] text-sm px-3.5 py-2.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              @change="handleFileChange2"
            />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Rasmi"
            name="photo"
            size="lg"
          >
            <UInput type="file" size="lg" @change="handleFileChange3" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Haqida(O'zbek tilida)"
            name="photo"
            size="lg"
            required
          >
            <UTextarea type="text" size="lg" v-model="product.description_uz" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Haqida(Rus tilida)"
            name="photo"
            size="lg"
            required
          >
            <UTextarea type="text" size="lg" v-model="product.description_ru" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Haqida(Ingliz tilida)"
            name="photo"
            size="lg"
            required
          >
            <UTextarea type="text" size="lg" v-model="product.description_en" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Og'irligi(grammda)"
            name="photo"
            size="lg"
            required
          >
            <UInput type="number" size="lg" v-model="product.weight" />
          </UFormGroup>
          <UFormGroup class="my-[2%]" label="Skidka" name="photo" size="lg">
            <UToggle
              on-icon="i-heroicons-check-20-solid"
              off-icon="i-heroicons-x-mark-20-solid"
              v-model="product.sale.isSale"
              size="xl"
            />
          </UFormGroup>
          <UFormGroup
            v-if="product.sale.isSale"
            class="my-[2%]"
            label="Skidka miqdori(%)"
            name="photo"
            size="lg"
            :required="product.sale.isSale"
          >
            <UInput type="number" size="lg" v-model="product.sale.discount" />
          </UFormGroup>
          <UFormGroup
            v-if="product.sale.isSale"
            class="my-[2%]"
            label="Skidka Narxi"
            name="photo"
            size="lg"
            :required="product.sale.isSale"
          >
            <UInput type="number" size="lg" v-model="product.sale.price" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Narxi(Skidkasiz)"
            name="photo"
            size="lg"
            required
          >
            <UInput type="text" size="lg" v-model="product.price" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Kategoriyasi"
            name="photo"
            size="lg"
            required
          >
            <USelect
              :options="categories"
              size="lg"
              v-model="product.category"
              option-attribute="name_uz"
              value-attribute="_id"
            />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Brendi"
            name="photo"
            size="lg"
            required
          >
            <USelect
              :options="brands"
              size="lg"
              v-model="product.brand"
              option-attribute="name"
              value-attribute="_id"
            />
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
              Mahsulotni Tahrirlash
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isEditOpenClose"
            />
          </div>
        </template>

        <UForm @submit="editProductHandler">
          <UFormGroup
            error
            class="my-[2%]"
            label="Mahsulot Nomi(O'zbek tilida)"
            name="photo"
            size="lg"
            required
          >
            <UInput type="text" size="lg" v-model="product.name_uz" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Nomi(Rus tilida)"
            name="photo"
            size="lg"
            required
          >
            <UInput type="text" size="lg" v-model="product.name_ru" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Nomi(Ingliz tilida)"
            name="photo"
            size="lg"
            required
          >
            <UInput type="text" size="lg" v-model="product.name_en" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Haqida(O'zbek tilida)"
            name="photo"
            size="lg"
            required
          >
            <UTextarea type="text" size="lg" v-model="product.description_uz" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Haqida(Rus tilida)"
            name="photo"
            size="lg"
            required
          >
            <UTextarea type="text" size="lg" v-model="product.description_ru" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Haqida(Ingliz tilida)"
            name="photo"
            size="lg"
            required
          >
            <UTextarea type="text" size="lg" v-model="product.description_en" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Og'irligi(grammda)"
            name="photo"
            size="lg"
            required
          >
            <UInput type="number" size="lg" v-model="product.weight" />
          </UFormGroup>
          <UFormGroup class="my-[2%]" label="Skidka" name="photo" size="lg">
            <UToggle
              on-icon="i-heroicons-check-20-solid"
              off-icon="i-heroicons-x-mark-20-solid"
              v-model="product.sale.isSale"
              size="xl"
            />
          </UFormGroup>
          <UFormGroup
            v-if="product.sale.isSale"
            class="my-[2%]"
            label="Skidka miqdori(%)"
            name="photo"
            size="lg"
            :required="product.sale.isSale"
          >
            <UInput type="number" size="lg" v-model="product.sale.discount" />
          </UFormGroup>
          <UFormGroup
            v-if="product.sale.isSale"
            class="my-[2%]"
            label="Skidka Narxi"
            name="photo"
            size="lg"
            :required="product.sale.isSale"
          >
            <UInput type="number" size="lg" v-model="product.sale.price" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Narxi(Skidkasiz)"
            name="photo"
            size="lg"
            required
          >
            <UInput type="text" size="lg" v-model="product.price" />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Kategoriyasi"
            name="photo"
            size="lg"
            required
          >
            <USelect
              :options="categories"
              size="lg"
              v-model="product.category"
              option-attribute="name_uz"
              value-attribute="_id"
            />
          </UFormGroup>
          <UFormGroup
            class="my-[2%]"
            label="Mahsulot Brendi"
            name="photo"
            size="lg"
            required
          >
            <USelect
              :options="brands"
              size="lg"
              v-model="product.brand"
              option-attribute="name"
              value-attribute="_id"
            />
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