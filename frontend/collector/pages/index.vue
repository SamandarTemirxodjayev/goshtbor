<template>
  <div>
    <div>User was login</div>
    <div v-if="messages.length === 0">No data received yet.</div>
    <ul v-else>
      <li v-for="(message, index) in messages" :key="index">{{ message }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const messages = ref([]);

let ws;

onMounted(() => {
  ws = new WebSocket("ws://193.124.33.145:3031");

  ws.onmessage = (event) => {
    console.log(event);
    messages.value.push(event.data);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
  };
});

onBeforeUnmount(() => {
  if (ws) {
    ws.close();
  }
});
</script>

<style scoped>
div {
  padding: 1rem;
  font-family: Arial, sans-serif;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #f5f5f5;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
