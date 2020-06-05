// SPDX-License-Identifier: Apache-2

import { Balance } from '@polkadot/types/interfaces';
import { EvtTxCtx, TxEvent } from './types';

import React, { useEffect, useState } from 'react';

import { EvtTxContext } from './contexts';
import { useApi, useIsMountedRef } from './hooks';

interface Props {
  children: React.ReactNode;
}

let id = 0;

function useTxEvents (): EvtTxCtx {
  const api = useApi();
  const [events, setEvents] = useState<EvtTxCtx>([]);
  const mountedRef = useIsMountedRef();

  useEffect((): () => void => {
    let unsubscribe: null | (() => void) = null;

    api.query.system
      .events((records): void => {
        const when = new Date();
        const transfers = records
          .filter(({ event: { method, section }, phase }) => phase.isApplyExtrinsic && section === 'balances' && method === 'Transfer')
          .map(({ event: { data: [from, to, amount] } }): TxEvent => ({
            amount: amount as Balance,
            from: from.toString(),
            key: `${++id}`,
            to: to.toString(),
            wasSent: false,
            when
          }));

        if (mountedRef.current && transfers.length) {
          setEvents((events) => transfers.concat(...events))
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

  return events;
}


export default function EvtTxProvider ({ children }: Props): React.ReactElement<Props> {
  const events = useTxEvents();

  return (
    <EvtTxContext.Provider value={events}>
      {children}
    </EvtTxContext.Provider>
  );
}
