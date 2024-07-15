<template>
  <div v-if="!pageData.loading">
    <div class="flex">
      <div class="w-[30%]">
        <UInput
          icon="i-heroicons-magnifying-glass-20-solid"
          size="lg"
          color="white"
          class="mb-4"
          :trailing="false"
          v-model="pageData.search_user"
          placeholder="Qidirish..."
        />
        <div class="overflow-scroll h-[90vh]">
          <div v-for="user in filteredUsers" :key="user._id">
            <div
              :class="['flex my-2 gap-x-2 cursor-pointer']"
              @click="openChat2(user)"
            >
              <div v-if="user.newMessage">
                <UAvatar
                  :src="user.photo_url"
                  :alt="`${user.name} ${user.surname}`"
                  chip-color="primary"
                  chip-text=""
                  chip-position="top-right"
                />
              </div>
              <div v-else>
                <UAvatar
                  :src="user.photo_url"
                  :alt="`${user.name} ${user.surname}`"
                />
              </div>
              {{ user.name }} {{ user.surname }}
            </div>
            <UDivider />
          </div>
        </div>
      </div>
      <div class="w-full ml-[5%]">
        <UCard>
          <template #header>
            <div class="cursor-pointer" @click="openUserProfile">
              <div
                class="items-center flex gap-x-4"
                v-if="pageData.selected_user"
              >
                <UAvatar
                  :src="pageData.selected_user.photo_url"
                  :alt="`${pageData.selected_user.name} ${pageData.selected_user.surname}`"
                />
                <div>
                  {{
                    pageData.selected_user ? pageData.selected_user.name : ""
                  }}
                  {{
                    pageData.selected_user ? pageData.selected_user.surname : ""
                  }}
                </div>
              </div>
            </div>
          </template>

          <div class="h-[70vh] overflow-scroll scroll-top pb-20 relative">
            <div class="fixed bottom-24 right-16">
              <UButton
                size="xl"
                :ui="{ rounded: 'rounded-full' }"
                @click="chatDown"
              >
                <UIcon name="i-heroicons-arrow-down"
              /></UButton>
            </div>
            <div v-for="message in pageData.messages" :key="message._id">
              <div>
                <div v-if="message.is_admin">
                  <div class="mt-2 justify-end flex">
                    <div
                      class="border border-black p-2 rounded-xl"
                      :id="message._id"
                    >
                      {{ message.message }}
                    </div>
                  </div>
                  <div class="mb-2 justify-end flex text-sm">
                    <div>{{ dateFormat(message.createdAt) }}</div>
                  </div>
                </div>
                <div v-else>
                  <div class="mt-2 justify-start flex">
                    <div
                      class="border border-black p-2 rounded-xl"
                      :id="message._id"
                    >
                      {{ message.message }}
                    </div>
                  </div>
                  <div class="mb-2 justify-start flex text-sm">
                    <div>{{ dateFormat(message.createdAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <UForm class="flex" @submit="handleSendMessageToUser">
              <UInput
                class="w-full mr-4"
                size="xl"
                placeholder="Xabaringizni Yozing..."
                v-model="pageData.message"
              /><UButton size="xl" type="submit">Yuborish</UButton>
            </UForm>
          </template>
        </UCard>
      </div>
    </div>
    <UModal v-model="pageData.user_info_modal" fullscreen>
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
              {{ pageData.selected_user ? pageData.selected_user.name : "" }}
              {{ pageData.selected_user ? pageData.selected_user.surname : "" }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="pageData.user_info_modal = false"
            />
          </div>
        </template>

        <div v-if="pageData.user_data">
          <div>Ismi: {{ pageData.user_data.user.name }}</div>
          <div>Familiyasi: {{ pageData.user_data.user.surname }}</div>
          <div v-if="pageData.user_data.user.phone">
            Telefon raqami: +{{ pageData.user_data.user.phone }}
          </div>
          <div>
            Ro'yxatdan o'tilgan sana:
            {{ dateFormat(pageData.user_data.user.createdAt) }}
          </div>
          <div class="text-xl my-4">Buyurtmalar:</div>
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
                <UDivider
                  ><span>Foydalanuvchi Ismi va Familiyasi:</span></UDivider
                >
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
                        pageData.order &&
                        pageData.order.pay &&
                        pageData.order.pay[pageData.order.pay.type] &&
                        pageData.order.pay[pageData.order.pay.type]
                          .total_amount != null
                          ? numberFormat(
                              pageData.order.pay[pageData.order.pay.type]
                                .total_amount
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
        </div>

        <div v-if="pageData.user_info_modal_loading">
          <Loader />
        </div>
      </UCard>
    </UModal>
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
              Buyurtma ID: {{ pageData.order.order_id }} -
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
            <div v-if="pageData.order.cancel">
              <div class="font-semibold">Bekor Bo'lgan Vaqti:</div>
              <div>
                {{ dateFormat(pageData.order.cancel.date) }}
              </div>
            </div>
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
          <UButton
            color="red"
            size="xl"
            block
            @click="openCancelModal"
            :disabled="
              pageData.order.status == 0 ||
              pageData.order.status == 1 ||
              pageData.order.status == 2 ||
              pageData.order.status == 3
                ? false
                : true
            "
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
              Buyurtma ID: {{ pageData.order.order_id }} -
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
  <div v-else><Loader /></div>
</template>

<script setup>
const pageData = reactive({
  loading: true,
  users: [],
  messages: [],
  message: "",
  selected_user: null,
  content_loading: false,
  search_user: "",
  user_info_modal: false,
  user_info_modal_loading: true,
  user_data: null,
  modal: false,
  order: null,
  cancelModal: false,
  cancelReason: "",
});

const filteredUsers = computed(() => {
  const searchTerm = (pageData.search_user || "").toLowerCase();
  return pageData.users.filter((user) =>
    user.name
      ? user.name.toLowerCase().includes(searchTerm)
      : "" || user.surname
      ? user.surname.toLowerCase().includes(searchTerm)
      : ""
  );
});

onMounted(async () => {
  try {
    const resData = await $fetch(`${BASE_URL}/messages/chats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
    });
    pageData.users = resData.data;
    socket = new WebSocket(socketUrl);

    socket.onopen = onConnect;
    socket.onclose = onDisconnect;
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (
        pageData.selected_user &&
        pageData.selected_user._id === data.user._id
      ) {
        pageData.messages.push(data);
        const item = document.querySelector(".scroll-top");
        item.scrollTo({
          top: item.scrollHeight,
          behavior: "smooth",
        });
      }

      const userIndex = pageData.users.findIndex(
        (user) => user._id === data.user._id
      );
      if (userIndex !== -1) {
        const [user] = pageData.users.splice(userIndex, 1);
        user.newMessage = true;
        console.log(user.newMessage);
        pageData.users.unshift(user);
        const audio = new Audio("/alert.mp3"); // path to file
        audio.play();
      }
    };
    pageData.loading = false;
  } catch (error) {
    console.log(error);
  }
});

const openChat2 = async (user) => {
  await openChat(user);
  await openChat(user);
};

const openChat = async (user) => {
  pageData.selected_user = user;
  user.newMessage = false;
  try {
    const resData = await $fetch(`${BASE_URL}/messages/${user._id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
    });
    pageData.messages = resData.data;
  } catch (error) {
    console.log(error);
  }
  const item = document.querySelector(".scroll-top");
  item.scrollTo({
    top: item.scrollHeight,
    behavior: "smooth",
  });
};
const chatDown = async () => {
  const item = document.querySelector(".scroll-top");
  item.scrollTo({
    top: item.scrollHeight,
    behavior: "smooth",
  });
};

const handleSendMessageToUser = async () => {
  pageData.content_loading = true;
  try {
    await $fetch(`${BASE_URL}/messages/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
      },
      body: JSON.stringify({
        userId: pageData.selected_user._id,
        message: pageData.message,
      }),
    });
    pageData.message = "";
    const resData = await $fetch(
      `${BASE_URL}/messages/${pageData.selected_user._id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
        },
      }
    );
    pageData.messages = resData.data;
    const item = document.querySelector(".scroll-top");
    item.scrollTo({
      top: item.scrollHeight,
      behavior: "smooth",
    });
  } catch (error) {
    console.log(error);
  }
  pageData.content_loading = false;
};

let socket;

const isConnected = ref(false);
const transport = ref("WebSocket");

function onConnect() {
  isConnected.value = true;
  transport.value = "WebSocket";
}

function onDisconnect() {
  isConnected.value = false;
  transport.value = "N/A";
}

onBeforeUnmount(() => {
  if (socket) {
    socket.close();
  }
});

const openUserProfile = async () => {
  pageData.user_info_modal = true;
  pageData.user_info_modal_loading = false;
  try {
    const resData = await $fetch(
      `${BASE_URL}/helper/user/${pageData.selected_user._id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("collectorToken")}`,
        },
      }
    );
    pageData.user_data = resData.data;
  } catch (error) {
    console.log(error.message);
  }
};
const formattedMessages = computed(() => {
  return pageData.user_data.orders.map((order) => {
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
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
}

.new-message {
  border: 2px solid black;
}
</style>
