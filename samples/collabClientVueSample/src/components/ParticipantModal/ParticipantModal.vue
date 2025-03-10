<template>
  <div>
    <Modal
      :zIndex="10000"
      title="Login"
      :open="loginPopupVisible"
      @cancel="() => (loginPopupVisible = false)"
      :footer="null"
      width="458px"
      centered
    >
      <div class="login-modal-wrap">
        <div class="label">Email</div>
        <Input
          placeholder="Enter your email address"
          class="email-login-input"
          :key="emailValue"
          :defaultValue="emailValue"
          @blur="handleChange"
        />
        <div class="to-login" @click="loginSubmit">
          Login
        </div>
      </div>
    </Modal>
    <Modal
      width="400px"
      :title="lang.dialogTitle"
      :open="props.permissionChangeVisible"
      :zIndex="1022"
      :closable="false"
      centered
    >
        <template #footer>
          <Button key="Sure" type="primary" @click="reEnterShare">
            Sure
          </Button>
        </template>
      <div class="collab-modal-wrap">
        {{ lang.ModalDes.permissionChangeTip }}
      </div>
    </Modal>
    <div v-if="props.isShowLogin">
      <div class="login-tip">
        Welcome to Foxit PDF Web Collaboration!
        <span @click="() => (loginPopupVisible = true)">Log in</span> to collaborate on this file.
      </div>
    </div>
    <div v-if="props.isShowNoPermissionPopup" class="no-permission-wrap">
      <img :src="lockPermissionIcon" class="lockPermission-img" />
      <div class="lock-des">
        Permission is required to view this file,
        <br />
        Please log in to verify your permissions
      </div>
      <div class="lock-login-btn" @click="() => (loginPopupVisible = true)">
        Login
      </div>
    </div>
    <div v-if="props.isShowLogin" class="login-btn" @click="() => (loginPopupVisible = true)">
      Login
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Modal, Input, Button, message } from 'ant-design-vue';
import { lang } from '../../locales';
import lockPermissionIcon from 'assets/icon/lock-permission-icon.svg';
import { storageSetItem } from '../../utils/utils';
import './ParticipantModal.less';

const props = defineProps({
  permissionChangeVisible: Boolean,
  isShowLogin: Boolean,
  isShowNoPermissionPopup: Boolean,
});

const emailValue = ref('');
const loginPopupVisible = ref(false);

const handleChange = (e) => {
  emailValue.value = e.target.value;
};

const loginSubmit = async () => {
  if (emailValue.value === '') {
    message.error(lang.submitEmailTip);
    return;
  }
  if (emailValue.value.match(/^\w+@\w+\.\w+$/i)) {
    storageSetItem(localStorage, 'participantName', emailValue.value);
    window.location.reload();
  } else {
    message.error(lang.emailFormatError);
  }
};

const reEnterShare = () => {
  window.location.reload();
};
</script>
