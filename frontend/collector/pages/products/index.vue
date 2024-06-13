<template>
  <div v-if="!pageData.loading">
    <div class="justify-end flex">
      <UButton size="lg" @click="pageData.modal = true"
        >Partiya Qo'shish</UButton
      >
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
    <UModal v-model="pageData.modal" prevent-close>
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

        <UForm @submit="handleAddBatch">
          <UFormGroup label="Naklodnoy Id" class="mb-4" required>
            <UInput size="xl" v-model="pageData.batch.batchId" />
          </UFormGroup>
          <UFormGroup label="Yuboruvchi" class="mb-4" required>
            <UInput size="xl" v-model="pageData.batch.sender" />
          </UFormGroup>
          <UButton color="green" @click="addProduct" class="mb-4"
            >Mahsulot Qo'shish</UButton
          >

          <div
            v-for="(product, index) in pageData.batch.products"
            :key="index"
            class="mb-4"
          >
            <UFormGroup label="Mahsulotni Tanglang" required>
              <UButton color="red" class="my-2" @click="removeProduct(index)"
                ><Icon name="i-heroicons-minus-circle" />O'chirish</UButton
              >
              <USelectMenu
                searchable
                searchable-placeholder="Mahsulotni Qidirish..."
                class="w-full"
                size="xl"
                placeholder="Mahsulotni tanlang"
                :options="filteredProducts(index)"
                optionAttribute="name_uz"
                valueAttribute="_id"
                v-model="product._id"
              />
            </UFormGroup>
            <UFormGroup label="Mahsulotni Narxi" class="my-4" required>
              <UInput size="xl" v-model="product.amount" />
            </UFormGroup>
            <UFormGroup label="Mahsulotni Soni" required>
              <UInput size="xl" v-model="product.quantity" />
            </UFormGroup>
          </div>
          <UButton size="xl" type="submit" block>Tasdiqlash</UButton>
        </UForm>
      </UCard>
    </UModal>
  </div>
  <div v-else>
    <Loader />
  </div>
</template>

<script setup>
const pageData = reactive({
  loading: true,
  buttonLoading: false,
  modal: false,
  batch: {
    products: [],
    batchId: "",
    sender: "",
  },
});
const batches = ref([]);
const products = ref([]);

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

const selectedProductIds = computed(() =>
  pageData.batch.products.map((product) => product._id)
);

const filteredProducts = (index) => {
  return products.value.filter(
    (product) =>
      !selectedProductIds.value.includes(product._id) ||
      product._id === pageData.batch.products[index]._id
  );
};

const addProduct = () => {
  pageData.batch.products.push({
    _id: "",
    amount: 0,
    quantity: 0,
  });
};

const removeProduct = (index) => {
  pageData.batch.products.splice(index, 1);
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
    pageData.modal = false;
  } catch (error) {
    console.error(error);
  }
  pageData.loading = false;
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
    pageData.loading = false;
  } catch (error) {
    console.error(error);
  }
});
</script>
