<template>
  <div class="online-list-wrap">
    <Popover
      v-for="member in frontOnlineMembers"
      :key="member.id"
      placement="bottom"
      @openChange="visible => handleOpenChange(visible, member)"
    >
      <template #content>
        <div class="online-drop-item">
          <div class="userInfo">
            <MemberInfo :member="member" />
          </div>
          <Button
            type="primary"
            :style="{ fontWeight: 600, padding: '0 28px' }"
            :disabled="!!leader && member.id === leader.id"
            @click="switchFollowerFn(member)"
          >
            {{ leader && member.id === leader.id ? 'following' : 'Follow' }}
          </Button>
        </div>
      </template>
      <div class="portrait" :style="{ background: randomHexColor(member.id) }" >
        {{ member?.userName.charAt(0).toUpperCase() }}
      </div>
    </Popover>
    <Popover v-if="remainOnlineMembers.length > 0" placement="bottom" >
      <template #content>
        <div v-for="item in remainOnlineMembers" :key="item.id" class="remain-wrap">
          <MemberInfo :member="item" />
          <div>
            <Button
              type="primary"
              :style="{ fontWeight: 600, padding: '0 28px' }"
              :disabled="!!leader && item.id === leader.id"
              @click="switchFollowerFn(item)"
            >
              {{ !!leader && item.id === leader.id ? 'following' : 'Follow' }}
            </Button>
          </div>
        </div>
      </template>
      <div class="portrait" :style="{ background: '#707070D6', cursor: 'pointer' }" >
        +{{ remainOnlineMembers.length }}
      </div>
    </Popover>
    <Popover placement="bottom" @openChange="visible => handleOpenChange(visible, currentUser)">
      <template #content>
        <div class="online-drop-item">
          <div class="userInfo">
            <MemberInfo :member="currentUser" />
          </div>
          <div v-if="currentFollowersNum > 0 && !!leader && sessionCreatorId === currentUser.id" class="follower-num" :title="currentUser.userName">
            {{ currentFollowersNum }} followers
          </div>
          <Button
            type="primary"
            :style="{ fontWeight: 600, padding: '0 28px' }"
            @click="spotlightMe"
            :disabled="spotLight && !!leader"
          >
            Spotlight me
          </Button>
        </div>
      </template>
      <div
        class="portrait"
        :style="{ background: randomHexColor(currentUser.id) }"
      >
        {{ currentUser?.userName.charAt(0).toUpperCase() }}
      </div>
    </Popover>
    <div
      v-if="(leader && leader.id !== currentUser.id) || (leader && sessionCreatorId === currentUser.id)"
      class="leader-wait"
      :style="{ background: leader.id !== currentUser.id ? randomHexColor(leader.id) : '#923094' }"
    >
      <div class="tip-des">{{ screenSyncTip }}</div>
      <div
        class="event-btn"
        @click="leaderStopScreenSync"
      >
        {{ !!leader && leader.id === currentUser.id && currentFollowersNum === 0 ? 'Cancel' : 'Stop' }}
      </div>
    </div>
    <Modal
      :title="lang.dialogTitle"
      :open="switchVisible"
      @cancel="() => { switchVisible = false; spotLight = false; }"
      centered
    >
      <template #footer>
        <Button key="Continue" type="primary" @click="switchContinue">
          Continue
        </Button>
      </template>
      <div class="collab-modal-wrap">
        <div>
          {{ !!leader && (leader.id === currentUser.id ? 'You are currently spotLight' : `You are currently following ${leader.userName}`) }},
          do you want to switch to {{ !spotLight ? switchFollower && `follow ${switchFollower.userName}` : 'Spotlight me' }}?
        </div>
      </div>
    </Modal>
    <Modal
      :title="lang.cancelScreenSync"
      :open="cancelScreenSyncVisible"
      @cancel="() => {cancelScreenSyncVisible = false}"
      centered
    >
      <template #footer>
        <Button key="Continue" type="primary" @click="() => { cancelScreenSyncVisible=false; leaveScreenSyncSession(); }">
          Ok
        </Button>
      </template>
      <div class="collab-modal-wrap">
        {{ lang.stopSpotlighting }}
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, watchEffect, watch, h, toRaw } from 'vue';
import { Button, message, Modal, notification, Popover } from 'ant-design-vue';
import './ScreenSync.less';
import { lang } from '../../locales';
import {
  storageGetItem,
  storageRemoveItem,
  storageSetItem,
  randomHexColor,
} from '../../utils/utils';
import {
  onFollowingStatus,
} from '../../utils/collab-utils';
import { PUBLIC_PATH } from '../../config';
import MemberInfo from './MemberInfo.vue';
import InviteNotify from './InviteNotify.vue';
import { currentUser } from '@/store/user';

