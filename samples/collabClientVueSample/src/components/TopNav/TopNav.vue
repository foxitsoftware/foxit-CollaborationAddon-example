<template>
  <div class="collabView-wrap">
    <Row justify="space-between">
      <Col>
      <FileList v-if="!isParticipant" :openFile :openCollaboration />
      </Col>
      <Col v-if="isCollabMode">
      <div class="fileName-wrap">
        <div class="fileName">{{ currentCollaboration?.docName }}</div>
        <div v-if="isParticipant" class="participant-permission">
          {{ canComment ? '(Can Comment)' : '(Can View)' }}
        </div>
      </div>
      </Col>
      <Col>
      <div class="operation-wrap">
        <template v-if="isCollabMode">
          <ScreenSync v-if="onlineMembers && currentCollaboration" :onlineMembers :eventData="collaborationEventData" :collaboration="currentCollaboration"/>
          <CreatorOperationModal v-if="!isParticipant" :collaborationMembers
            :invitedMembers="getCollaborationMembers" />
          <ParticipantOperationPopover v-else :collaborationMembers>
            <div class="share-popover">
              <img :src="shareMembersIcon" />
              Share
            </div>
          </ParticipantOperationPopover>
        </template>
        <CreateCollaboration v-if="!isParticipant && chooseFile && !isCollabMode" :pdfDocPermission :openDocFailed
          :createCollab />
        <div v-if="isParticipant && isShowLogin" class="login-btn-wrap"></div>
      </div>
      </Col>
    </Row>
    <CollaborationModal :passwordVisible="passwordPopupVisible" :closePasswordPopup :submitPassword
      :collaborationEndedPopup />
    <ParticipantModal v-if="isParticipant" :permissionChangeVisible :isShowNoPermissionPopup :isShowLogin />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, toRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Row, Col, message } from 'ant-design-vue';
import Driver from 'driver.js';
import 'driver.js/dist/driver.min.css';
import shareMembersIcon from 'assets/icon/share-members.svg';
import { lang } from '../../locales';
import {
  createDeferred,
  storageGetItem,
} from '../../utils/utils';
import {
  collabCreatorSteps,
  collabParticipantSteps,
  isParticipantView,
  stepOption,
} from '@/utils/collab-utils';
import FileList from '../FileList/FileList.vue';
import ScreenSync from '../ScreenSync/ScreenSync.vue';
import CreateCollaboration from '../CreateCollaboration/CreateCollaboration.vue';
import CreatorOperationModal from '../CreatorOperationModal/CreatorOperationModal.vue';
import CollaborationModal from '../CollaborationModal/CollaborationModal.vue';
import { serverUrl } from '../../config';
import ParticipantOperationPopover from '../ParticipantOperationPopover/ParticipantOperationPopover.vue';
import ParticipantModal from '../ParticipantModal/ParticipantModal.vue';
import { setIsLoading } from '@/store/isLoading';
import { collaboration as currentCollaboration, setCollaboration } from '@/store/collaboration';
import { collabClient } from '@/store/webCollabClient';
import { DocEvent } from '../../types';
import './TopNav.less';

const props = defineProps({
  pdfViewer: Object,
  setPermissionByParticipant: Function,
  pdfDocPermission: Object
})

let passwordDefered = createDeferred();

const stepDriver = ref(new Driver(stepOption));
const isFirstVisit = ref(true);
const passwordPopupVisible = ref(false);
const isShowLogin = ref(false);
const isShowNoPermissionPopup = ref(false);
const permissionChangeVisible = ref(false);
const collaborationEventData = ref(null);
const isCollabMode = ref(false);
const canComment = ref(false);
const chooseFile = ref(null);
const password = ref('');
const onlineMembers = ref([]);
const openDocFailed = ref(false);
const isCollaborationBegin = ref(false);
const openFailedDocInfo = ref(null);
const collaborationEndedPopup = ref(false);
const collaborationMembers = ref([]);
const isParticipant = computed(() => isParticipantView(route))
const route = useRoute();
const router = useRouter();

