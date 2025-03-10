import { ref } from "vue";
import { WebCollabClient } from "@foxitsoftware/web-collab-client";

const collabClient = ref<WebCollabClient | null>(null);
const setCollabClient = (collabClientVal: WebCollabClient | null) => {
  collabClient.value = collabClientVal;
};

export { collabClient, setCollabClient };
