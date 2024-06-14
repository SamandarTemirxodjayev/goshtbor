<template>
  <div v-if="!pageData.loading">
    <div class="justify-end flex">
      <UButton size="lg" @click="pageData.modal = true">
        Partiya Qo'shish
      </UButton>
    </div>
    <UTable :columns="columns" :rows="batches">
      <template #date.created_date-data="{ row }">
        {{ dateFormat(row.date.created_date) }}
      </template>
      <template #date.finished_date-data="{ row }">
        {{ row.date.finished_date ? dateFormat(row.date.finished_date) : "" }}
      </template>
      <template #products-data="{ row }">
        {{ row.products.length }}
      </template>
      <template #status-data="{ row }">
        {{ row.status == 1 ? "Yuborilgan" : "Tasdiqlangan" }}
      </template>
    </UTable>
    <UModal v-model="pageData.modal" prevent-close fullscreen>
      <UCard :ui="{ ring: '' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              Partiya Qo'shish
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="pageData.modal = false"
            />
          </div>
        </template>

        <UForm @submit="handleAddBatch" class="grid grid-cols-2 gap-8">
          <div>
            <UFormGroup label="Mahsulotni Tanglang" required>
              <USelectMenu
                searchable
                searchable-placeholder="Mahsulotni Qidirish..."
                class="w-full"
                size="xl"
                placeholder="Mahsulotni tanlang"
                :options="availableProducts"
                optionAttribute="name_uz"
                valueAttribute="_id"
                v-model="pageData.added_product._id"
              />
            </UFormGroup>

            <UFormGroup label="Mahsulotni Narxi" class="my-4" required>
              <VueNumber
                v-model="pageData.added_product.amount"
                v-bind="pageData.numberInput"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </UFormGroup>

            <UFormGroup label="Mahsulotni Soni" required>
              <UInput size="xl" v-model="pageData.added_product.quantity" />
            </UFormGroup>
            <UButton color="green" @click="addProduct" class="mt-4" size="xl">
              Mahsulot Qo'shish
            </UButton>
          </div>

          <div>
            <UFormGroup label="Naklodnoy Id" class="mb-4" required>
              <UInput size="xl" v-model="pageData.batch.batchId" required />
            </UFormGroup>

            <UFormGroup label="Yuboruvchi" class="mb-4" required>
              <UInput size="xl" v-model="pageData.batch.sender" required />
            </UFormGroup>
          </div>

          <div class="col-span-2">
            <UButton size="xl" type="submit" block> Tasdiqlash </UButton>
          </div>
        </UForm>

        <UDivider class="my-4" />
        <div class="flex gap-x-2">
          <div v-if="pageData.active_category == 'all'">
            <UBadge size="lg" class="cursor-pointer">Hammasi</UBadge>
          </div>
          <UBadge
            v-else
            @click="handleChangecategory('all')"
            size="lg"
            color="gray"
            variant="solid"
            class="cursor-pointer"
          >
            Hammasi
          </UBadge>
          <div v-for="category in categories" :key="category._id">
            <div v-if="pageData.active_category == category._id">
              <UBadge size="lg" class="cursor-pointer">{{
                category.name_uz
              }}</UBadge>
            </div>
            <UBadge
              v-else
              @click="handleChangecategory(category._id)"
              size="lg"
              color="gray"
              variant="solid"
              class="cursor-pointer"
            >
              {{ category.name_uz }}
            </UBadge>
          </div>
        </div>
        <UTable :columns="products_column" :rows="filteredProducts">
          <template #amount-data="{ row }">
            {{ numberFormat(row.amount) }} so'm
          </template>
          <template #_id-data="{ row }">
            <UButton color="red" @click="removeProduct(row._id)"
              >O'chirish</UButton
            >
          </template>
        </UTable>
      </UCard>
    </UModal>
  </div>
  <div v-else>
    <Loader />
  </div>
</template>
<script setup>
import { component as VueNumber } from "@coders-tm/vue-number-format";
const pageData = reactive({
  loading: true,
  buttonLoading: false,
  modal: false,
  batch: {
    products: [],
    batchId: "",
    sender: "",
  },
  added_product: {
    _id: "",
    amount: "",
    quantity: "",
  },
  active_category: "all",
  numberInput: {
    decimal: ".",
    separator: " ",
    suffix: " so'm",
    precision: 2,
    masked: false,
    min: 0,
  },
});
const batches = ref([]);
const products = ref([]);
const categories = ref([]);

const columns = ref([
  {
    key: "batch_id",
    label: "ID",
  },
  {
    key: "batchId",
    label: "Nakloynoy",
  },
  {
    key: "sender",
    label: "Yuboruvchi",
  },
  {
    key: "date.created_date",
    label: "Yaratilgan vaqti",
  },
  {
    key: "date.finished_date",
    label: "Tasdqilangan Vaqti",
  },
  {
    key: "products",
    label: "Mahsulot Soni",
  },
  {
    key: "status",
    label: "Status",
  },
]);
const products_column = ref([
  {
    key: "name",
    label: "Nomi",
  },
  {
    key: "brand.name",
    label: "Brend",
  },
  {
    key: "amount",
    label: "Narxi",
  },
  {
    key: "quantity",
    label: "Soni",
  },
  {
    key: "_id",
    label: "Batafsil",
  },
]);

const selectedProductIds = computed(() =>
  pageData.batch.products.map((product) => product._id)
);

const availableProducts = computed(() => {
  return products.value
    .filter((product) => !selectedProductIds.value.includes(product._id))
    .map((product) => ({
      ...product,
      name_uz: `${product.name_uz} (${product.brand.name})`,
    }));
});
const filteredProducts = computed(() => {
  if (pageData.active_category === "all") {
    return pageData.batch.products;
  }
  return pageData.batch.products.filter(
    (product) => product.category === pageData.active_category
  );
});

const addProduct = () => {
  const selectedProduct = products.value.find(
    (product) => product._id === pageData.added_product._id
  );
  pageData.batch.products.push({
    category: selectedProduct.category._id,
    name: selectedProduct.name_uz,
    brand: selectedProduct.brand,
    _id: pageData.added_product._id,
    amount: pageData.added_product.amount,
    quantity: pageData.added_product.quantity,
  });
  pageData.added_product._id = null;
  pageData.added_product.amount = null;
  pageData.added_product.quantity = null;
};

const removeProduct = (productId) => {
  pageData.batch.products = pageData.batch.products.filter(
    (product) => product._id !== productId
  );
};

const handleAddBatch = async () => {
  pageData.loading = true;
  try {
    await $fetch(`${BASE_URL}/collectors/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
      body: JSON.stringify(pageData.batch),
    });
    let resData = await $fetch(`${BASE_URL}/collectors/batch`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
    });
    batches.value = resData.data;
    pageData.batch = {
      products: [],
      batchId: "",
      sender: "",
    };
    pageData.modal = false;
  } catch (error) {
    console.error(error);
  }
  pageData.loading = false;
};

const handleChangecategory = async (id) => {
  pageData.active_category = id;
};

onMounted(async () => {
  try {
    let resData = await $fetch(`${BASE_URL}/collectors/batch`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
    });
    batches.value = resData.data;
    resData = await $fetch(`${BASE_URL}/products`, {
      method: "GET",
    });
    products.value = resData.data;
    resData = await $fetch(`${BASE_URL}/category`, {
      method: "GET",
    });
    categories.value = resData.data;
    pageData.loading = false;
  } catch (error) {
    console.error(error);
  }
});
</script>
