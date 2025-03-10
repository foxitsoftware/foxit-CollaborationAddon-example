<script setup>
import { ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';
import {
    WebCollabClient,
    LoggerFactory,
} from '@foxitsoftware/web-collab-client';
import TopNav from '../../components/TopNav/TopNav.vue';
import PDFViewer from '../../components/PDFViewer/PDFViewer.vue';
import { PUBLIC_PATH, serverUrl } from '../../config';
import {
    creatorLogin,
    isParticipantView,
    participantLogin,
    updatePdfViewerByPermission,
} from '../../utils/collab-utils';
import { setIsLoading } from '@/store/isLoading';
import { collabClient, setCollabClient } from '@/store/webCollabClient';
import { currentUser, setCurrentUser } from '@/store/user';
import { getUser, loginAnonymously } from '@/service/api';

const pdfDocPermission = ref(null);
const pdfui =  ref(null);
const pdfViewer = ref(null);
const isInitPdfViewer = ref(false);
const route = useRoute();

const initCollabclient = async (curPdfviewer) => {
    let isParticipant = isParticipantView(route);
    let nickName;
    if (!isParticipant) {
        nickName = await creatorLogin();
    } else {
        nickName = await participantLogin();
    }
    if (nickName) {
        let currentToken = await loginAnonymously(nickName);
        let currentUser = await getUser();
        let webCollabClient = await new WebCollabClient({
            pdfViewer: curPdfviewer,
            baseURL: serverUrl,
            userProvider: () => {
                return {
                    id: currentUser.id,
                    username: currentUser.userName,
                    token: currentToken,
                };
            },
        });
        console.table(await webCollabClient.getVersion());
        setCurrentUser(currentUser);
        setCollabClient(webCollabClient);

        let app = (window.app = window.app || {});
        let state = (app.state = app.state || {});
        state.currentUser = currentUser;
        state.pdfViewer = curPdfviewer;

        app.LoggerFactory = LoggerFactory;
    } else {
        window.location.href = PUBLIC_PATH;
    }
};

const getDocumentPermission = (isPortfolio, hasAnnotFormPermission) => {
    pdfDocPermission.value = {
        isPortfolio: Boolean(isPortfolio),
        hasAnnotFormPermission: Boolean(hasAnnotFormPermission),
    };
    setIsLoading(false);
};

const onInitializationCompleted = (pdfuiInstance, pdfViewerInstance) => {
    pdfViewer.value = pdfViewerInstance;
    pdfui.value = pdfuiInstance;
    initCollabclient(pdfViewerInstance);
    isInitPdfViewer.value = true;
};

const setPermissionByParticipant = (isAllowComment) => {
    if (!isAllowComment) {
        updatePdfViewerByPermission(toRaw(pdfui), toRaw(pdfViewer));
    }
};
</script>

<template>
    <TopNav v-if="isInitPdfViewer && collabClient && currentUser" :pdfViewer=toRaw(pdfViewer) :pdfDocPermission :setPermissionByParticipant />
    <PDFViewer :onInitializationCompleted :getDocumentPermission />
</template>