async function getCollaboration() {
  const searchParams = new URLSearchParams(window.location.search);
  let collaborationId = searchParams.get('collaborationId');
  let collaboration;
  if (collaborationId && collabClient.value) {
    try {
      collaboration = await toRaw(collabClient.value).getCollaboration(collaborationId);
    } catch (error) {
      setIsLoading(false);
      //Whether the collaboration cannot be found
      if (error.ret === 404) {
        collaborationEndedPopup.value = true;
        return;
      }
      //If access is not available, show the login interface
      if (error.ret === 403) {
        isShowNoPermissionPopup.value = true;
        return;
      }
    }
  }
  return collaboration;
}

onMounted(() => {
  getCollaboration().then((collaboration) => {
    if (collaboration) {
      beginCollaboration(collaboration);
    }
    if (isParticipant.value) {
      let participantName = storageGetItem(localStorage, 'participantName');
      if (!participantName) {
        isShowLogin.value = true;
      }
    }
  });
});

//get participant comment permission from the collaboration.
const getParticipantPermission = async (collaboration) => {
  let permissionApi = await collaboration.getPermission().catch(() => {
    message.error(lang.getPermissionError);
    return;
  });
  let isAllowComment = await permissionApi.isAllowComment();
  canComment.value = isAllowComment;
  props.setPermissionByParticipant(isAllowComment);
};

//start the driver step
const startDriver = (role) => {
  // Define the steps for introduction
  stepDriver.value.defineSteps(role);
  // Start the introduction
  stepDriver.value.start();
}

