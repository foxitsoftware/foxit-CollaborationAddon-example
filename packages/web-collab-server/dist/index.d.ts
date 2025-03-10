import { INestApplication, HttpServer } from '@nestjs/common';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';

declare function bootstrap(options?: NestApplicationOptions): Promise<INestApplication>;
type UserInfo = {
    id: UserId;
    username: string;
    [key: string]: any;
};
interface UserService {
    getUserByToken(token: string): Promise<UserInfo>;
    checkUserPermission?(userId: UserId, resourceType: string, operation: string, resourceId?: string): Promise<boolean | null>;
}
type MsgType = 'COLLAB_BEGIN' | 'COLLAB_END' | 'COLLAB_CREATED' | 'COLLAB_UPDATED' | 'COLLAB_REMOVED' | 'COLLAB_ANNOT_ADDED' | 'COLLAB_ANNOT_UPDATED' | 'COLLAB_ANNOT_REMOVED' | 'MEMBER_ONLINE' | 'MEMBER_OFFLINE' | 'MEMBER_ADDED' | 'MEMBER_UPDATED' | 'MEMBER_REMOVED';
type UserId = string;
type MsgMetaData = {
    userId: UserId;
    collaborationId: string;
    serverId: string;
};
type Message = {
    type: MsgType;
    payload: any;
    meta: MsgMetaData;
};
interface MessageQueue {
    publish(msg: Message): Promise<boolean>;
    subscribe(handler: (msg: Message) => any): any;
}
type MessageHandler = (msg: Message) => any;
type DatabaseConfig = {
    type: 'postgres' | 'mysql' | 'sqlserver';
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    log?: Array<PrismaLogLevel | PrismaLogDefinition>;
    connectionURL?: string;
};
type PrismaLogLevel = 'query' | 'info' | 'warn' | 'error';
type PrismaLogDefinition = {
    level: PrismaLogLevel;
    emit: 'stdout' | 'event';
};
type MemberId = string;
interface MemberStateService {
    getOnlineMembers(collaborationId: string): Promise<Set<MemberId>>;
    addOnlineMember(collaborationId: string, memberId: MemberId): Promise<boolean>;
    removeOnlineMember(collaborationId: string, memberId: MemberId): Promise<boolean>;
}
declare let msgHandler: MessageHandler;
declare let customUserService: UserService;
interface LoggerOptions {
    level?: "error" | "warn" | "info" | "debug" | "trace" | "silent";
    autoLogging?: boolean;
    [key: string]: any;
}
declare let customLoggerOptions: LoggerOptions;
declare let cluster: {
    serverId: string;
    memberStateService?: MemberStateService;
    messageQueue?: MessageQueue;
};
declare class WebCollabServer {
    private instance?;
    private readonly bootstrapPromise;
    private serverPromise;
    constructor(options: {
        databaseConfig: DatabaseConfig;
        userService: UserService;
        messageHandler?: MessageHandler;
        cluster?: {
            serverId: string;
            memberStateService?: MemberStateService;
            messageQueue?: MessageQueue;
        };
        logger?: LoggerOptions;
    });
    applyConfig(config: (server: HttpServer) => any): Promise<void>;
    start(port?: number): Promise<void>;
    stop(): Promise<void>;
    createCollaboration(collaboration: {
        fileUrl: string;
        isDocPublic: boolean;
        docName: string;
        ownerId: string;
    }): Promise<{
        id: string;
    }>;
}

export { DatabaseConfig, LoggerOptions, MemberId, MemberStateService, Message, MessageHandler, MessageQueue, MsgMetaData, MsgType, UserId, UserInfo, UserService, WebCollabServer, bootstrap, cluster, customLoggerOptions, customUserService, msgHandler };
