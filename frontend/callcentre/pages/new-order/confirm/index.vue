<template>
  <div v-if="!pageData.loading">
    <NuxtLink to="/new-order">
      <UButton label="Button" size="lg">
        <div class="flex gap-x-2 text-center items-center">
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          <span>Ortga</span>
        </div>
      </UButton>
    </NuxtLink>
    <UTable :columns="columns" :rows="rowsWithSummary">
      <template #price-data="{ row }">
        {{
          row.sale && row.sale.isSale
            ? numberFormat(row.sale.price)
            : numberFormat(row.price)
        }}
        so'm
        <span v-if="row.name_uz != 'Jami'">
          ({{
            row.sale && row.sale.isSale
              ? numberFormat(row.sale.price * row.quantity)
              : numberFormat(row.price * row.quantity)
          }}
          so'm)
        </span>
      </template>
      <template #quantity-data="{ row }">
        <div v-if="row.name_uz != 'Jami'">
          <div
            v-if="counterStore.get().some((p) => p._id == row._id)"
            class="flex items-center"
          >
            <span>
              <b>
                <UButton size="xl" class="mx-3">
                  <UIcon
                    name="i-heroicons-trash"
                    @click="counterStore.productDelete(row)"
                  />
                </UButton>
                <UButton size="lg" @click="counterStore.deleteProduct(row)"
                  >-</UButton
                >
                <span class="mx-3">
                  {{
                    counterStore.get().find((p) => p._id == row._id).quantity
                  }}
                </span>

                <UButton size="lg" @click="counterStore.add(row)">+</UButton>
              </b>
            </span>
          </div>
          <div v-else class="flex items-center">
            <UButton size="lg" @click="counterStore.add(row)"
              >Savatga Qo'shish</UButton
            >
          </div>
        </div>
      </template>
    </UTable>
    <UForm class="max-w-[40%]" @submit="handleSubmitOrder">
      <UFormGroup label="Foydalanuvchi Telefon Raqami" required>
        <UInput
          size="lg"
          type="number"
          placeholder="998999999999"
          v-model="pageData.order.phone_number"
        />
      </UFormGroup>
      <UFormGroup label="Foydalanuvchi Ismi" required class="my-4">
        <UInput size="lg" placeholder="Eshmat" v-model="pageData.order.name" />
      </UFormGroup>
      <UFormGroup label="Foydalanuvchi Familiyasi" required class="mb-4">
        <UInput
          size="lg"
          placeholder="Toshmatov"
          v-model="pageData.order.surname"
        />
      </UFormGroup>
      <div class="flex gap-x-2">
        <UFormGroup label="Yetkazilish Sanasi(dan)" required class="mb-4">
          <VueDatePicker
            v-model="pageData.order.delivery.date.from"
            :min-date="new Date()"
            :max-date="new Date().setDate(new Date().getDate() + 2)"
            time-picker-inline
          />
        </UFormGroup>
        <UFormGroup label="Yetkazilish Sanasi(gacha)" required class="mb-4">
          <VueDatePicker
            v-model="pageData.order.delivery.date.to"
            :min-date="pageData.order.delivery.date.from"
            :max-date="new Date().setDate(new Date().getDate() + 2)"
            time-picker-inline
          />
        </UFormGroup>
      </div>
      <UFormGroup
        label="Foydalanuvchi Yetkaziladigan Manzili"
        required
        class="mb-4"
      >
        <UInput
          size="lg"
          placeholder="Arnasoy ko'chasi 22"
          v-model="pageData.order.delivery.address.name"
        />
      </UFormGroup>
      <UFormGroup label="Kommentariya" required>
        <UInput
          size="lg"
          placeholder="Srochniy ..."
          v-model="pageData.order.delivery.comment"
        />
      </UFormGroup>
      <UButton size="lg" block class="my-4" type="submit"> Tasdiqlash </UButton>
    </UForm>
  </div>
  <div v-else>
    <Loader />
  </div>
</template>
<script setup>
import { useCounterStore } from "~/store";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const pageData = reactive({
  loading: true,
  buttonLoading: true,
  order: {
    phone_number: "",
    name: "",
    surname: "",
    delivery: {
      date: {
        from: "",
        to: "",
      },
      address: {
        name: "",
      },
      comment: "",
    },
  },
});

onMounted(() => {
  pageData.loading = false;
});

const counterStore = useCounterStore();
const columns = ref([
  {
    key: "name_uz",
    label: "Nomi",
  },
  {
    key: "brand.name",
    label: "Brend",
  },
  {
    key: "category.name_uz",
    label: "Kategoriya",
  },
  {
    key: "price",
    label: "Narxi",
  },
  {
    key: "quantity",
    label: "Soni",
  },
]);

const rows = computed(() => counterStore.get());

const rowsWithSummary = computed(() => {
  const rowsData = rows.value;
  const totalPrice = rowsData.reduce(
    (sum, row) =>
      sum +
      ((row.sale.isSale ? row.sale.price : row.price) * row.quantity || 0),
    0
  );
  const summaryRow = {
    name_uz: "Jami",
    brand: { name: "" },
    category: { name_uz: "" },
    price: totalPrice,
    quantity: "",
  };
  return [...rowsData, summaryRow];
});
const handleSubmitOrder = async () => {
  pageData.buttonLoading = true;
  try {
    await $fetch(BASE_URL + "/preorders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
      body: JSON.stringify({
        ...pageData.order,
        products: counterStore.get(),
      }),
    });
    await Swal.fire("Yaratildi", "Muvaffiqatli Yaratildi", "success");
    pageData.order = {
      phone_number: "",
      name: "",
      surname: "",
      delivery: {
        date: {
          from: "",
          to: "",
        },
        address: {
          name: "",
        },
        comment: "",
      },
    };
    navigateTo("/new-order");
    counterStore.resetAll();
  } catch (error) {
    console.log(error);
  }
  pageData.buttonLoading = false;
};
</script>