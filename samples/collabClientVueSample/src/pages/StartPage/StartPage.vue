<template>
  <div class="start-box">
    <img :src="bgL" class="start-bg-l" />
    <img :src="bgS" class="start-bg-s" />
    <div>
      <div class="start-title">Foxit Web Collaboration Demo</div>
      <Button type="primary" shape="round" class="go-to-btn" :style="{ backgroundColor: '#923094', border: 0 }"
        @click="login">Go to Demo</Button>
    </div>
    <div class="start-footer">
      ©️Copyright belongs to foxit
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { Button } from 'ant-design-vue';
import { storageGetItem, storageRemoveItem, storageSetItem } from '../../utils/utils';
import { randomMockName } from '../../utils/collab-utils';
import bgL from 'assets/icon/background-l.svg';
import bgS from 'assets/icon/background-s.svg';
import './StartPage.less';

const router = useRouter();

const login = () => {
  let screenSyncId = storageGetItem(localStorage, 'screenSyncId');
  if (screenSyncId) {
    storageRemoveItem(localStorage, 'screenSyncId');
  }
  // The creator account is currently randomly generated for logging in
  let creatorName = randomMockName('Creator');
  if (creatorName) {
    storageSetItem(localStorage, 'creatorName', creatorName);
    router.push({ name: 'collabCreator' });
  } else {
    throw new Error('Login failed');
  }
};
</script>