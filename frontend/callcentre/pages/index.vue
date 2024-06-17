<template>
  <div v-if="!pageData.loading">
    <UAccordion
      color="primary"
      variant="soft"
      size="lg"
      :items="formattedMessages"
    >
      <template #item="{ item }">
        <div class="text-center flex my-4">
          <UDivider><span>ID: </span></UDivider>
          <UDivider
            ><span
              ><b>{{ item.content.id }}</b></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-4">
          <UDivider><span>Holat: </span></UDivider>
          <UDivider
            ><span
              ><b>{{ statusFormat(item.content.status) }}</b></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-4">
          <UDivider><span>Foydalanuvchi Ismi va Familiyasi:</span></UDivider>
          <UDivider
            ><span
              ><b
                >{{ item.content.userId.name }}
                {{ item.content.userId.surname }}</b
              ></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-4">
          <UDivider><span>Foydalanuvchi Telefon Raqami:</span></UDivider>
          <UDivider
            ><span
              ><b>+{{ item.content.phone.number }}</b></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-4">
          <UDivider><span>To'lov Turi:</span></UDivider>
          <UDivider
            ><span
              ><b>{{ item.content.pay.type }}</b></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-4">
          <UDivider><span>To'lov Summasi:</span></UDivider>
          <UDivider
            ><span
              ><b
                >{{
                  numberFormat(
                    item.content.pay[item.content.pay.type].total_amount
                  )
                }}
                so'm</b
              ></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-4">
          <UDivider><span>Qo'shimcha Ma'lumot:</span></UDivider>
          <UDivider
            ><span
              ><b>{{ item.content.comment }}</b></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-4">
          <UDivider><span>Yetkazilish Vaqti:</span></UDivider>
          <UDivider
            ><span
              ><b
                >{{ dateFormat(item.content.delivery.date.from) }} -
                {{ dateFormat(item.content.delivery.date.to) }}</b
              ></span
            ></UDivider
          >
        </div>
        <div class="text-center flex my-4">
          <UDivider><span>Mahsulot Soni:</span></UDivider>
          <UDivider
            ><span
              ><b>{{ item.content.products.length }}</b></span
            ></UDivider
          >
        </div>

        <div class="text-center flex my-4">
          <UDivider><span>Buyurtma Haqida Batafsil:</span></UDivider>
          <UDivider
            ><UButton size="lg" @click="openModal(item.content)"
              >Batafsil</UButton
            ></UDivider
          >
        </div>
      </template>
    </UAccordion>
    <UModal v-model="pageData.modal" fullscreen>
      <UCard
        :ui="{
          base: 'h-full flex flex-col',
          rounded: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          body: {
            base: 'grow',
          },
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              Buyurtma ID: {{ pageData.order.id }}
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

        {{ pageData.order }}
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
  order: {},
  isPrint: true,
  audioRef: "",
});

const orders = ref([]);

const toast = useToast();

const fetchActiveOrders = async () => {
  try {
    const resData = await $fetch(`${BASE_URL}/helper/active-orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
    });
    orders.value = resData.data;
  } catch (error) {
    console.error(error);
  }
};

onMounted(async () => {
  try {
    const resData = await $fetch(`${BASE_URL}/helper/active-orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
    });

    orders.value = resData.data;

    const intervalId = setInterval(fetchActiveOrders, 60000);

    onUnmounted(() => {
      clearInterval(intervalId);
    });
  } catch (error) {
    console.error("Error during onMounted:", error);
    toast.add({ title: error.message || "An error occurred" });
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
  }
  pageData.loading = false;
});
const formattedMessages = computed(() => {
  return orders.value.map((order) => {
    const label =
      order.delivery && order.delivery.address
        ? order.delivery.address.name
        : "Unknown";
    return {
      label,
      content: order,
    };
  });
});
const openModal = async (order) => {
  try {
    pageData.modal = true;
    pageData.order = order;
  } catch (error) {
    console.log(error);
  }
};
</script>