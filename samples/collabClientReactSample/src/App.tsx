import React from 'react'
import './App.less';
import { BrowserRouter, Route } from 'react-router-dom';
import CollabView from './pages/CollabView/CollabView';
import { PUBLIC_PATH } from './config';
import StartPage from './pages/StartPage/StartPage';
import { WithCollaboration } from './context/collaboration';
import { WithIsLoading } from './context/isLoading';
import { WithCurrentUser } from './context/user';
import { WithCollabClient } from './context/WebCollabClient';

export default() => {
  return (
    <>
    <WithIsLoading>
      <WithCurrentUser>
        <WithCollabClient>
          <WithCollaboration>
                <BrowserRouter>
                  <Route path={`${PUBLIC_PATH}`} exact>
                    <StartPage />
                  </Route>
                  <Route
                    path={[
                      `${PUBLIC_PATH}collabCreator`,
                      `${PUBLIC_PATH}collabParticipant`,
                    ]}
                    render={() => {
                      return (
                        <CollabView></CollabView>
                      );
                    }}
                  />
                </BrowserRouter>
            </WithCollaboration>
          </WithCollabClient>
        </WithCurrentUser>
        </WithIsLoading>
    </>
  );
};
