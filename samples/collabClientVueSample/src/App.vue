<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue';
import { isLoading } from '@/store/isLoading';
import './App.less';
</script>

<template>
  <ConfigProvider :theme="{
    token: {
      colorPrimary: '#a14d9f',
    },
  }">
    <div class="loadingWrap" v-if="isLoading">
      <a-spin tip="Loading..." size="large" />
    </div>
    <router-view />
  </ConfigProvider>
</template>
