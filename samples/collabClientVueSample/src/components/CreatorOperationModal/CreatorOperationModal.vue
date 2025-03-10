<template>
  <div>
    <div class="collab-share" @click="()=>{visible = true}">
      <img :src=shareMembers class="create-share" />
      Share
    </div>
    <Modal
      title="Share files"
      v-model:open="visible"
      :footer="null"
      :closable="true"
      width="500px"
      :centered="true"
      @cancel="()=>{visible = false}"
    >
      <div class="creator-operation-wrap">
        <div class="drop-wrap">
          <div class="permission-wrap">
            <SetPublicPermission :isPublic :setPublicPermissionFn />
          </div>
          <div class="annot-permission-wrap">
            <SetCommentPermission :isComment :dropDisabled="isPublic === 'NoAnyone'" :setCommentPermission />
          </div>
        </div>
        <div class="participants-box">
          <Participants :isShowPermissionDrop="true" :collaborationMembers />
          <div class="invite" @click="()=>{isInvitePopup = true}">
            <img :src="InviteIcon" />Invite
          </div>
        </div>
        <div class="creator-operation-footor">
          <div class="stop-collab" @click="()=>{isShowStopCollabPopup = true}">Stop share</div>
          <div class="copy-link" @click="copyLink">Copy link<img :src=copyLinkIcon /></div>
        </div>
      </div>
    </Modal>
    <Modal
      :title="lang.dialogTitle"
      v-model:open="isShowStopCollabPopup"
      @cancel="()=>{isShowStopCollabPopup = false}"
      :centered="true"
    >
      <template #footer>
        <Button class="stop-collab-continue" @click="stopShare">Continue</Button>
      </template>
      <div class="collab-modal-wrap">
        {{ lang.ModalDes.endCollabTip }}
      </div>
    </Modal>
    <InviteUser v-if="isInvitePopup" :onExit="onExitInvite" />
  </div>
</template>

<script setup>
import { ref, onMounted, toRaw } from 'vue';
import { Button, message, Modal } from 'ant-design-vue';
import { lang } from '../../locales';
import { PUBLIC_PATH } from '../../config';
import InviteIcon from 'assets/icon/invite-icon.svg';
import shareMembers from 'assets/icon/share-members.svg';
import copyLinkIcon from 'assets/icon/copy-link.svg';
import Participants from '../Participants/Participants.vue';
import copy from 'copy-to-clipboard';
import { setIsLoading } from '@/store/isLoading';
import { collaboration } from '@/store/collaboration';
import InviteUser from '../InviteUser/InviteUser.vue';
import SetCommentPermission from '../SetCommentPermission/SetCommentPermission.vue';
import SetPublicPermission from '../SetPublicPermission/SetPublicPermission.vue';
import { useRouter } from 'vue-router';
import './CreatorOperationModal.less';

const props = defineProps({
  collaborationMembers: Array,
  invitedMembers: Function,
});

const visible = ref(true);
const isInvitePopup = ref(false);
const isShowStopCollabPopup = ref(false);
const isPublic = ref('Anyone');
const isComment = ref('Comment');
const router = useRouter();

onMounted(async () => {
  const isAnyOne = collaboration.value?.isDocPublic ? 'Anyone' : 'NoAnyone';
  const permission = collaboration.value && await toRaw(collaboration.value)?.getPermission();
  const isAllowComment = await permission?.isAllowComment();
  const result = isAllowComment ? 'Comment' : 'View';
  isComment.value = result;
  isPublic.value = isAnyOne;
});

const copyLink = () => {
  const collabLink = `${window.location.origin}${PUBLIC_PATH}collabParticipant?collaborationId=${toRaw(collaboration.value)?.id}`;
  copy(collabLink);
  message.info(lang.copySuccess);
};

const stopShare = () => {
  const stopShareFn = async () => {
    setIsLoading(true);
    await toRaw(collaboration.value)?.end();
  };
  stopShareFn()
    .then(() => {
      visible.value = false;
      isShowStopCollabPopup.value = false;
      const pathname = router.currentRoute.value.path;
      window.location.href = pathname;
    })
    .catch((error) => {
      message.error(error.message);
      setIsLoading(false);
    });
};

const setPublicPermissionFn = async (key) => {
  const isDocPublic = key === 'Anyone';
  if (collaboration.value) {
    const isUpdatePermissionSuccess = await toRaw(collaboration.value).updatePermission({ isDocPublic }).catch(() => false);
    if (isUpdatePermissionSuccess) {
      isPublic.value = key;
    } else {
      message.error(lang.CollabAuthor.permissionSetError);
    }
  }
};

const setCommentPermission = async (key) => {
  const isDocComment = key === 'Comment';
  if (collaboration.value) {
    const isUpdatePermissionSuccess = await toRaw(collaboration.value).updatePermission({ isAllowComment: isDocComment }).catch(() => false);
    if (isUpdatePermissionSuccess) {
      isComment.value = key;
    } else {
      message.error(lang.CollabAuthor.permissionSetError);
    }
  }
};

const onExitInvite = (isInvited) => {
  if (isInvited) {
    props.invitedMembers();
  }
  isInvitePopup.value = false;
};
</script>

