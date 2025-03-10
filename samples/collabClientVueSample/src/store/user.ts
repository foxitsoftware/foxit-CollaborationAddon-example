import { ref } from "vue";
import { type UserId } from "../types";

type User = {
  id: UserId;
  [key: string]: any;
};

const currentUser = ref<User | null>(null);
const setCurrentUser = (currentUserVal: User | null) => {
  currentUser.value = currentUserVal;
};
export { currentUser, setCurrentUser };
