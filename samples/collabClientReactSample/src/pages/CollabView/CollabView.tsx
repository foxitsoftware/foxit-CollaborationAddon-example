import React, { useState } from 'react';
import { Spin } from 'antd';
import PDFViewer from '../../components/PDFViewer/PDFViewer';
import { useIsLoading } from '../../context/isLoading';
import { PUBLIC_PATH, serverUrl } from '../../config';
import {
  creatorLogin,
  isParticipantView,
  participantLogin,
  updatePdfViewerByPermission,
} from '../../utils/collab-utils';
import { useCurrentCollabClient } from '../../context/WebCollabClient';
import {
  WebCollabClient,
  LoggerFactory,
} from '@foxitsoftware/web-collab-client';
import { getUser, loginAnonymously } from '../../service/api';
import { useCurrentUser } from '../../context/user';
import TopNav from '../../components/TopNav/TopNav';
import { useHistory } from 'react-router-dom';

export default () => {
  const { isLoading, setIsLoading } = useIsLoading();
  const { collabClient, setCollabClient } = useCurrentCollabClient();
  const { currentUser, setCurrentUser } = useCurrentUser();
  const [pdfDocPermission, setPdfDocPermission] = useState<any>(null);
  const [pdfViewer, setPdfViewer] = useState<any>(null);
  const [pdfui, setPdfui] = useState<any>(null);
  const history = useHistory();
  const initCollabclient = async (curPdfviewer) => {
    let isParticipant = isParticipantView(history);
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
            id: currentUser!.id,
            username: currentUser!.userName,
            token: currentToken,
          };
        },
      });
      // print out collab add-on version
      console.table(await webCollabClient.getVersion());
      setCollabClient(webCollabClient);
      setCurrentUser(currentUser);

      // this is for used for testing only
      // @ts-ignore
      let app = (window.app = window.app || {});
      let state = (app.state = app.state || {});
      state.currentUser = currentUser;
      state.pdfViewer = curPdfviewer;

      // set collab client log level
      app.LoggerFactory = LoggerFactory;
      // LoggerFactory.setLogLevel('debug');
    } else {
      window.location.href = PUBLIC_PATH;
    }
  };

  const getDocumentPermission = (isPortfolio, hasAnnotFormPermission) => {
    let pdfDocPermission = {
      isPortfolio: Boolean(isPortfolio),
      hasAnnotFormPermission: Boolean(hasAnnotFormPermission),
    };
    setPdfDocPermission(pdfDocPermission);
    setIsLoading(false);
  };

  return (
    <>
      <Spin tip="Loading..." spinning={isLoading} size={'large'}>
        {pdfViewer && collabClient && currentUser && (
          <TopNav
            pdfViewer={pdfViewer}
            pdfDocPermission={pdfDocPermission}
            setPermissionByParticipant={(isAllowComment) => {
              if (!isAllowComment) {
                updatePdfViewerByPermission(pdfui, pdfViewer);
              }
            }}
          />
        )}
        <PDFViewer
          OnInitializationCompleted={(pdfui, pdfViewer) => {
            setPdfViewer(pdfViewer);
            setPdfui(pdfui);
            initCollabclient(pdfViewer);
          }}
          getDocumentPermission={getDocumentPermission}
        />
      </Spin>
    </>
  );
};