//open local file by websdk
const openFile = async (fileInfo) => {
  if (!props.pdfViewer) {
    throw new Error('PdfViewer init fail');
  }
  let pathname = route.name;
  router.push({ name: pathname });
  setIsLoading(true);
  isCollabMode.value = false;
  chooseFile.value = fileInfo;
  let filePath = fileInfo.path;
  if (filePath.indexOf('http') === -1) {
    filePath = `${serverUrl}${fileInfo.path}`;
  }
  try {
    let openSuccess = await props.pdfViewer.openPDFByHttpRangeRequest(
      {
        range: {
          url: filePath,
        },
      },
      { fileName: fileInfo.name }
    );
    if (openSuccess) {
      setIsLoading(false);
      isCollaborationBegin.value = false;
      openDocFailed.value = false;
      setCollaboration(null);
      if (isFirstVisit.value) {
        startDriver(collabCreatorSteps);
        isFirstVisit.value = false;
      }
    }
  } catch (errorResponse) {
    setIsLoading(false);
    if (errorResponse?.error === 3) {
      passwordPopupVisible.value = true;
      openFailedDocInfo.value = errorResponse.pdfDoc;
    } else {
      message.error(lang.openFailed);
      openDocFailed.value = true;
    }
  }
};
const closePasswordPopup = () => {
  passwordPopupVisible.value = false;
  openDocFailed.value = true;
  openFailedDocInfo.value = null;
  isCollaborationBegin.value = false;
  passwordDefered = createDeferred();
  setIsLoading(false);
};
//Verify the encrypted document password
const submitPassword = async (password) => {
  if (isCollaborationBegin.value) {
    passwordDefered.resolve(password);
    return;
  }
  await props.pdfViewer
    .reopenPDFDoc(openFailedDocInfo.value, {
      password,
    })
    .then(() => {
      isCollaborationBegin.value = false;
      passwordPopupVisible.value = false;
      password.value = password;
      openDocFailed.value = false;
      openFailedDocInfo.value = null;
    })
    .catch(() => {
      message.error(lang.passwordError);
    });
};
//Create Collaboration
const createCollab = async () => {
  setIsLoading(true);
  let chooseFileUrl = chooseFile.value.path;
  if (chooseFileUrl.indexOf('http') === -1) {
    chooseFileUrl = `${serverUrl}${chooseFileUrl}`;
  }
  try {
    let collaboration = collabClient.value && await toRaw(collabClient.value).createCollaboration({
      fileUrl: chooseFileUrl,
      isDocPublic: true,
      docName: chooseFile.value.name,
    });
    if (collaboration) {
      beginCollaboration(collaboration);
    }
  } catch (err) {
    message.error(err.message || lang.collabOpenFailed);
    setIsLoading(false);
  }
};
const openCollaboration = async (collaborationId) => {
  setIsLoading(true);
  let collaboration = collabClient.value && await toRaw(collabClient.value).getCollaboration(collaborationId);
  if (collaboration) {
    beginCollaboration(collaboration);
  }
};
//begin Collaboration
const beginCollaboration = async (collaboration) => {
  props.pdfViewer && (await props.pdfViewer.close());
  //begin collaboration and Subscription notification event
  setCollaboration(collaboration);
  if (collaboration) {
    await subscribeCollaborationEvent(collaboration);
  }
  try {
    let isBeginSuccess;
    if (password.value) {
      isBeginSuccess = await collaboration.begin({ password: password.value });
    } else {
      isBeginSuccess = await collaboration.begin();
    }
    if (isBeginSuccess) {
      await beginCollaborationSuccess(collaboration);
    }
  } catch (error) {
    setIsLoading(false);
    encryptedDocumentHandle(error, collaboration);
  }
};
const encryptedDocumentHandle = async (e, collaboration) => {
  passwordDefered = createDeferred();
  if (e.error === 3) {
    passwordPopupVisible.value = true;
    openFailedDocInfo.value = e.pdfDoc;
    isCollaborationBegin.value = true;

    let passwordValue = await passwordDefered.promise;
    if (passwordValue) {
      try {
        await collaboration.begin({ password: passwordValue });
        beginCollaborationSuccess(collaboration);
      } catch (error) {
        if (error.message === 'Permission error') {
          message.error('please use a owner password to join the collaboration');
          props.pdfViewer && props.pdfViewer.close();
          error.error = 3;
        } else {
          message.error(lang.passwordError);
        }
        encryptedDocumentHandle(error, collaboration);
      }
    }
  } else {
    message.error(lang.collabOpenFailed);
    passwordDefered.resolve(false);
  }
};
const beginCollaborationSuccess = async (collaboration) => {
  let pathname = router.currentRoute.value.path;
  router.push(pathname + '?collaborationId=' + collaboration.id);
  passwordDefered = createDeferred();
  passwordPopupVisible.value = false;
  isCollabMode.value = true;
  isCollaborationBegin.value = false;
  openFailedDocInfo.value = null;
  password.value = '';
  if (isParticipant.value) {
    // get collaboration again to check if collaboration has been deleted by owner
    await getCollaboration();
    await getParticipantPermission(collaboration);
    startDriver(collabParticipantSteps)
  }

  // get online members once collaboration begin
  const members = await collaboration.getOnlineMembers();
  onlineMembers.value = members;

  // @ts-ignore
  let app = (window.app = window.app || {});
  let state = (app.state = app.state || {});
  state.curCollaboration = collaboration;
};
//Subscription notification event
const subscribeCollaborationEvent = async (collaboration) => {
  await collaboration.on(DocEvent.onlineStatusChanged, async (actionData, action) => {
    if (
      action === 'screen-sync-created' ||
      action === 'screen-sync-member-joined' ||
      action === 'screen-sync-member-leave' ||
      action === 'screen-sync-stopped'
    ) {
      collaborationEventData.value = {
        actionData,
        action,
      };
      return;
    }
    if (action === 'delete-members') {
      collaborationEventData.value = {
        actionData,
        action,
      };
      if (isParticipant.value && actionData.length === 0) {
        return;
      }
    }
    if (action === 'member-online' || action === 'member-offline') {
      let members = await collaboration.getOnlineMembers();
      onlineMembers.value = members;
    }
    if (!isParticipant.value && action === 'member-offline') {
      if (actionData.length > 0) {
        if (actionData[0].userName.includes('tourist')) {
          collaboration.removeMembers(actionData);
        }
      }
    }
    if (action === 'delete-share') {
      collaborationEndedPopup.value = true;
      return;
    }
    if (action === 'edit-members') {
      permissionChangeVisible.value = true;
      return;
    }

    if (action === 'network-connection-down') {
      message.error('Lost connection with the server.');
      return;
    }

    if (action === 'network-connection-up') {
      message.success('Re-established connection with the server.');
      return;
    }
    if (action === 'page-measure-scale-sync') {
      console.log('page-measure-scale-changed', actionData);
      return;
    }
    getCollaborationMembers(collaboration);
  });
};
//Update the collaboration members
const getCollaborationMembers = async (collaboration) => {
  let collaborationInstance = collaboration ? collaboration : toRaw(currentCollaboration.value);
  if (collaborationInstance) {
    try {
      let collabMembers = await collaborationInstance.getMembers();
      collaborationMembers.value = collabMembers;
    } catch {
      message.error(lang.getMembersError);
    }
  }
};
</script>
