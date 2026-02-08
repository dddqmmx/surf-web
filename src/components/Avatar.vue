<template>
  <img
    class="avatar"
    :src="avatarUrl"
    :data-userid="type === 'user' ? id : null"
    :data-serverid="type === 'server' ? id : null"
    @error="onAvatarError"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { filter, Subscription } from 'rxjs';
import { networkConfig } from '@/services/state';
import { avatarService } from '@/services/ui/avatar';

const props = withDefaults(
  defineProps<{
    id: string;
    type?: 'user' | 'server';
  }>(),
  {
    type: 'user',
  }
);

const avatarUrl = ref('');
let subscription: Subscription | null = null;

const updateAvatar = (noCache = false) => {
  let url = '';
  if (props.type === 'user') {
    url = `${networkConfig.httpPrefix}/user/avatar/${props.id}`;
  } else if (props.type === 'server') {
    url = `${networkConfig.httpPrefix}/server/icon/${props.id}`;
  }

  if (noCache) {
    const timestamp = new Date().getTime();
    url += `?t=${timestamp}`;
  }

  avatarUrl.value = url;
};

const refreshAvatar = () => updateAvatar(true);

defineExpose({ refreshAvatar });

const onAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (!img.src.includes('default-avatar.png')) {
    img.src = '/images/avatar/default-avatar.png';
  }
};

watch(
  () => props.id,
  (newId) => {
    if (newId) {
      updateAvatar();
    }
  },
  { immediate: true }
);

onMounted(() => {
  subscription = avatarService.avatarChanged$
    .pipe(filter((changedId: string) => changedId === props.id))
    .subscribe(() => updateAvatar());
});

onBeforeUnmount(() => {
  subscription?.unsubscribe();
});
</script>

<style scoped>
.avatar {
  max-width: 100%;
  border-radius: 10px;
}
</style>
