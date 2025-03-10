import { ref } from "vue";

const isLoading = ref<Boolean>(false);

const setIsLoading = (isLoadingVal: boolean) => {
  isLoading.value = isLoadingVal;
};

export { isLoading, setIsLoading };
