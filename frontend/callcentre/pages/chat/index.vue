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
            <div
              class="items-center flex gap-x-4"
              v-if="pageData.selected_user"
            >
              <UAvatar
                :src="pageData.selected_user.photo_url"
                :alt="`${pageData.selected_user.name} ${pageData.selected_user.surname}`"
              />
              <div>
                {{ pageData.selected_user ? pageData.selected_user.name : "" }}
                {{
                  pageData.selected_user ? pageData.selected_user.surname : ""
                }}
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
  </div>
  <div v-else><Loader /></div>
</template>

<script setup>
const showScrollButton = ref(true);
const pageData = reactive({
  loading: true,
  users: [],
  messages: [],
  message: "",
  selected_user: null,
  content_loading: false,
  search_user: "",
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

const socketUrl = "ws://193.124.33.145:3031";
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
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
}

.new-message {
  border: 2px solid black;
}
</style>
