<template>
  <Modal
    :zIndex="10000"
    title="Password"
    :open="props.passwordVisible"
    :footer="null"
    class="passwordPopup"
    width="360px"
    @cancel="()=>{props.closePasswordPopup()}"
    centered
  >
    <div class="login-password-wrap">
      <div class="password-label">{{ lang.ModalDes.pwdTitle }}</div>
      <div class="input-password-wrap">
        <Input
          :type="isHidePassword ? 'password' : 'text'"
          v-model:value="email"
        />
        <img :src="passwordIcon()" @click="setPasswordVisible" />
      </div>
      <div class="password-footor">
        <div class="to-login" @click="submitPasswordHandler">OK</div>
        <div class="cancel-btn" @click="()=>{props.closePasswordPopup()}">Cancel</div>
      </div>
    </div>
  </Modal>
  <Modal
    width="400px"
    :title="lang.dialogTitle"
    :open="props.collaborationEndedPopup"
    :zIndex="1022"
    :closable="false"
    centered
  >
  <template #footer>
    <Button key="Sure" type="primary" @click="endCollaboration">
      Sure
    </Button>
  </template>
    <div class="collab-modal-wrap">
      {{ lang.ModalDes.collabHasEndedTip }}
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Button, Input, message, Modal } from 'ant-design-vue';
import showPasswordIcon from 'assets/icon/show-pwd.svg';
import hidePasswordIcon from 'assets/icon/hide-pwd.svg';
import { lang } from '../../locales';
import { PUBLIC_PATH } from '../../config';
import './CollaborationModal.less';

const props = defineProps({
  passwordVisible: Boolean,
  collaborationEndedPopup: Boolean,
  closePasswordPopup: Function,
  submitPassword: Function
});

const email = ref('');
const isHidePassword = ref(true);

const submitPasswordHandler = async () => {
  if (email.value === '') {
    message.error(lang.Component.enterPwdTip);
    return;
  }
  await props.submitPassword(email.value);
  email.value = '';
};

const setPasswordVisible = () => {
  isHidePassword.value = !isHidePassword.value;
};

const passwordIcon = computed(() => {
  return isHidePassword.value ? showPasswordIcon : hidePasswordIcon;
});

const endCollaboration = () => {
  window.location.href = PUBLIC_PATH;
};
</script>
