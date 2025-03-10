<template>
  <Modal
    title="Back"
    :open="true"
    closable
    width="500px"
    centered
    @cancel="props.onExit(false)"
  >
    <template #footer>
      <Button class="send-invite" :disabled="inviteList.length === 0" key="sendInvite" @click="sendInvite">Send invitation</Button>
    </template>
    <div class="invite-wrap">
      <InputGroup compact class="email-wrap">
        <Input
          placeholder="Email, command Enter to add"
          class="email-input"
          key="email"
          v-model:value="email"
          @keydown.enter="addEmail"
        />
        <Button @click="addEmail" class="email-btn">Add</Button>
      </InputGroup>
      <div v-if="inviteList.length > 0" class="email-list">
        <div class="title">Added people</div>
        <div v-for="(item, index) in inviteList" :key="index" class="participant-list">
          <div class="invite-left-wrap">
            <div class="portrait" :style="{ background: '#707070D6' }">{{ item.email.substr(0, 1) }}</div>
            <div class="nickName">{{ item.email }}</div>
          </div>
          <div class="invite-drop-wrap">
            <SetCommentPermission
              :isComment="item.isAllowComment ? 'Comment' : 'View'"
              :isParticipantsUse="true"
              :setCommentPermission="key => setAnnotPermission(key, item)"
            />
          </div>
          <img class="clear-icon" :src="clearIcon" @click="deleteEmail(item)" />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, toRaw } from 'vue';
import { Modal, InputGroup, Input, Button, message } from 'ant-design-vue';
import clearIcon from 'assets/icon/clear.svg';
import { lang } from '../../locales';
import { collaboration } from '@/store/collaboration';
import SetCommentPermission from '../SetCommentPermission/SetCommentPermission.vue';
import './InviteUser.less';

const props = defineProps(['onExit']);
const email = ref('');
const inviteList = ref([]);

const addEmail = () => {
  if (email.value === '') {
    message.error(lang.submitEmailTip);
    return;
  }
  if (email.value.match(/^\w+@\w+\.\w+$/i)) {
    const emailArr = inviteList.value.map(item => item.email);
    if (emailArr.includes(email.value)) {
      message.error(lang.Component.emailAlreadyExist);
      return;
    }
    inviteList.value.push({
      isAllowComment: true,
      email: email.value
    });
    email.value = '';
  } else {
    message.error(lang.emailFormatError);
  }
};

const sendInvite = async () => {
  try {
    const isInvited = collaboration.value && await toRaw(collaboration.value)?.addMembers(toRaw(inviteList.value));
    if (isInvited) {
      message.info(lang.CollabAuthor.inviteSuccess);
      props.onExit(isInvited);
    }
  } catch (error) {
    if (error.ret === 400) {
      message.error(error.message);
    } else {
      message.error(lang.CollabAuthor.inviteFailed);
    }
  }
};

const setAnnotPermission = (key, item) => {
  inviteList.value = inviteList.value.map(invitor => {
    if (invitor.email === item.email) {
      invitor.isAllowComment = key === 'Comment';
    }
    return { ...invitor };
  });
};

const deleteEmail = (item) => {
  inviteList.value = inviteList.value.filter(invitor => invitor.email !== item.email);
};
</script>

