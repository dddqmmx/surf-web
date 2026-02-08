<template>
  <div class="dev-console">
    <div v-for="(log, index) in logs" :key="index">{{ log }}</div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const logs = ref<string[]>([]);
let originalLog: (...args: any[]) => void;

onMounted(() => {
  originalLog = console.log;
  console.log = (...args: any[]) => {
    const message = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ');
    logs.value.push(message);
    if (logs.value.length > 1000) {
      logs.value.shift();
    }
    originalLog.apply(console, args);
  };
});

onBeforeUnmount(() => {
  if (originalLog) {
    console.log = originalLog;
  }
});
</script>

<style scoped>
.dev-console {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  color: #0f0;
  font-family: monospace;
  font-size: 12px;
  overflow-y: auto;
  padding: 10px;
  z-index: 9999;
  pointer-events: none;
}
</style>
