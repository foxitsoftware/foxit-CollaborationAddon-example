<template>
  <div>
    <Popover placement="right">
      <template #content>
        <span>File List</span>
      </template>
      <img :src=moreIcon class="more-option" @click="setVisible(true)" />
    </Popover>
    <Modal :title="lang.dialogTitle" v-model:open="visible" :footer="null" width="840px" centered :zIndex="1510">
      <div class="files-wrap">
        <Tabs v-model:activeKey="tabKey" tabPosition="left">
          <TabPane key="ShareList" tab="Share list">
            <div class="share-list-wrap">
              <Table class="share-list" :dataSource="collabList" :columns="shareListColumns">
                <template #bodyCell="{ column, record }">
                  <div v-if="column.key === 'id'">
                    <Button v-if="collaborationId !== record.id" @click="startCollaboration(record)">
                      Start collaboration
                    </Button>
                    <div v-else class="tab-item-active">
                      Current Collaboration
                    </div>
                  </div>
                  <div v-else :class="[collaborationId === record.id ? 'tab-item-active' : '', 'tab-list-time']">
                    {{ record[column.key] }}
                  </div>
                </template>
              </Table>
            </div>
          </TabPane>
          <TabPane key="fileList" tab="File list">
            <div class="share-list-wrap">
              <List itemLayout="horizontal" size="small" class="share-list" :dataSource="fileList">
                <template #renderItem="{ item }">
                  <div class="tab-list">
                    <div :title="item.name"
                      :class="[activeFile !== item.name ? '' : 'tab-item-active', 'tab-list-des']">
                      {{ item.name }}
                    </div>
                    <Button @click="openLocalFile(item)">
                      Open
                    </Button>
                  </div>
                </template>
              </List>
            </div>
          </TabPane>
        </Tabs>
        <div class="upload-wrap">
          <Upload name="file" v-if="tabKey === 'fileList'" :showUploadList="false" accept=".pdf"
            :action="serverUrl + '/api/files/upload?username=' + currentUser?.userName || 'anon_user'"
            :beforeUpload @change="handleChange">
            <div class="upload-btn">Upload file</div>
          </Upload>
        </div>
      </div>
    </Modal>
    <Modal :zIndex="10000" :title=lang.dialogTitle v-model:open="sameFileVisible" :footer="null" :closable=false
      class='passwordPopup' width="360px" centered>
      <div class="login-password-wrap">
        <div>{{ lang.Component.fileExistTip }}</div>
        <div class="bottom-btn password-footor">
          <Button class="to-login" @click="sureBtn">Ok</Button>
          <Button class="cancel-btn" @click="cancelTipPopup">Cancel</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, watchEffect, toRaw } from 'vue';
import { Popover, Tabs, List, Table, Button, Modal, message, Upload } from 'ant-design-vue';
import moreIcon from 'assets/icon/more-icon.svg';
import { lang } from '../../locales';
import { serverUrl } from '../../config';
import { createDeferred, formatTime, storageGetItem, storageRemoveItem } from '../../utils/utils';
import { localDocList } from '../../utils/collab-utils';
import { currentUser } from '@/store/user';
import { collabClient } from '@/store/webCollabClient';
import { getLocalDocList } from '../../service/api';
import { isLoading, setIsLoading } from '@/store/isLoading';
import './FileList.less';

const { TabPane } = Tabs;

let passwordDefered = createDeferred();

const props = defineProps({
  openFile: Function,
  openCollaboration: Function,
});

const collaborationId = ref('');
const visible = ref(false);
const tabKey = ref('fileList');
const fileList = ref([]);
const collabList = ref([]);
const activeFile = ref('');
const sameFileVisible = ref(false);

const shareListColumns = [
  {
    title: 'Name',
    dataIndex: 'docName',
    key: 'docName',
  },
  {
    title: 'Created Time',
    dataIndex: 'createdAt',
    key: 'createdAt',
  },
  {
    title: '',
    dataIndex: 'id',
    key: 'id',
  },
];

watchEffect(() => {
  if (visible.value) {
    if (tabKey.value !== 'fileList') {
      getCollaborationList()
    }
    const searchParams = new URLSearchParams(window.location.search);
    let collabId = searchParams.get('collaborationId');
    collaborationId.value = collabId || '';
  }
})

const setVisible = (value) => {
  visible.value = value;
};

const getCollaborationList = async () => {
  let collaborations = collabClient.value ? await toRaw(collabClient.value).getCollaborationList() : [];
  collabList.value = collaborations.map((item) => {
    return {
      docName: item.docName,
      createdAt: formatTime(item.createdAt),
      id: item.id
    }
  });
}

const beforeUpload = async file => {
  passwordDefered = createDeferred();
  const uploadedfiles = fileList.value.map((item) => {
    return item.name
  })
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    message.error(lang.Component.fileMoreThen50M);
    return false
  } else {
    if (uploadedfiles.indexOf(file.name) !== -1) {
      sameFileVisible.value = true
      let result = await passwordDefered.promise
      if (!result) {
        return false
      }
    } else {
      return true
    }
  }
};

const handleChange = (info) => {
  let loading = isLoading;
  if (info.file.status && info.file.status === 'uploading') {
    loading = true;
  }
  if (info.file.status && info.file.status === 'done') {
    loading = false;
    getList();
    message.success(lang.Component.uploadedSuccess);
  } else if (info.file.status && info.file.status === 'error') {
    loading = false;
    message.error(lang.Component.fileuploadFailed);
  }
  setIsLoading(loading);
}

const getList = async () => {
  let files = [...localDocList];
  let result = await getLocalDocList(currentUser.value.userName || 'anon_user').catch(() => {
    message.error(lang.Component.getFileFailed);
  })
  if (result) {
    files = [...localDocList, ...result]
  }
  fileList.value = files;
  return files;
}

const openLocalFile = (fileInfo) => {
  if (storageGetItem(localStorage, 'collaborationId')) {
    storageRemoveItem(localStorage, 'collaborationId');
  }
  props.openFile(fileInfo)
  activeFile.value = fileInfo.name;
  visible.value = false;
}

const cancelTipPopup = () => {
  passwordDefered.resolve(false)
  sameFileVisible.value = false
}
const sureBtn = () => {
  passwordDefered.resolve(true)
  sameFileVisible.value = false
}

const startCollaboration = (item) => {
  props.openCollaboration(item.id)
  setVisible(false)
}


watchEffect(async () => {
  let files = await getList();
  const searchParams = new URLSearchParams(window.location.search);
  let collabId = searchParams.get('collaborationId');
  if (collabId) {
    collaborationId.value = collabId
    return;
  }
  //Open the doc by default and record the selected doc
  let defauleDoc = files[0]
  props.openFile(defauleDoc)
  activeFile.value = defauleDoc.name
}, {immediate: true});
</script>