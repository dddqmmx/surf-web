<template>
  <div class="container">
    <div class="header">
      <span>你的用户列表</span>
      <div class="actions">
        <button id="importBtn">导入</button>
        <button id="newBtn">新建</button>
        <button id="back" @click="goBack">返回</button>
      </div>
    </div>
    <div class="user-list">
      <div
        v-for="(user, i) in users"
        :key="user.name + i"
        class="user"
        :class="{ selected: i === automaticLogin }"
        @click="toShowEditUserModal(i)"
      >
        <span>{{ user.name }}</span>
        <span>{{ user.file }}</span>
      </div>
    </div>
  </div>

  <div v-if="showEditUserModal" class="modal" id="editModal">
    <div class="modal-content">
      <h2>编辑用户</h2>
      <label for="userName">名称</label>
      <input id="userName" type="text" :value="editUser?.name" placeholder="输入名称" />
      <label for="fileLocation">文件位置</label>
      <label for="fileLocation">{{ editUser?.file }}</label>
      <button id="fileLocation">选择文件</button>
      <div>
        <button class="confirm">确定</button>
        <button class="cancel" id="cancelBtn" @click="showEditUserModal = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface User {
  name: string;
  file: string;
}

const router = useRouter();
const showEditUserModal = ref(false);
const automaticLogin = ref(-1);
const users = ref<User[]>([]);
const editUser = ref<User | undefined>();

const goBack = () => {
  router.back();
};

const toShowEditUserModal = (index: number) => {
  editUser.value = users.value[index];
  showEditUserModal.value = true;
};

const processProfiles = async (profiles: unknown) => {
  if (typeof profiles !== 'string') {
    console.error('Invalid profiles data');
    return;
  }

  const profilesJson = JSON.parse(profiles);
  users.value = profilesJson['user-keys'] || [];
  automaticLogin.value = profilesJson['automatic-login'];
};

const loadUserProfiles = async () => {
  // TODO: migrate tauri profile loading if needed.
  // try {
  //   const dir = await appDataDir();
  //   const profiles = await invoke('read_file', { path: `${dir}\\user-profiles.json` });
  //   await processProfiles(profiles);
  // } catch (error) {
  //   console.error('Error during initialization:', error);
  // }
  await processProfiles('{"user-keys":[],"automatic-login":-1}');
};

onMounted(() => {
  loadUserProfiles().then();
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
}

.header span {
  font-size: 1.8rem;
  font-weight: bold;
  color: #4a90e2;
}

.header .actions {
  display: flex;
  gap: 10px;
}

.header .actions button {
  padding: 8px 12px;
  font-size: 1rem;
  color: #fff;
  background-color: #4a90e2;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.header .actions button:hover {
  background-color: #357ab8;
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.user {
  margin: 10px;
  background: #f9f9f9;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 200px;
  text-align: center;
  transition: background-color 0.3s, transform 0.2s;
}

.selected {
  background-color: #eef6ff;
  transform: scale(1.05);
}

.user:hover {
  background-color: #eef6ff;
  transform: scale(1.05);
}

.user span {
  display: block;
  margin: 5px 0;
}

.user span:first-child {
  font-weight: bold;
  font-size: 1.1rem;
}

.user span:last-child {
  color: #999;
  font-size: 0.9rem;
}

.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.modal-content label {
  display: block;
  margin-bottom: 10px;
  font-size: 1rem;
}

.modal-content input[type='text'] {
  padding: 8px;
  font-size: 1rem;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-content button {
  padding: 10px 15px;
  margin: 5px;
  font-size: 1rem;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.modal-content .confirm {
  background-color: #4a90e2;
}

.modal-content .confirm:hover {
  background-color: #357ab8;
}

.modal-content .cancel {
  background-color: #999;
}

.modal-content .cancel:hover {
  background-color: #777;
}
</style>
