// SPDX-License-Identifier: Apache-2

import { SubmittableExtrinsic } from '@polkadot/api/types';

import BN from 'bn.js';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { InputAmount, Tx } from '../components';
import { useAdmin, useApi } from '../hooks';

interface Props {
  className?: string;
}

function UserMint ({ className }: Props): React.ReactElement<Props> {
  const { address, username } = useParams();
  const { adminPair } = useAdmin();
  const api = useApi();
  const [amount, setAmount] = useState(new BN(0));
  const [tx, setTx] = useState<SubmittableExtrinsic<'promise'> | null>(null);

  useEffect((): void => {
    setTx(
      !address || amount.isZero()
        ? null
        : api.tx.templateModule.mint(address, amount)
    );
  }, [address, amount, api]);

  return (
    <Tx
      className={className}
      label='Mint'
      pair={adminPair}
      title={`Mint ${username || ''}`}
      tx={tx}
    >
      <InputAmount
        autoFocus
        onChange={setAmount}
        placeholder='the amount to allocate, eg. 1.23'
      />
    </Tx>
  );
}

export default React.memo(styled(UserMint)``);
