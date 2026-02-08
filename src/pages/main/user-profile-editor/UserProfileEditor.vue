<template>
  <div class="user-profile-root">
    <div class="container">
      <div class="user-profile-container">
        <div class="user-avatar">
          <Avatar :id="authState.clientUserId" type="user" @click="selectImage" />
        </div>
        <div class="user-profile-value">
          <div class="profile-item">
            <label class="profile-label">昵称</label>
            <input v-model="userProfile.nickname" class="profile-input" />
          </div>
          <div class="profile-item">
            <label class="profile-label">自我介绍</label>
            <textarea v-model="userProfile.introduction" class="profile-input" placeholder=""></textarea>
          </div>
        </div>
      </div>
      <div class="opt-button-container">
        <button @click="saveUserProfile">保存</button>
        <button @click="backHome">取消</button>
      </div>
    </div>

    <ImageEdit v-if="imageEditDialog && file" :file="file" @close="toggleImageEditDialog" @confirm="onConfirm" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from '@/components/Avatar.vue';
import ImageEdit from '@/components/ImageEdit.vue';
import { authState, userStore } from '@/services/state';
import { requestService } from '@/services/request';
import { userService } from '@/services/api/user';
import { avatarService } from '@/services/ui/avatar';

type UserProfile = {
  nickname: string | null;
  introduction: string | null;
};

const router = useRouter();

const imageEditDialog = ref(false);
const file = ref<File | null>(null);

const originProfile = reactive<UserProfile>({
  nickname: null,
  introduction: null,
});

const userProfile = reactive<UserProfile>({
  nickname: null,
  introduction: null,
});

const initProfile = () => {
  const data = userStore.userInfoIndexById[authState.clientUserId]?.data;
  if (!data) return;
  originProfile.nickname = data['nickname'] ?? null;
  originProfile.introduction = data['introduction'] ?? null;
  userProfile.nickname = data['nickname'] ?? null;
  userProfile.introduction = data['introduction'] ?? null;
};

onMounted(() => {
  if (!userStore.userInfoIndexById[authState.clientUserId]) {
    requestService.getUserInfo([authState.clientUserId]).then(() => initProfile());
  } else {
    initProfile();
  }
});

watch(
  () => userStore.userInfoIndexById[authState.clientUserId],
  () => {
    initProfile();
  }
);

const saveUserProfile = () => {
  const payload: Partial<UserProfile> = {};

  (Object.keys(userProfile) as Array<keyof UserProfile>).forEach((key) => {
    if (userProfile[key] !== originProfile[key]) {
      payload[key] = userProfile[key];
    }
  });

  if (Object.keys(payload).length > 0) {
    requestService.requestUpdateUserProfile(payload).then((value) => {
      if (!value) {
        return;
      }
      requestService.getUserInfo([authState.clientUserId], true).then();
      alert('成功更改');
      router.push('/main/session');
    });
  }
};

const backHome = () => {
  router.push('/main/session');
};

const selectImage = async () => {
  try {
    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'Images',
          accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
          },
        },
      ],
      multiple: false,
    });
    file.value = await fileHandle.getFile();
    toggleImageEditDialog();
  } catch (error) {
    console.log('文件选择已取消');
  }
};

const toggleImageEditDialog = () => {
  imageEditDialog.value = !imageEditDialog.value;
};

const onConfirm = (croppedBlob: Blob) => {
  userService.uploadAvatar(croppedBlob as File).subscribe({
    next: () => {
      avatarService.notifyAvatarChanged(authState.clientUserId);
    },
    error: (err) => console.error('Upload failed', err),
  });
  toggleImageEditDialog();
};
</script>

<style scoped>
.user-profile-root {
  display: flex;
  width: 100%;
  height: 100%;
}

.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 16px;
  font-family: sans-serif;
}

.user-profile-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-avatar {
  display: flex;
  width: 100%;
  justify-content: center;
}

.avatar {
  border-radius: 10px;
  border: 2px solid #ccc;
}

.user-profile-value {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-item {
  display: flex;
  flex-direction: column;
}

.profile-label {
  font-size: 14px;
  margin-bottom: 4px;
  color: #555;
}

.profile-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  resize: none;
}

.opt-button-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.opt-button-container button {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  transition: background-color 0.2s;
}

.opt-button-container button:hover {
  background-color: #0056b3;
}

.opt-button-container button:last-child {
  margin-left: 20px;
  background-color: #6c757d;
}

.opt-button-container button:last-child:hover {
  background-color: #545b62;
}
</style>
