import * as Y from 'yjs';
import { Observable } from 'lib0/observable.js';
import ReconnectingWebSocket from 'reconnecting-websocket';

type UserId = string;
type MemberId = UserId;
interface MemberInfo {
    id?: UserId;
    userName?: string;
    email?: string;
    type?: UserType;
    isAllowComment?: boolean;
    status?: string;
    lastRead?: string;
    isInScreenSync?: boolean;
}
interface Member {
    id?: UserId;
    userName?: string;
    email?: string;
    type?: UserType;
    isAllowComment?: boolean;
    status?: string;
    lastRead?: string;
    isInScreenSync?: boolean;
    getScreenSyncInfo(): Promise<{
        id: string;
        followers: number;
    }>;
}
declare enum UserType {
    ANONYMOUS = "ANONYMOUS",
    STANDARD = "STANDARD",
    PRE_REGISTRATION = "PRE-REGISTRATION"
}

type UserAcessType$1 = 'owner' | 'member' | 'unjoined';
interface DocInfo {
    id?: string;
    fileUrl: string;
    isDocPublic: boolean;
    docName: string;
    status?: number;
    authorId?: string;
    docPermission?: number;
    createdAt?: number;
    updatedAt?: number;
    access?: UserAcessType$1;
}

type UserAcessType = 'owner' | 'member' | 'unjoined';
declare class Permission {
    permission: number;
    private userAccessType;
    constructor(permission: string | number, userAcessType?: UserAcessType);
    isOwner(): boolean;
    isMember(): boolean;
    isAllowComment(): boolean;
    isAllowAnyone(): boolean;
    isAllowMembers(): boolean;
}

type ScreenSyncId = string;
declare enum ScreenSyncRole {
    LEADER = "leader",
    FOLLOWER = "follower"
}
type ScreenSyncInfo = {
    id: ScreenSyncId;
    leader: MemberInfo;
    creatorId: UserId;
    collaborationInfo: {
        docId: string;
        sessionId: string;
    };
    members: Array<MemberInfo>;
};
declare enum ScreenSyncEvent {
    CREATED = "screen-sync-created",
    STOPPED = "screen-sync-stopped",
    MEMBER_JOINED = "screen-sync-member-joined",
    MEMBER_LEAVE = "screen-sync-member-leave",
    SCREENSYNC_DATA = "screen-sync-data"
}

declare enum DocumentAction {
    MEMBER_ONLINE = "member-online",
    MEMBER_OFFLINE = "member-offline",
    ADD_MEMBERS = "add-members",
    DELETE_MEMBERS = "delete-members",
    ADD_ANNOTS = "add-annots",
    CHANGE_ANNOTS = "change-annots",
    DELETE_ANNOTS = "delete-annots",
    DELETE_SHARE = "delete-share",
    EDIT_MEMBERS = "edit-members",
    MOUSE_POINTER_SYNC = "mouse-pointer-sync",
    PAGE_MEASURE_SCALE_SYNC = "page-measure-scale-sync",
    SYNC_YLOG = "sync-ylog",
    SYNC_YLOG_STEP_1 = "sync-ylog-s1",
    SYNC_YLOG_STEP_2 = "sync-ylog-s2"
}
declare enum NetworkConnectionEvent {
    NetworkConnectionUp = "network-connection-up",
    NetworkConnectionDown = "network-connection-down"
}
type StatusData = {
    type: DocumentAction.MEMBER_ONLINE | DocumentAction.MEMBER_OFFLINE | DocumentAction.DELETE_SHARE | DocumentAction.EDIT_MEMBERS | DocumentAction.DELETE_MEMBERS | DocumentAction.PAGE_MEASURE_SCALE_SYNC | NetworkConnectionEvent.NetworkConnectionUp | NetworkConnectionEvent.NetworkConnectionDown | ScreenSyncEvent;
    data: Record<string, any>;
};

declare class IndexeddbPersistence extends Observable<string> {
    doc: Y.Doc;
    readonly name: string;
    _dbref: number;
    _dbsize: number;
    private _destroyed;
    db: IDBDatabase | null;
    private _db;
    synced: boolean;
    private _storeTimeout;
    private _storeTimeoutId;
    updateStoreName: string;
    constructor(name: string, collaborationId: string, doc: Y.Doc);
    private _storeUpdate;
    destroy: () => Promise<void>;
    clearData(): Promise<void>;
    get(key: any): Promise<string | number | any[] | ArrayBuffer | Date>;
    set(key: any, value: any): Promise<any>;
    del(key: any): Promise<any>;
}

