// SPDX-License-Identifier: Apache-2

import React from 'react';
import { Route, Redirect, Switch } from 'react-router';
import styled from 'styled-components';

import EvtTxProvider from '../EvtTxProvider';
import { ApiContext } from '../contexts';
import { useApiCreate } from '../hooks';
import Account from './Account';
import Auth from './Auth';
import Request from './Request';
import Send from './Send';

interface Props {
  className?: string;
}

function AppUser ({ className }: Props): React.ReactElement<Props> {
  const api = useApiCreate();

  return (
    <main className={className}>
      {api && (
        <ApiContext.Provider value={api}>
          <Auth>
            <EvtTxProvider>
              <Switch>
                <Route path='/account'>
                  <Account />
                </Route>
                <Route path='/request'>
                  <Request />
                </Route>
                <Route path='/send'>
                  <Send />
                </Route>
                <Route>
                  <Redirect to='/account' />
                </Route>
              </Switch>
            </EvtTxProvider>
          </Auth>
        </ApiContext.Provider>
      )}
    </main>
  );
}

export default React.memo(styled(AppUser)``);
