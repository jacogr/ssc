// SPDX-License-Identifier: MIT

import { TxCtx, TxEvent } from '../types';

import BN from 'bn.js';
import { useEffect, useState } from 'react';

import useApi from './useApi';

let id = 0;

export default function useTxsAll (): TxCtx {
  const api = useApi();
  const [txs, setTxs] = useState<TxCtx>([]);

  useEffect((): () => void => {
    let unsubscribe: null | (() => void) = null;

    api.query.system
      .events((records): void => {
        const transfers = records
          .filter(({ event: { method, section }, phase }) => phase.isApplyExtrinsic && section === 'balances' && method === 'Transfer')
          .map(({ event: { data: [from, to, amount] } }): TxEvent => ({
            amount: amount as unknown as BN,
            from: from.toString(),
            key: `${++id}`,
            to: to.toString(),
            wasSent: false
          }));

        if (transfers.length) {
          setTxs((txs) => transfers.concat(...txs))
        }
      })
      .then((u): void => {
        unsubscribe = u;
      })
      .catch(console.error);

    return (): void => {
      unsubscribe && unsubscribe();
    }
  }, [api]);

  return txs;
}