<script setup>
const socketUrl = "ws://localhost:3031";
let socket;

const messages = ref([]);

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

onMounted(() => {
  socket = new WebSocket(socketUrl);

  socket.onopen = onConnect;
  socket.onclose = onDisconnect;
  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onmessage = (event) => {
    messages.value.push(JSON.parse(event.data));
    console.log("Message from server:", event.data);
  };
});

onBeforeUnmount(() => {
  if (socket) {
    socket.close();
  }
});
</script>

<template>
  <div>
    <p>Status: {{ isConnected ? "connected" : "disconnected" }}</p>
    <p>Transport: {{ transport }}</p>

    <div v-for="(item, i) in messages" :key="i">
      {{ item.message }}
    </div>
  </div>
</template>