declare class SdkAnnotEventService {
    ydoc: Y.Doc;
    private readonly context;
    undoRedoManager: any;
    private tempRemoveAnnotsUserId;
    idbPersistencePromise: Promise<IndexeddbPersistence>;
    constructor(pdfViewer: any, context: Context);
    addAnnotationListener(): void;
    listenAnnotationOrderChangedEvent(): void;
    syncUpdate(update: any, type: DocumentAction | undefined, docId: string): void;
    removeAnnotationListener(): void;
    private zoomEvent;
    private changeViewModeEvent;
    addInitialAnnotations: (annots: any) => Promise<boolean>;
    private getPageIdByPageIndex;
    private recomputePageAnnotOrder;
    private encodeAnnotationAdd;
    private encodeAnnotationUpdate;
    private encodeAsYDocTypes;
    private addAnnotation;
    private addAnnotationReply;
    private updateAnnotation;
    private deleteAnnotation;
    private annotReviewStateAdd;
    private annotationOrderChanged;
    private willCloseDocument;
    initYDoc(collaborationId: string): void;
    initProviders(collaborationId: string): Promise<void>;
    initWebSocketProvider(ydoc: Y.Doc): void;
    initIndexedDBProvider(dbName: string, collaborationId: string, ydoc: Y.Doc): Promise<IndexeddbPersistence>;
    destroyYDoc(): void;
}

declare class MousePointerService {
    private readonly context;
    private pdfViewer;
    private ws?;
    private docId?;
    private color;
    private mousePointerStates;
    private disableSync;
    constructor(pdfViewer: any, context: Context);
    onMemberOffline: (data: any) => Promise<void>;
    setSyncRate(syncRate: number): void;
    private onMouseMove;
    start(ws: ReconnectingWebSocket, docId: string): void;
    stop(): void;
    private sync;
    renderInitialMousePointers(mousePointerStates: any): Promise<void>;
    render({ userId, sessionId, state, }: {
        userId: string;
        sessionId?: string;
        state: any;
    }): Promise<void>;
    private refresh;
    private clean;
    private addNode;
}

declare class SdkCollabService {
    private readonly sdkAnnotEventService;
    private readonly mousePointerService;
    private readonly ydoc;
    constructor(pdfViewer: any, context: Context, sdkAnnotEventService: SdkAnnotEventService, mousePointerService: MousePointerService);
    getAnnotUserId(annotName: any, pageIndex: any): any;
    resetCollaborationData(): void;
    setOwnerAnnotId(annotationId: any): void;
    uploadInitialAnnots(): Promise<void>;
    onBroadcastCollabNotice: (message: any) => void;
    isContinueProcessing(msg: any): boolean;
    private deleteAnnots;
    sendSyncStep1(docId: string): Promise<void>;
    private applyAnnotOrderChange;
    private ydocToPDF;
    handleSyncStep1(encodedStateVector: Uint8Array): void;
    handleSyncStep2(ylog: any): void;
    applyYlog(ylog: any): void;
    observeYDoc(): void;
}

declare class SdkScreenSyncService {
    private pdfViewer;
    private context;
    private syncScreenData;
    private readonly updateScreenSyncData;
    private leaderId;
    constructor(pdfViewer: any, context: Context);
    private listenScreenSyncData;
    private getPdfInfo;
    private getScrollData;
    setZoomBySDK(zoom: any): Promise<void>;
    setViewModeBySDK(NewViewModeClass: any): Promise<void>;
    addscreenSyncListener(screenSyncId: any, leaderId: any): void;
    removeScreenSyncListener(): void;
    leaveScreenSync(): void;
    sync(screenSyncInfo: any): Promise<void>;
    private handleScrollEvent;
    setSyncRate(syncRate: number): void;
}

declare class WebSdkBinding {
    readonly sdkAnnotEventService: SdkAnnotEventService;
    readonly sdkCollabService: SdkCollabService;
    readonly sdkScreenSyncService: SdkScreenSyncService;
    readonly mousePointerService: MousePointerService;
    constructor(pdfViewer: any, context: any);
}

