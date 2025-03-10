<template>
  <Dropdown placement="bottom" trigger="['click']" :disabled="props.dropDisabled">
    <template #overlay>
        <Menu @click="handleClick">
          <MenuItem key="Comment">
            <div :class="[props.isParticipantsUse ? 'annot-participants-drop-title' : '', 'annot-drop-title drop-item']">
              Can Comment
              <img v-if="props.isComment === 'Comment'" :class="[props.isParticipantsUse ? 'annot-participants-check-icon' : '' , 'annot-arrow-icon']" :src=checkIcon />
            </div>
          </MenuItem>
          <MenuItem key="View">
            <div :class="[props.isParticipantsUse ? 'annot-participants-drop-title' : '', 'annot-drop-title drop-item']">
              Can View
              <img v-if="props.isComment === 'View'" :class="[props.isParticipantsUse ? 'annot-participants-check-icon' : '' , 'annot-arrow-icon']" :src=checkIcon />
            </div>
          </MenuItem>
        </Menu>
      </template>
    <div class="annot-drop-wrap" :style="{ opacity: props.dropDisabled ? '0.6' : '1' }">
      <div :class="props.isParticipantsUse ? 'annot-drop-title annot-participants-drop-title' : 'annot-drop-title'">
        {{ isComment === 'Comment' ? 'Can Comment' : 'Can View' }}
        <img :class="props.isParticipantsUse ? 'annot-arrow-icon annot-participants-arrow-icon' : 'annot-arrow-icon'" :src="bottomArrow" />
      </div>
    </div>
  </Dropdown>
</template>

<script setup>
import { Menu, MenuItem, Dropdown } from 'ant-design-vue';
import bottomArrow from 'assets/icon/bottom-arrow.svg';
import checkIcon from 'assets/icon/check-icon.svg';
import './SetCommentPermission.less';

const props = defineProps({
  setCommentPermission: Function,
  isParticipantsUse: Boolean,
  isComment: String,
  dropDisabled: Boolean
});

const handleClick = ({ key }) => {
  props.setCommentPermission(key);
};

</script>