const props = defineProps({
  eventData: Object,
  onlineMembers: Array,
  collaboration: Object,
});
const collaboration = ref(null);
const frontOnlineMembers = ref([]);
const remainOnlineMembers = ref([]);
const switchFollower = ref(null);
const switchVisible = ref(false);
const isInScreenSync = ref(false);
const popoverVisible = ref(false);
const showPopover = ref(null);
const spotLight = ref(false);
const isWaitInvited = ref(false);
const cancelScreenSyncVisible = ref(false);
const sessionCreatorId = ref(null);
const screenSyncSession = ref(null);
const currentFollowersNum = ref(0);
const leader = ref(null);
const screenSyncTip = ref('Waiting for followers...');

watch(() => props.eventData, async () => {
  if (!props.eventData || !collaboration.value) return;
  const { action, actionData } = props.eventData;
  if (action === 'screen-sync-created') {
    isWaitInvited.value = true;
    notification.open({
      message: null,
      key: actionData.screenSyncId,
      description: ()=>h(InviteNotify, {
        leaderName: actionData.leader.user_name,
        accept: () => acceptInvited(actionData),
        reject: () => rejectInvited(actionData),
      }),
      placement: "top",
      top: 130,
      duration: null,
      class: "request-wrap",
    });
    return;
  }
  if (action === 'screen-sync-member-joined') {
    if (!screenSyncSession.value) {
      let screenSync = await collaboration.value.getScreenSync(actionData.screenSyncId);
      storageSetItem(localStorage, 'screenSyncId', actionData.screenSyncId);
      screenSyncSession.value = screenSync;
      onListeningScreenSyncMember();
    } else {
      onListeningScreenSyncMember();
    }
    sessionCreatorId.value = actionData.creatorId;
  }
  if (action === 'screen-sync-member-leave') {
    onListeningScreenSyncMember();
    return;
  }
  if (action === 'screen-sync-stopped') {
    restoreCurrentScreenSync();
    onFollowingStatus(false);
    return;
  }
  if (action === 'delete-members') {
    if (actionData.length === 0) {
      if (screenSyncSession.value) {
        await screenSyncSession.value.leave();
      }
      window.location.href = PUBLIC_PATH;
    }
    return;
  }
}, { immediate: true });

watch(() => props.collaboration, async () => {
  if (collaboration.value && collaboration.value.id !== toRaw(props.collaboration).id) {
    leaveScreenSyncSession();
  }
  collaboration.value = toRaw(props.collaboration);
}, { immediate: true });

watch(() => props.onlineMembers, () => {
  let onlineMembers = props.onlineMembers.filter((member) => {
      return member.id !== currentUser.value?.id;
    });
  if (onlineMembers.length <= 3) {
    frontOnlineMembers.value = onlineMembers;
    remainOnlineMembers.value = [];
  } else {
    frontOnlineMembers.value = onlineMembers.slice(0, 3);
    remainOnlineMembers.value = onlineMembers.slice(3, onlineMembers.length);
  }
  if (leader.value) {
    let leaderIsOnline = props.onlineMembers.filter((user) => {
      return user.id === leader.value.id;
    });
    if (leaderIsOnline.length == 0) {
      leaveScreenSyncSession();
    }
  }
});

watchEffect(async () => {
  if (toRaw(props.collaboration)) {
    const currentMember = await toRaw(props.collaboration).getCurrentUser();
    if (currentMember.isInScreenSync) {
      let screenSyncId = storageGetItem(localStorage, 'screenSyncId');
      if (!screenSyncId) return;
      try {
        let screenSync = await toRaw(props.collaboration).getScreenSync(screenSyncId);
        await screenSync.leave();
      } catch (error) {
        if (error.ret === 404) {
          storageRemoveItem(localStorage, 'screenSyncId');
        }
      }
    }
  }
}, { immediate: true });

const leaderStopScreenSync = () => {
  if(!!leader && leader.value.id === currentUser.value.id && currentFollowersNum.value === 0){
    cancelScreenSyncVisible.value=true
  }else{
    leaveScreenSyncSession();
  }
};

