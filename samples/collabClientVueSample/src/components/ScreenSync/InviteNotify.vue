<template>
  <div class="leader-invite-wrap">
    <div class="tip-des">{{ leaderName }} invites you to follow</div>
    <div class="event-btn" @click="props.accept">Accept</div>
    <div class="event-btn" @click="props.reject">Reject</div>
  </div>
</template>

<script setup>
const props = defineProps({
  leaderName: String,
  accept: Function,
  reject: Function
});
</script>