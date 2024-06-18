<template>
  <div v-if="!pageData.loading">
    <div v-if="messages.length === 0">Buyurtmalar Mavjud Emas</div>
    <div v-else>
      <UAccordion
        color="primary"
        variant="soft"
        size="xl"
        :items="formattedMessages"
      >
        <template #item="{ item }">
          <div class="text-center flex my-4">
            <UDivider><span>ID: </span></UDivider>
            <UDivider
              ><span
                ><b>{{ item.content.order_id }}</b></span
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
              ><UButton size="lg" @click="openModel(item.content)"
                >Batafsil</UButton
              ></UDivider
            >
          </div>
        </template>
      </UAccordion>
    </div>
    <USlideover v-model="pageData.slideover" prevent-close>
      <UCard
        class="flex flex-col flex-1 overflow-y-auto scrollbar"
        :ui="{
          body: { base: 'flex-1' },
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              {{
                pageData.order.delivery
                  ? pageData.order.delivery.address.name
                  : "Unknown"
              }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="pageData.slideover = false"
            />
          </div>
        </template>

        <div class="h-full">
          <div v-for="(order, i) in pageData.order.products" :key="i">
            <div class="flex items-center justify-between mx-1 my-3">
              <img :src="order.product.photo_urls[0]" alt="" width="150px" />
              <div>{{ order.product.name_uz }}</div>
              <div>{{ order.quantity }} ta</div>
            </div>
          </div>
          <div class="px-4 py-4 sm:px-6 border-t mt-4">
            <UButton size="xl" block class="mb-2" @click="openPrintScreen"
              >Chek</UButton
            >
            <UButton
              size="xl"
              block
              @click="handleSubmitOrder(order)"
              :loading="pageData.buttonLoading"
              :disabled="pageData.isPrint"
              >Tasdiqlash</UButton
            >
          </div>
        </div>
      </UCard>
    </USlideover>
    <div class="print-wrapper h-full max-w-[25.9%]">
      <div
        class="print-text w-full text-[13px] font-bold justify-center flex items-center"
      >
        "Go'shtbor" MChJ
      </div>
      <div
        class="print-text w-full text-[13px] font-bold justify-center flex items-center"
      >
        Toshkent shahar, Arnasoy 23
      </div>
      <br />
      <div class="print-text text-[13px]">
        <div class="flex justify-between print-text">
          <div class="print-text">Sana:</div>
          <div class="print-text" style="white-space: nowrap">
            {{ dateFormat(new Date()) }}
          </div>
        </div>
        <div class="flex justify-between print-text">
          <div class="print-text">Buyurtma ID:</div>
          <div class="print-text" style="white-space: nowrap">
            {{ pageData.order.id }}
          </div>
        </div>
        <div class="flex justify-between print-text">
          <div class="print-text">Buyurtmachi:</div>
          <div class="print-text" style="white-space: nowrap">
            {{ pageData.order.userId ? pageData.order.userId.name : "unknown" }}
            {{
              pageData.order.userId ? pageData.order.userId.surname : "mehmon"
            }}
          </div>
        </div>
        <div class="flex justify-between print-text">
          <div class="print-text">Telefon Raqam:</div>
          <div class="print-text" style="white-space: nowrap">
            +{{
              pageData.order.phone ? pageData.order.phone.number : "unknown"
            }}
          </div>
        </div>
      </div>
      <div class="print-text">--------------------------------------</div>
      <div
        class="print-text text-[13px]"
        v-for="item in pageData.order.products"
        :key="item._id"
      >
        <div class="flex justify-between print-text">
          <div class="print-text font-bold">{{ item.product.name_uz }}</div>
          <div class="print-text">
            {{
              numberFormat(
                item.product.sale.isSale
                  ? item.product.sale.price
                  : item.product.price
              )
            }}
            so'm
          </div>
        </div>
        <div class="flex justify-between print-text">
          <div class="print-text">Mahsulot Soni:</div>
          <div class="print-text">{{ item.quantity }} ta</div>
        </div>
        <div class="flex justify-between print-text">
          <div class="print-text">Mahsulot Umumiy Narxi:</div>
          <div class="print-text">
            {{
              numberFormat(
                item.product.sale.isSale
                  ? item.product.sale.price * item.quantity
                  : item.product.price * item.quantity
              )
            }}
            so'm
          </div>
        </div>

        <div class="print-text text-lg">
          <div class="print-text">----------------------------------</div>
        </div>
      </div>
    </div>
    <div><audio :ref="pageData.audioRef" src="/alert.mp3" /></div>
  </div>
  <div v-else>
    <Loader />
  </div>
</template>

<script setup>
const messages = ref([]);
const pageData = reactive({
  loading: true,
  buttonLoading: false,
  slideover: false,
  order: {},
  isPrint: true,
  audioRef: "",
});

let ws;
const toast = useToast();

onMounted(async () => {
  try {
    const resData = await $fetch(`${BASE_URL}/collectors/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
    });

    messages.value = resData.data;

    ws = new WebSocket("ws://193.124.33.145:3031");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      messages.value.unshift(data);
      var audio = new Audio("/alert.mp3"); // path to file
      audio.play();
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
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
  return messages.value.map((message) => {
    const label =
      message.delivery && message.delivery.address
        ? message.delivery.address.name
        : "Unknown";
    return {
      label,
      content: message,
    };
  });
});

const handleSubmitOrder = async () => {
  pageData.buttonLoading = true;
  try {
    await $fetch(`${BASE_URL}/collectors/orders/${pageData.order._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
    });

    const resData = await $fetch(`${BASE_URL}/collectors/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
    });

    messages.value = resData.data;
    pageData.slideover = false;
    pageData.isPrint = true;
    pageData.order = {};
  } catch (error) {
    console.error("Error during onMounted:", error);
    toast.add({ title: error.message || "An error occurred" });
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
  }
  pageData.buttonLoading = false;
};

const openPrintScreen = () => {
  pageData.isPrint = false;
  window.print();
};

const openModel = (order) => {
  pageData.slideover = true;
  pageData.order = order;
  pageData.isPrint = true;
};

defineShortcuts({
  escape: {
    usingInput: true,
    whenever: [pageData],
    handler: () => {
      pageData.slideover = false;
    },
  },
});
onBeforeUnmount(() => {
  if (ws) {
    ws.close();
  }
});
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap");
.scrollbar::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}
* {
  font-family: "Poppins", sans-serif;
}
@media print {
  body * {
    visibility: hidden;
    margin: 0;
    padding: 0;
  }

  * {
    margin: 0;
    padding: 0;
  }

  .print-text {
    display: block;
    visibility: visible;
  }
}
@page {
  size: 100% 230px;
  margin: 0 25px 0 0;
  overflow: hidden;
}

header,
footer {
  display: none;
}

@media print {
  header,
  footer {
    display: none;
  }
}
</style>