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
          <div class="text-center flex">
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
          <div class="text-center flex">
            <UDivider><span>Foydalanuvchi Telefon Raqami:</span></UDivider>
            <UDivider
              ><span
                ><b>{{ item.content.phone.number }}</b></span
              ></UDivider
            >
          </div>
          <div class="text-center flex">
            <UDivider><span>Qo'shimcha Ma'lumot:</span></UDivider>
            <UDivider
              ><span
                ><b>{{ item.content.comment }}</b></span
              ></UDivider
            >
          </div>
          <div class="text-center flex">
            <UDivider><span>Mahsulot Soni:</span></UDivider>
            <UDivider
              ><span
                ><b>{{ item.content.products.length }}</b></span
              ></UDivider
            >
          </div>
          <div class="text-center flex">
            <UDivider><span>Tolov Turi:</span></UDivider>
            <UDivider
              ><span
                ><b>{{ item.content.pay.type }}</b></span
              ></UDivider
            >
          </div>
          <div class="text-center flex">
            <UDivider><span>Tolov Summasi:</span></UDivider>
            <UDivider
              ><span
                ><b
                  >{{
                    item.content.pay[item.content.pay.type].total_amount
                  }}
                  so'm</b
                ></span
              ></UDivider
            >
          </div>
        </template>
      </UAccordion>
    </div>
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
});

let ws;
const toast = useToast();

onMounted(async () => {
  try {
    const collectorToken = localStorage.getItem("collectorToken");
    if (!collectorToken) {
      return navigateTo("/login");
    }

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
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    pageData.loading = false;
  } catch (error) {
    console.error("Error during onMounted:", error);
    toast.add({ title: error.message || "An error occurred" });
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigateTo("/exit");
    }
    pageData.loading = false;
  }
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

onBeforeUnmount(() => {
  if (ws) {
    ws.close();
  }
});
</script>