import { message } from "ant-design-vue";
import { PUBLIC_PATH } from "../config.ts";
import { lang } from "../locales/index.ts";
import { collaborationToolbar } from "../components/PDFViewer/CollabToobar/CollaborationToolbar.ts";
import { randomHexColor, storageGetItem, storageSetItem } from "./utils.ts";
import { type UserId } from "../types/index.ts";
export let localDocList = [
  {
    name: "FoxitPDFSDKforWeb.pdf",
    path: `${window.location.origin}${PUBLIC_PATH}FoxitPDFSDKforWeb.pdf`,
  },
  {
    name: "Foxit_One_Pager.pdf",
    path: `${window.location.origin}${PUBLIC_PATH}Foxit_One_Pager.pdf`,
  },
];

//Randomly generate user name (simulated)
export function randomMockName(userName: string) {
  return userName + Math.floor(Math.random() * 1000).toString();
}
export const collabCreatorSteps = [
  {
    element: ".more-option",
    popover: {
      className: "collab-author-more",
      title: "Step1",
      description: "Upload a file to start collaboration",
      position: "bottom",
    },
  },
  {
    element: ".share-btn",
    popover: {
      className: "collab-author-steps-share",
      title: "Step2",
      description: "Create a collaboration session",
      position: "left",
    },
  },
];
export const collabParticipantSteps = [
  {
    element: ".share-popover",
    popover: {
      className: "collab-Participant-steps",
      title: "Step1",
      description: "View collaboration information",
      position: "left",
    },
  },
];

export const stepOption = {
  animate: false,
  allowClose: false,
  closeBtnText: "Skip",
  nextBtnText: "Next",
  prevBtnText: "Previous",
};
export const privacyPolicy =
  "https://www.foxit.com/company/privacy-policy.html";

export function setFollowingStyle(elementId: string, targetRect: any) {
  let targetElement = document.createElement("div");
  targetElement.setAttribute("id", elementId);
  Object.assign(targetElement.style, {
    width: `${targetRect.width}px`,
    height: `${targetRect.height}px`,
    position: "fixed",
    left: `${targetRect.left}px`,
    top: `${targetRect.top}px`,
    zIndex: "1000",
    cursor: "not-allowed",
  });
  return targetElement;
}

export function onFollowingStatus(
  isInScreenSyncMode: boolean,
  userId?: UserId
) {
  let borderColor = randomHexColor(userId || "923094");
  let pdfViewerEle = document.querySelector("#pdf-ui");
  let screenSyncRange = document.querySelector(".fv__ui-pdfviewer");
  let pdfViewerEleRect = pdfViewerEle!.getBoundingClientRect();
  let screenSyncRangeRect = screenSyncRange!.getBoundingClientRect();
  if (isInScreenSyncMode) {
    let screenSyncModeBorderEle = document.getElementById(
      "screenSyncModeBorder"
    );
    if (screenSyncModeBorderEle) {
      return;
    }
    let screenSyncRangeEle = setFollowingStyle(
      "screenSyncRangeBorder",
      screenSyncRangeRect
    );
    screenSyncRangeEle.style.border = `5px solid ${borderColor}`;
    screenSyncRange?.appendChild(screenSyncRangeEle);
    let pdfViewerborderEle = setFollowingStyle(
      "screenSyncModeBorder",
      pdfViewerEleRect
    );
    pdfViewerEle!.appendChild(pdfViewerborderEle);
  } else {
    let pdfViewerborderEle = document.getElementById("screenSyncModeBorder");
    let screenSyncRangeEle = document.getElementById("screenSyncRangeBorder");
    pdfViewerborderEle && pdfViewerEle!.removeChild(pdfViewerborderEle);
    screenSyncRangeEle && screenSyncRange!.removeChild(screenSyncRangeEle);
  }
}

export function onFollowingStatusByResize() {
  let screenSyncModeBorderEle = document.getElementById("screenSyncModeBorder");
  let screenSyncRangeEle = document.getElementById("screenSyncRangeBorder");
  if (screenSyncModeBorderEle && screenSyncRangeEle) {
    let pdfViewerEle = document.querySelector("#pdf-ui");
    let pdfViewerEleRect = pdfViewerEle!.getBoundingClientRect();
    let screenSyncRange = document.querySelector(".fv__ui-pdfviewer");
    let screenSyncRangeRect = screenSyncRange!.getBoundingClientRect();
    screenSyncModeBorderEle.style.width = `${pdfViewerEleRect.width}px`;
    screenSyncModeBorderEle.style.height = `${pdfViewerEleRect.height}px`;
    screenSyncRangeEle.style.width = `${screenSyncRangeRect.width}px`;
    screenSyncRangeEle.style.height = `${screenSyncRangeRect.height}px`;
  }
}

export function onCatchError() {
  window.addEventListener(
    "unhandledrejection",
    (err) => {
      if (err.reason.message === "DOC_RESTRICT_ACCESS") {
        message.error(lang.restrictedAccess);
      }
      err.preventDefault();
    },
    false
  );
}

