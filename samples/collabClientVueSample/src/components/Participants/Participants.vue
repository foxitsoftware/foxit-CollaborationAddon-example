<template>
  <div class="participants-wrap">
    <div class="title">Participants</div>
    <div class="participant-list-wrap">
      <div v-for="item in collabMembers" :key="item.id" class="participant-list">
        <div
          class="portrait"
          :style="item.lastRead === 'null' ? { background: '#ccc' } : { background: randomHexColor(item.id) }"
        >
          {{ item.userName.charAt(0).toUpperCase() }}
        </div>
        <div
          class="nickName"
          :title="item.userName"
          :style="item.lastRead === 'null' ? { color: '#ccc' } : { color: '#333333' }"
        >
          {{ item.userName }}
        </div>
        <div v-if="item.id === collaboration?.authorId" class="comment owner-des">[Owner]</div>
        <div v-else-if="currentUser.id === item.id" class="comment owner-des">[You]</div>
        <div v-else-if="props.isShowPermissionDrop" class="comment-wrap">
          <SetCommentPermission
            :isComment="item.isAllowComment ? 'Comment' : 'View'"
            :isParticipantsUse="true"
            :setCommentPermission="key => setAnnotPermission(key, item)"
          />
        </div>
        <div v-else class="comment owner-des">
          {{ item.isAllowComment ? 'Can Comment' : 'Can View' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, toRaw } from 'vue';
import { message } from 'ant-design-vue';
import { lang } from '../../locales';
import { collaboration } from '@/store/collaboration';
import { currentUser } from '@/store/user';
import { randomHexColor } from '../../utils/utils';
import SetCommentPermission from '../SetCommentPermission/SetCommentPermission.vue';
import './Participants.less';

const props = defineProps({
  collaborationMembers: Array,
  isShowPermissionDrop: Boolean,
});

const collabMembers = ref([]);

onMounted(() => {
  getDocMembers();
});

watchEffect(() => {
  if (props.collaborationMembers) {
    collabMembers.value = props.collaborationMembers;
  }
});

const getDocMembers = async () => {
  try {
    const members = collaboration.value && await toRaw(collaboration.value)?.getMembers();
    collabMembers.value = members;
  } catch {
    message.error(lang.getMembersError);
  }
};

const setAnnotPermission = async (key, item) => {
  const members = [
    {
      id: item.id,
      isAllowComment: key === 'Comment',
    },
  ];
  if (collaboration.value) {
    try {
      const isUpdated = await toRaw(collaboration.value).updateMemberPermission(members);
      if (isUpdated) {
        getDocMembers();
      } else {
        message.error(lang.CollabAuthor.permissionSetError);
      }
    } catch {
      message.error(lang.CollabAuthor.permissionSetError);
    }
  }
};
</script>
