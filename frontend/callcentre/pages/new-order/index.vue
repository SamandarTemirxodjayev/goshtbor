<template>
  <div>
    <UForm @submit="handleSubmit" class="mb-4">
      <div class="w-[70%] flex justify-between">
        <UInput
          icon="i-heroicons-magnifying-glass-20-solid"
          size="lg"
          class="w-[90%] mr-2"
          color="white"
          :trailing="false"
          v-model="pageData.searchData"
          placeholder="Mahsulot ID yoki Nomini Kiriting..."
        />
        <UButton size="lg" type="submit" @click="handleSubmit"
          >Qidirish</UButton
        >
        <UButton
          v-if="totalSummary > 0"
          size="lg"
          type="submit"
          class="ml-2"
          @click="handleSubmit"
          ><ULink to="/new-order/confirm" active-class="text-primary">
            Savatga O'tish ( {{ numberFormat(totalSummary) }} )
          </ULink></UButton
        >
      </div>
    </UForm>
    <UAccordion
      color="primary"
      variant="soft"
      size="lg"
      :items="formattedMessages"
    >
      <template #item="{ item }">
        <div class="text-center flex my-2">
          <UDivider><span>Nomi: </span></UDivider>
          <UDivider
            ><span
              ><b>{{ item.content.name_uz }}</b></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-2">
          <UDivider><span>Brend: </span></UDivider>
          <UDivider
            ><span
              ><b>{{ item.content.brand.name }}</b></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-2">
          <UDivider><span>Og'irligi: </span></UDivider>
          <UDivider
            ><span
              ><b>{{ item.content.weight }} g</b></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-2">
          <UDivider><span>Kategoriya: </span></UDivider>
          <UDivider
            ><span
              ><b>{{ item.content.category.name_uz }} </b></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-2">
          <UDivider><span>Narxi: </span></UDivider>
          <UDivider
            ><span
              ><b
                >{{
                  item.content.sale.isSale
                    ? numberFormat(item.content.sale.price)
                    : numberFormat(item.content.price)
                }}
                so'm
              </b></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-2 justify-center items-center">
          <UDivider>
            <span>Qo'shish: </span>
          </UDivider>
          <UDivider>
            <div
              v-if="counterStore.get().some((p) => p._id == item.content._id)"
              class="flex items-center"
            >
              <span>
                <b>
                  <UButton
                    size="lg"
                    @click="counterStore.deleteProduct(item.content)"
                    >-</UButton
                  >
                  <span class="mx-3">
                    {{
                      counterStore.get().find((p) => p._id == item.content._id)
                        .quantity
                    }}
                  </span>

                  <UButton size="lg" @click="counterStore.add(item.content)"
                    >+</UButton
                  >
                </b>
              </span>
            </div>
            <div v-else class="flex items-center">
              <UButton size="lg" @click="counterStore.add(item.content)"
                >Savatga Qo'shish</UButton
              >
            </div>
          </UDivider>
        </div>
      </template>
    </UAccordion>
  </div>
</template>
<script setup>
import { useCounterStore } from "~/store";

const counterStore = useCounterStore();

const pageData = reactive({
  products: [],
  searchData: "",
});
onMounted(async () => {
  try {
    const resData = await $fetch(`${BASE_URL}/products`, {
      method: "GET",
    });
    pageData.products = resData.data;
  } catch (error) {
    console.log(error);
  }
});

const handleSubmit = async () => {
  try {
    const resData = await $fetch(`${BASE_URL}/helper/products/find`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
      body: JSON.stringify({
        data: pageData.searchData,
      }),
    });
    pageData.products = resData.data;
  } catch (error) {
    console.log(error);
  }
};
const formattedMessages = computed(() => {
  return pageData.products.map((order) => {
    return {
      label: order.name_uz,
      content: order,
    };
  });
});
const totalSummary = computed(() => {
  return counterStore.get().reduce((total, item) => {
    return total + item.quantity;
  }, 0);
});
</script>