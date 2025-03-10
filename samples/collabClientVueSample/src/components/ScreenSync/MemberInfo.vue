<template>
  <div class="member-info">
    <div class="portrait" :style="{ background: randomHexColor(member.id) }">
      {{ member.userName.charAt(0).toUpperCase() }}
    </div>
    <div class="nickName" :title="member.userName">
      {{ member.userName }}
    </div>
    <div v-if="typeof member.isAllowComment === 'boolean'" class="comment">
      {{ member.isAllowComment ? 'Can Comment' : 'Can View' }}
    </div>
    <div v-else class="currentName">[YOU]</div>
  </div>
</template>

<script setup>
import { randomHexColor } from '../../utils/utils';

const props = defineProps({
  member: {
    type: Object,
    required: true
  }
});
</script>

