<template>
  <div>
    <Popover
      placement="bottomRight"
      trigger="click"
    >
      <template #content>
        <div class="sets-wrap">
          <div class="participants-box">
            <Participants :collaborationMembers="props.collaborationMembers" />
          </div>
          <div class="footor-wrap">
            <div class="stop-collab" @click="toggleRemovePopup(true)">Remove Me</div>
            <div class="copy-link" @click="copyLink">
              Copy link <img :src="copyLinkIcon" />
            </div>
          </div>
        </div>
      </template>
      <div class="share-popover" id="shareMembers">
        <img :src="shareMembersIcon" />
        Share
      </div>
    </Popover>
    <Modal
      :title="lang.dialogTitle"
      :open="isShowRemovePopup"
      :zIndex="1300"
      centered
      @cancel="toggleRemovePopup(false)"
    >
      <template #footer>
        <Button type="primary" @click="removeMe">Continue</Button>
      </template>
      <div class="collab-modal-wrap">
        {{ lang.ModalDes.RemoveMe }}
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, toRaw } from 'vue';
import { Modal, Button, message, Popover } from 'ant-design-vue';
import { lang } from '../../locales';
import { collaboration } from '@/store/collaboration';
import { setIsLoading } from '@/store/isLoading';
import copyLinkIcon from 'assets/icon/copy-link.svg';
import shareMembersIcon from 'assets/icon/share-members.svg';
import Participants from '../Participants/Participants.vue';
import { PUBLIC_PATH } from '../../config';
import copy from 'copy-to-clipboard';
import './ParticipantOperationPopover.less';

const props = defineProps({
  collaborationMembers: Array
});

const isShowRemovePopup = ref(false);

const removeMe = async () => {
  setIsLoading(true);
  if (collaboration.value) {
    try {
      let result = await toRaw(collaboration.value).quit();
      if (result === false) {
        message.error(lang.CollabParticipant.removeError);
      }
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      message.error(lang.CollabParticipant.removeError);
    }
  }
};

const copyLink = async () => {
  const { id: docId } = toRaw(collaboration.value);
  if (docId) {
    let linkValue = `${window.location.origin}${PUBLIC_PATH}collabParticipant?collaborationId=${docId}`;
    copy(linkValue);
    message.info(lang.copySuccess);
  } else {
    message.error(lang.CollabParticipant.noExistCollabId);
  }
};

const toggleRemovePopup = (visible) => {
  isShowRemovePopup.value = visible;
};
</script>