type Context = {
    currentDocId?: string;
    currentUser?: UserInfo;
    token?: string;
    sessionId?: string;
    pdfViewer?: any;
    webSdkBinding?: WebSdkBinding;
    permission?: Permission;
    listener?: (arg: StatusData) => any;
    screenSync?: ScreenSyncInfo;
    wsInstance?: ReconnectingWebSocket;
    serverId?: String;
    transport: {
        httpBaseURL: string;
        websocketURL: string;
    };
};

declare class ScreenSync {
    private id;
    private context;
    private leader;
    constructor(context: Context, screenSyncInfo: ScreenSyncInfo);
    getMembers(role?: ScreenSyncRole): Promise<Member[] | null>;
    join(): Promise<boolean>;
    leave(): Promise<boolean>;
    setSyncRate(syncRate: number): boolean;
}

type FileOptions = {
    password: string;
    [key: string]: any;
};
declare class Collaboration {
    id: string;
    isDocPublic: boolean;
    docName: string;
    createdAt: number;
    authorId: UserId;
    private openFailedPDFDoc;
    private userAccessType;
    private readonly fileUrl;
    private readonly docPermission;
    private collabStatus;
    private readonly context;
    private needToClosePDFDoc;
    constructor(docInfo: DocInfo, context: Context);
    private openPDF;
    private assertPDFDocPermission;
    private removeAllOriginalAnnotations;
    begin(fileOptions?: FileOptions): Promise<boolean>;
    end(): Promise<boolean>;
    addMembers(members: {
        id?: UserId;
        email?: string;
        isAllowComment: boolean;
    }[]): Promise<boolean>;
    getMembers(): Promise<Member[]>;
    updatePermission(permissionOption: {
        isDocPublic?: boolean;
        isAllowComment?: boolean;
    }): Promise<boolean>;
    updateMemberPermission(members: Array<{
        id: MemberId;
        isAllowComment: boolean;
    }>): Promise<boolean>;
    removeMembers(members: Array<{
        id: MemberId;
    }>): Promise<boolean>;
    quit(): Promise<boolean>;
    getOnlineMembers(): Promise<Member[]>;
    getPermission(): Promise<Permission>;
    on(event: 'onlineStatusChanged', listener: (actionData: Record<string, any>, action: 'member-online' | 'member-offline' | 'delete-share' | 'edit-members' | 'delete-members' | 'network-connection-up' | 'network-connection-down' | 'page-measure-scale-sync' | ScreenSyncEvent) => void): void;
    off(): Promise<boolean>;
    createScreenSync(memberIds?: UserId[]): Promise<ScreenSync>;
    getScreenSync(screenSyncId: string): Promise<ScreenSync>;
    getScreenSyncList(): Promise<ScreenSync[] | null>;
    getCurrentUser(): Promise<Member>;
    getAnnotJSON(annotID: string, pageIndex: number): any;
    setMousePointerSyncRate(syncRate: number): boolean;
}

type Invitation = {
    id: string;
    expireAt: number;
};

type PDFViewer = any;
type UserInfo = {
    id: UserId;
    username: string;
    token: string;
};
interface CollabOptions {
    baseURL: string;
    pdfViewer: PDFViewer;
    userProvider: () => UserInfo;
}
declare class WebCollabClient {
    private sessionId;
    constructor(collabOptions: CollabOptions);
    createCollaboration(doc: {
        fileUrl: string;
        isDocPublic: boolean;
        docName: string;
    }): Promise<Collaboration>;
    private validateDocParam;
    getCollaborationList(): Promise<Collaboration[]>;
    getCollaboration(collaborationId: string): Promise<Collaboration>;
    private validateCollaborationId;
    removeCollaboration(collaborationId: string): Promise<boolean>;
    createInvitation(collaborationId: string, expiresInMilliSeconds?: number): Promise<Invitation>;
    joinCollaborationWithInvitation(invitationId: string): Promise<Collaboration>;
    getVersion(): Promise<{
        "collaboration server": {
            version: string;
        };
        "collaboration client": {
            version: string;
        };
    }>;
}

declare class LoggerFactory {
    constructor();
    static enableLogger(enable: boolean): void;
    static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void;
    static getLogger(name: string): any;
    private static createLogger;
}

export { CollabOptions, Collaboration, DocInfo, Invitation, LoggerFactory, Member, Permission, ScreenSync, ScreenSyncEvent, ScreenSyncRole, UserInfo, WebCollabClient };
