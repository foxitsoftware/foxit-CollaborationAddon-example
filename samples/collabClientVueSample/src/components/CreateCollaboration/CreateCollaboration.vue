<template>
  <div>
    <Popover placement="bottom">
      <template #content>
        <span>Create Share</span>
      </template>
      <div class="share-btn" id="createShare" @click=createShare>
        <img :src=createShareIcon class="create-share" />
        Share
      </div>
    </Popover>
    <Modal
      title="Start Collaboration"
      :open="isCreateCollab"
      @cancel="hideModal"
      :footer="null"
      centered
    >
      <div class="collab-modal-wrap">
        <div>{{ lang.ModalDes.getSharedLink }}</div>
        <div class="create-footor-wrap">
          <div class="privacy-wrap">
            <Checkbox @change="checkBoxChange">
              <a :href="privacyPolicy" target="_blank">Foxit Privacy Policy</a>
            </Checkbox>
          </div>
          <Button
            type="primary"
            key="create-collab-btn"
            :disabled="!isCheckPrivacy"
            @click="createCollab"
            >Create</Button
          >
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Button, Checkbox, message, Modal, Popover } from 'ant-design-vue';
import { lang } from '../../locales';
import createShareIcon from 'assets/icon/create-share.svg';
import { privacyPolicy } from '../../utils/collab-utils';
import './CreateCollaboration.less';

const props = defineProps({
  pdfDocPermission: Object,
  openDocFailed: Boolean,
  createCollab: Function,
});

const isCheckPrivacy = ref(false);
const isCreateCollab = ref(false);
const pdfDocPermission = ref(null);
const openDocFailed = ref(false);

watch(
  () => props.pdfDocPermission,
  (newVal) => {
    pdfDocPermission.value = newVal;
  }
);

watch(
  () => props.openDocFailed,
  (newVal) => {
    openDocFailed.value = newVal;
  }
);

const createShare = () => {
  if (!pdfDocPermission.value.isPortfolio) {
    if (openDocFailed.value) {
      message.error(lang.collabOpenFailed);
    } else if (pdfDocPermission.value.hasAnnotFormPermission) {
      isCreateCollab.value = true;
    } else {
      message.error(lang.CollabAuthor.noCommentPermission);
    }
  } else {
    message.error(lang.CollabAuthor.portfolioTip);
  }
};

const checkBoxChange = (e) => {
  isCheckPrivacy.value = e.target.checked;
};

const createCollab = () => {
  props.createCollab();
  isCreateCollab.value = false;
};

const hideModal = () => {
  isCreateCollab.value = false;
};
</script>
