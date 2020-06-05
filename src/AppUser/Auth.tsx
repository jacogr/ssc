// SPDX-License-Identifier: Apache-2

import { KeyringPair } from '@polkadot/keyring/types';
import { AccountCtx, DeriveCtx } from '../types';

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import Keyring from '@polkadot/keyring';
import { DEV_PHRASE } from '@polkadot/keyring/defaults';

import { Button, ButtonRow, InputEmail, Navigation, Title } from '../components';
import { AccountContext } from '../contexts';

interface Props {
  children: React.ReactNode;
  className?: string;
}

interface RootState extends DeriveCtx {
  rootPair: KeyringPair;
}

const NAV_ROUTES: [string, string, string[]][] = [];

const keyring = new Keyring({ type: 'sr25519' });

function createRootState (): RootState {
  const rootPair = keyring.addFromUri(DEV_PHRASE);
  const deriveAddress = (username: string) =>
    rootPair.derive(`//${username.toLowerCase()}`).address;

  return { deriveAddress, rootPair };
}

function Auth ({ children, className }: Props): React.ReactElement<Props> {
  // This is a very bad idea in production, however as a POC it allows us to generate
  // consistent accounts from a single seed (and allows deterministic addresses)
  const [{ deriveAddress, rootPair }] = useState<RootState>(createRootState);
  const [accountCtx, setAccountCtx] = useState<AccountCtx | null>(null);
  const [username, setUsername] = useState('');

  const _doLogout = useCallback(
    (): void => {
      setAccountCtx(null);
      window.location.hash = '/';
    },
    []
  );

  const _doLogin = useCallback(
    (): void => {
      const userPair = rootPair.derive(`//${username.toLowerCase()}`);

      setAccountCtx({ deriveAddress, userAddress: userPair.address, userPair, username: username.toLowerCase() });

      window.location.hash = '/account';
    },
    [deriveAddress, rootPair, username]
  );

  if (accountCtx) {
    return (
      <div className={className}>
        <AccountContext.Provider value={accountCtx}>
          <Navigation
            onLogout={_doLogout}
            routes={NAV_ROUTES}
            username={accountCtx.username}
          />
          {children}
        </AccountContext.Provider>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className='loginForm'>
        <Title>User login</Title>
        <InputEmail
          autoFocus
          onChange={setUsername}
          placeholder='email address, eg. me@example.com'
        />
        <ButtonRow>
          <Button
            isDisabled={!username}
            label='Login'
            onClick={_doLogin}
          />
        </ButtonRow>
      </div>
    </div>
  );
}

export default React.memo(styled(Auth)`
  .loginForm {
    margin: auto;
    max-width: 480px;
  }
`);