const acceptInvited = async (actionData) => {
  try {
    let screenSync = collaboration.value && await collaboration.value.getScreenSync(actionData.screenSyncId);
    if (screenSyncSession.value) {
      try {
        await leaveScreenSyncSession();
      } catch (ex) {
        if (ex && ex.ret === 404) {
          // WEBPDFRD-10107
          // 如果受邀跟随的用户B跟随了C，之前有跟随A。刚好A也跟随了C。
          // 这时候A会先取消自己发出的跟随，导致B取消A的跟随的时候404了。
        }
      }
    }
    screenSync.join();
    screenSyncTip.value = `Spotlighting on ${actionData.leader.user_name}...`;
    storageSetItem(localStorage, 'screenSyncId', actionData.screenSyncId);
    screenSyncSession.value = screenSync;
    isInScreenSync.value = true;
    isWaitInvited.value = false;
    notification.destroy();
  } catch (error) {
    isWaitInvited.value = false;
    if (error.ret === 404) {
      message.error(error.message);
      notification.close(actionData.screenSyncId);
    }
  }
};

const rejectInvited = async (actionData) => {
  isWaitInvited.value = false;
  notification.close(actionData.screenSyncId);
};

const onListeningScreenSyncMember = async () => {
  if (!screenSyncSession.value) return;
  let leaderInfo = await screenSyncSession.value.getMembers('leader');
  let members = await screenSyncSession.value.getMembers('follower');
  leader.value = leaderInfo[0];
  if (leaderInfo[0].id === currentUser.value.id) {
    currentFollowersNum.value = members.length;
    if (members.length > 0) {
      screenSyncTip.value = `${members.length} followers`;
    } else {
      screenSyncTip.value = 'Waiting for followers...';
    }
  } else {
    onFollowingStatus(true, leaderInfo[0].id);
  }
};

const restoreCurrentScreenSync = () => {
  screenSyncSession.value = null;
  onFollowingStatus(false);
  leader.value = null;
  spotLight.value = false;
  currentFollowersNum.value = 0;
  sessionCreatorId.value = null;
  screenSyncTip.value = 'Waiting for followers...';
  isInScreenSync.value = false;
  storageRemoveItem(localStorage, 'screenSyncId');
};

const FollowMemberFn = async (user) => {
  try {
    let screenSyncInfo = await user.getScreenSyncInfo();
    let screenSync = await collaboration.value.getScreenSync(screenSyncInfo.id);
    screenSyncSession.value = screenSync;
    await screenSync.join();
    sessionCreatorId.value = currentUser.value.id;
    switchVisible.value = false;
    isInScreenSync.value = true;
    screenSyncTip.value = `Following ${user.userName} ...`;
    storageSetItem(localStorage, 'screenSyncId', screenSyncInfo.id);
    popoverVisible.value = false;
    if (isWaitInvited.value) {
      notification.destroy();
      isWaitInvited.value = false;
    }
  } catch (error) {
    if (error.ret === 403) {
      message.error(lang.followEachOthor);
    } else {
      message.error(lang.followScreenSyncFailed);
    }
  }
};

const createSpotlight = async () => {
  try {
    let screenSync = await toRaw(collaboration.value).createScreenSync();
    sessionCreatorId.value = currentUser.value.id;
    screenSyncSession.value = screenSync;
    leader.value = currentUser.value;
    switchVisible.value = false;
    screenSyncTip.value = 'Waiting for followers...';
    isInScreenSync.value = true;
    popoverVisible.value = false;
    spotLight.value = true;
    storageSetItem(localStorage, 'screenSyncId', screenSync.id);
    if (isWaitInvited.value) {
      notification.destroy();
      isWaitInvited.value = false;
    }
  } catch (error) {
    message.error(lang.createScreenSyncFailed);
  }
};

const spotlightMe = () => {
  spotLight.value = true;
  if (isInScreenSync.value) {
    switchVisible.value = true;
  } else {
    createSpotlight();
  }
};

const switchFollowerFn = async (member) => {
  spotLight.value = false;
  if (isInScreenSync.value) {
    switchFollower.value = member;
    switchVisible.value = true;
  } else {
    FollowMemberFn(member);
  }
};

const switchContinue = async () => {
  if (leader.value) {
    await leaveScreenSyncSession();
  }
  if (spotLight.value) {
    createSpotlight();
  } else {
    FollowMemberFn(switchFollower.value);
  }
};

const leaveScreenSyncSession = async () => {
  if (!screenSyncSession.value) return;
  let isLeaved = await screenSyncSession.value.leave();
  if (isLeaved) {
    restoreCurrentScreenSync();
  }
};

const handleOpenChange = (visible, member) => {
  if (visible) {
    showPopover.value = member.id;
  } else {
    showPopover.value = null;
  }
  popoverVisible.value = visible;
};
</script>
