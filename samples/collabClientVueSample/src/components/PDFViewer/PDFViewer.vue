<template>
  <div id="pdf-ui"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { PUBLIC_PATH, licenseSN, licenseKey } from '../../config';
import { message, notification } from 'ant-design-vue';
import { lang } from '../../locales';
import { initSignatureHandlers } from '../../common/signature';
import {
  collabToolbarConfiguration,
  fragmentsConfiguration,
  onFollowingStatus,
  onFollowingStatusByResize,
} from '../../utils/collab-utils';
import { setIsLoading } from '@/store/isLoading';

const props = defineProps({
  onInitializationCompleted: Function,
  getDocumentPermission: Function,
});

const UIExtension = window.UIExtension;

const pdfui = ref(null);

const addUIEventListener = async (pdfuiInstance) => {
  let pdfViewer = await pdfuiInstance.getPDFViewer();
  pdfuiInstance.addUIEventListener(
    UIExtension.UIEvents.initializationCompleted,
    async () => {
      props.onInitializationCompleted(pdfuiInstance, pdfViewer);
    }
  );
  pdfuiInstance.addUIEventListener(UIExtension.UIEvents.openFileSuccess, async () => {
    const root = await pdfuiInstance.getRootComponent();
    root.querySelector('fv--contextmenu-item-rotate-left').hide();
    root.querySelector('fv--contextmenu-item-rotate-right').hide();
    root.querySelector('contextmenu-form-designer')?.remove();
    root.querySelectorAll('fv--text-selection-tooltip > *').forEach((it) => {
      if (it.name === 'fv--text-selection-tooltip-create-bookmark') {
        it.hide();
      }
    });
    const docRender = pdfViewer.getPDFDocRender();
    const doc = await pdfViewer.getCurrentPDFDoc();
    const isPortfolio = doc.isPortfolio();
    const hasAnnotFormPermission = docRender.getUserPermission().checkAnnotForm();
    props.getDocumentPermission(isPortfolio, hasAnnotFormPermission);
  });
  pdfuiInstance.addUIEventListener(UIExtension.UIEvents.willCloseDocument, () => {
    onFollowingStatus(false);
    notification.destroy();
  });
  window.addEventListener(
    UIExtension.PDFViewCtrl.DeviceInfo.isMobile ? 'orientationchange' : 'resize',
    function (e) {
      onFollowingStatusByResize();
      pdfuiInstance.redraw();
    }
  );
};

const initPDFUI = async () => {
  const libPath = PUBLIC_PATH + 'foxitwebsdk/lib';
  const PDFUI = UIExtension.PDFUI;
  const pdfuiInstance = new PDFUI({
    viewerOptions: {
      libPath,
      jr: {
        workerPath: libPath,
        enginePath: '../lib/jr-engine/gsdk',
        fontPath: 'http://webpdf.foxitsoftware.com/webfonts/',
        licenseSN: licenseSN,
        licenseKey: licenseKey,
      },
      customs: {
        isAttachFileOverSize: (file) => {
          if (!file) {
            return;
          }
          if (file.size > 1024 * 1024 * 10) {
            message.error(lang.Component.sizeTip);
            return true;
          }
        },
      },
    },
    renderTo: '#pdf-ui',
    appearance: UIExtension.appearances.adaptive,
    fragments: fragmentsConfiguration,
    addons: UIExtension.PDFViewCtrl.DeviceInfo.isMobile
      ? libPath + '/uix-addons/allInOne.mobile.js'
      : libPath + '/uix-addons/allInOne.js',
  });
  await collabToolbarConfiguration(pdfuiInstance, UIExtension);
  await addUIEventListener(pdfuiInstance);
  initSignatureHandlers(pdfuiInstance);
  pdfui.value = pdfuiInstance;
};

onMounted(() => {
  setIsLoading(true);
  initPDFUI();
});

onBeforeUnmount(() => {
  pdfui.value && pdfui.value.destroy();
});
</script>