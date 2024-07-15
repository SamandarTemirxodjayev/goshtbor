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
              ><b>{{ item.content.order_id }}</b></span
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
                >{{ item.content.userId ? item.content.userId.name : "" }}
                {{ item.content.userId ? item.content.userId.surname : "" }}</b
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
                  pageData.order &&
                  pageData.order.pay &&
                  pageData.order.pay[pageData.order.pay.type] &&
                  pageData.order.pay[pageData.order.pay.type].total_amount !=
                    null
                    ? numberFormat(
                        pageData.order.pay[pageData.order.pay.type].total_amount
                      )
                    : "To'lanmagan"
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
              Buyurtma ID: {{ pageData.order.id }} -
              {{ statusFormat(pageData.order.status) }}
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

        <div class="grid grid-cols-5">
          <div>
            <div class="text-2xl font-bold">Foydalanuvchi:</div>
            <div class="font-semibold">Ism Familiyasi:</div>
            <div>
              {{ pageData.order.userId.name }}
              {{ pageData.order.userId.surname }}
            </div>
            <div class="font-semibold">Telefon Raqami:</div>
            <div>+{{ pageData.order.phone.number }}</div>
            <div class="font-semibold">Ro'yxatdan O'tilgan Sana:</div>
            <div>
              {{ dateFormat(pageData.order.userId.createdAt) }}
            </div>
          </div>
          <UDivider label="Goshtbor" orientation="vertical" />
          <div>
            <div class="text-2xl font-bold">To'lov Haqida:</div>
            <div class="font-semibold">To'lov Turi:</div>
            <div>
              {{ pageData.order.pay.type }}
            </div>
            <div class="font-semibold">Tolov Summasi:</div>
            <div>
              {{
                pageData.order &&
                pageData.order.pay &&
                pageData.order.pay[pageData.order.pay.type] &&
                pageData.order.pay[pageData.order.pay.type].total_amount != null
                  ? numberFormat(
                      pageData.order.pay[pageData.order.pay.type].total_amount
                    )
                  : "To'lanmagan"
              }}
              so'm
            </div>
            <div class="font-semibold">Tolov ID:</div>
            <div v-if="pageData.order.pay.type == 'payme'">
              {{ pageData.order.pay[pageData.order.pay.type].id }}
            </div>
            <div v-if="pageData.order.pay.type == 'click'">
              {{ pageData.order.pay[pageData.order.pay.type].click_trans_id }}
            </div>
            <div v-if="pageData.order.pay.type == 'uzum'">
              {{ pageData.order.pay[pageData.order.pay.type].transId }}
            </div>
            <div v-if="pageData.order.pay.type == 'card'">
              {{ pageData.order.pay[pageData.order.pay.type].uuid }}
            </div>
          </div>
          <UDivider label="Goshtbor" orientation="vertical" />

          <div>
            <div class="text-2xl font-bold">Buyurtma Haqida:</div>
            <div class="font-semibold">Komentariya:</div>
            <div>
              {{ pageData.order.comment }}
            </div>
            <div class="font-semibold">Yaratilgan Sana:</div>
            <div>
              {{ dateFormat(pageData.order.createdAt) }}
            </div>
            <div class="font-semibold">Manzil:</div>
            <div>
              {{ pageData.order.delivery.address.name }}
            </div>
            <div class="font-semibold">Kuryer:</div>
            <div v-if="pageData.order.delivery.courier">
              <div>
                {{ pageData.order.delivery.courier.name }}
                {{ pageData.order.delivery.courier.surname }}
              </div>
              <div>
                {{ pageData.order.delivery.courier.car.model }}
                ( {{ pageData.order.delivery.courier.car.number }} )
              </div>
              <div>
                {{ pageData.order.delivery.courier.phone_number }}
              </div>
            </div>
            <div v-else>Kuryer Mavjud Emas</div>
          </div>
        </div>
        <div class="text-2xl font-bold">Mahsulotlar</div>
        <div v-for="item in pageData.order.products" :key="item._id">
          {{ item.product.name_uz }} ({{ item.product.brand.name }}) -
          {{ item.quantity }} ta -
          {{
            item.product.sale.isSale
              ? numberFormat(item.product.sale.price)
              : numberFormat(item.product.price)
          }}
          so'm
        </div>
        <div class="mt-5">
          <UButton color="red" size="xl" block @click="openCancelModal"
            >Bekor Qilish</UButton
          >
        </div>
      </UCard>
    </UModal>
    <UModal v-model="pageData.cancelModal" prevent-close>
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
              Buyurtma ID: {{ pageData.order.id }} -
              {{ statusFormat(pageData.order.status) }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="pageData.cancelModal = false"
            />
          </div>
        </template>
        <UForm>
          <UFormGroup label="Bekor Qilish Sababi" required>
            <UInput size="2xl" v-model="pageData.cancelReason"
          /></UFormGroup>
          <UButton @click="handleSubmitCancel" class="my-2" size="xl" block
            >Tasdiqlash</UButton
          >
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
  order: {},
  isPrint: true,
  audioRef: "",
  cancelModal: false,
  cancelReason: "",
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

    const intervalId = setInterval(fetchActiveOrders, 6000);

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
const openCancelModal = async () => {
  pageData.cancelModal = true;
};
const handleSubmitCancel = async () => {
  pageData.buttonLoading = true;
  try {
    const resData = await $fetch(
      `${BASE_URL}/helper/cancel-order/${pageData.order._id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
        },
        body: JSON.stringify({
          reason: pageData.cancelReason,
        }),
      }
    );
    console.log(resData);
  } catch (error) {
    console.log(error);
  }
  pageData.cancelReason = "";
  pageData.cancelModal = false;
  pageData.buttonLoading = false;
};
defineShortcuts({
  escape: {
    usingInput: true,
    handler: () => {
      pageData.cancelModal = false;
      pageData.modal = false;
    },
  },
});
</script>