export async function updatePdfViewerByPermission(pdfui: any, pdfViewer: any) {
  const root = await pdfui.getRootComponent();
  let keyboard = await pdfui.getKeyboard();
  keyboard.interceptor((e: any, next: Function) => {
    if (
      e.command ===
      (window as any).UIExtension.PDFViewCtrl.keyboard.BuiltinCommand
        .COPY_ACTIVATE_ELEMENT
    ) {
      return;
    } else {
      next(e);
    }
  });
  pdfViewer.onShortcutKey("ctrl+v", (e: any) => {
    e.preventDefault();
  });
  root
    .querySelectorAll(
      "collaboration-comment-tab-group-mark,collaboration-comment-tab-group-text",
      "fv--text-selection-tooltip > *"
    )
    .forEach((it: any) => {
      it.lock();
    });
  root.querySelectorAll("fv--text-selection-tooltip > *").forEach((it: any) => {
    if (it.name === "fv--text-selection-tooltip-copy") {
      return;
    }
    it.hide();
  });
  setAnnotPermissionByCanView(pdfViewer);
}

export const participantLogin = async () => {
  let participantName = storageGetItem(localStorage, "participantName");
  let touristName = storageGetItem(localStorage, "touristName");
  let randowName = randomMockName("tourist");
  let nickName = participantName
    ? participantName
    : touristName
    ? touristName
    : randowName;
  if (!participantName) {
    if (!touristName) {
      storageSetItem(localStorage, "touristName", randowName);
    }
  }
  return nickName;
};
export const creatorLogin = async () => {
  let creatorName = storageGetItem(localStorage, "creatorName");
  return creatorName;
};

export const fragmentsConfiguration = [
  {
    target: "@layer-sidebar-panel",
    action: "remove",
  },
  {
    target: "@sidebar-field",
    action: "remove",
  },
  {
    target: "@bookmark-sidebar-panel",
    action: "remove",
  },
  {
    target: "@sidebar-bookmark-v2",
    action: "remove",
  },
  {
    target: "@search-sidebar-panel",
    action: "remove",
  },

  {
    target: "@thumbnail:thumbnail-list",
    action: "replace",
    template: `
      <thumbnail:thumbnail-list
          @thumbnail:centered
          @aria:label="thumbnail:title"
      >
          <thumbnail:thumbnail-item
              @foreach="thumbnail in thumbnail_list.thumbnails track by id"
              @setter.thumbnail_id="thumbnail.id"
              @lazy-content="visible"
          >
              <div class="fv__ui-thumbnail-viewer-container">
                  <thumbnail:thumbnail-viewer @setter.thumbnail="thumbnail" @thumbnail:visible-rect-control></thumbnail:thumbnail-viewer>
              </div>
              <thumbnail:page-number>@{thumbnail.pageIndex+1}</thumbnail:page-number>
          </thumbnail:thumbnail-item>
      </thumbnail:thumbnail-list>`,
  },
];

export const collabToolbarConfiguration = async (
  pdfui: any,
  UIExtension: any
) => {
  let pdfViewer = await pdfui.getPDFViewer();
  pdfui.getRootComponent().then(async (root: any) => {
    // Hide Default Toolbar
    if (UIExtension.PDFViewCtrl.DeviceInfo.isMobile) {
      const mobileHeaderRight = root.getComponentByName(
        "fv--mobile-header-right"
      );
      const peotectToolbar = root.getComponentByName("fv--mobile-header-main");
      const toolbarTabs = root.getComponentByName("fv--mobile-toolbar-tabs");
      const mobileHeader = root.getComponentByName("fv--mobile-header");
      mobileHeader && mobileHeader.hide();
      toolbarTabs && toolbarTabs.hide();
      peotectToolbar && peotectToolbar.hide();
      mobileHeaderRight && mobileHeaderRight.hide();
      let collabComponent = root.getComponentByName("collaboration-toolbar");
      if (!collabComponent) {
        root.insert(collaborationToolbar, 1);
        collabComponent = root.getComponentByName("collaboration-toolbar");
      }
      pdfViewer
        .getAnnotManager()
        .registerMatchRule(function (pdfAnnot: any, AnnotComponent: any) {
          if (pdfAnnot.getType() !== "freetext") {
            return class CustomComponent extends AnnotComponent {
              showReplyDialog() {}
            };
          }
        });
    } else {
      const toolbarTabs = root.getComponentByName("toolbar");
      const thumbnailContextmenu = root.getComponentByName(
        "fv--thumbnail-contextmenu"
      );
      toolbarTabs && toolbarTabs.hide();
      thumbnailContextmenu && thumbnailContextmenu.destroy();
      let collabComponent = root.getComponentByName("collaboration-toolbar");
      if (!collabComponent) {
        root.insert(collaborationToolbar, 1);
        collabComponent = root.getComponentByName("collaboration-toolbar");
      }
    }
    let attachmentToolbar = root.getComponentByName("attachment-toolbar");
    attachmentToolbar && attachmentToolbar.hide();
    let applyAll = root.getComponentByName("fv--contextmenu-item-apply-all");
    let apply = root.getComponentByName("fv--contextmenu-item-apply");
    applyAll && applyAll.doDestroy();
    apply && apply.doDestroy();
  });
};

export const isParticipantView = (route: any) => {
  const pathname = route.path;
  if (pathname === `${PUBLIC_PATH}collabCreator`) {
    return false;
  } else {
    return true;
  }
};
export function setAnnotPermissionByCanView(pdfViewer: any) {
  pdfViewer.setAnnotPermissionCallback(() => {
    return new Promise((resolve) => {
      resolve([]);
    });
  });
  pdfViewer.getAnnotAuthorityManager().updateAll();
}
