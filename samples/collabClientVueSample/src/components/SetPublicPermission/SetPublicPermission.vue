<template>
  <Dropdown placement="bottom" trigger="['click']">
    <template #overlay>
        <Menu @click="handleClick">
          <MenuItem key="NoAnyone">
            <div class="drop-title drop-item">
              Only people invited to this file
              <img class="permission-icon" :src=lockIcon />
              <img v-if="props.isPublic === 'NoAnyone'" class="arrow-icon" :src=checkIcon />
            </div>
          </MenuItem>
          <MenuItem key="Anyone">
            <div class="drop-title drop-item">
              Anyone with the link
              <img class="permission-icon" :src=unlockIcon />
              <img v-if="props.isPublic === 'Anyone'" class="arrow-icon" :src=checkIcon />
            </div>
          </MenuItem>
        </Menu>
      </template>
    <div class="drop-wrap">
      <div class="drop-title">
        {{ isPublic === 'Anyone' ? 'Anyone with the link' : 'Only people invited to this file' }}
        <img class="permission-icon" :src="isLockImgIcon()" />
        <img class="arrow-icon" :src=bottomArrow />
      </div>
    </div>
  </Dropdown>
</template>

<script setup>
import { Menu, MenuItem, Dropdown } from 'ant-design-vue';
import bottomArrow from 'assets/icon/bottom-arrow.svg';
import checkIcon from 'assets/icon/check-icon.svg';
import lockIcon from 'assets/icon/lock-icon.svg';
import unlockIcon from 'assets/icon/unlock-icon.svg';
import './SetPublicPermission.less';

const props = defineProps({
  isPublic: String,
  setPublicPermissionFn: Function
});

const isLockImgIcon = () => {
  return props.isPublic === 'NoAnyone' ? lockIcon : unlockIcon;
};

const handleClick = ({ key }) => {
  props.setPublicPermissionFn(key);
};
</script>
