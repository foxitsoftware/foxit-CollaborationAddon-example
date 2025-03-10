import { Collaboration } from "@foxitsoftware/web-collab-client";
import { ref } from "vue";

const collaboration = ref<Collaboration | null>(null);

const setCollaboration = (collaborationValue: Collaboration | null) => {
  collaboration.value = collaborationValue;
};

export { collaboration, setCollaboration };
