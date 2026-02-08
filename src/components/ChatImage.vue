<template>
  <img
    class="message-img"
    :src="`${networkConfig.httpPrefix}/chat/get_image?key=${image}`"
    :style="{ width: `${displayWidth}px`, height: `${displayHeight}px` }"
    alt=""
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { networkConfig } from '@/services/state';

const props = defineProps<{
  image: string;
  h: string;
  w: string;
}>();

const maxDisplayWidth = computed(() => Math.floor(window.innerWidth * 0.5));
const maxDisplayHeight = computed(() => Math.floor(window.innerHeight * 0.4));

const getScale = () => {
  const origW = Number(props.w);
  const origH = Number(props.h);
  if (!origW || !origH || origW <= 0 || origH <= 0) return 1;
  const scaleW = maxDisplayWidth.value / origW;
  const scaleH = maxDisplayHeight.value / origH;
  return Math.min(scaleW, scaleH, 1);
};

const displayWidth = computed(() => {
  const origW = Number(props.w);
  if (!origW || origW <= 0) return 200;
  const scale = getScale();
  return Math.floor(origW * scale);
});

const displayHeight = computed(() => {
  const origH = Number(props.h);
  if (!origH || origH <= 0) return 200;
  const scale = getScale();
  return Math.floor(origH * scale);
});
</script>

<style scoped>
.message-img {
  object-fit: contain;
  border-radius: 8px;
  display: block;
  width: 100%;
  height: 100%;
}
</style>
