// SPDX-License-Identifier: Apache-2

import React from 'react';
import styled from 'styled-components';
import { formatBalance, formatNumber } from '@polkadot/util';

import { Button, Section, Table, Title } from '../components';
import { useApi, useEvtTxs, useUserCount } from '../hooks';
import TdAddress from './TdAddress';

interface Props {
  address: string;
  className?: string;
  reverse?: string;
  withoutFree?: boolean;
}

function reverseClick (reverse: string, from: string, to: string, amount: string): () => void {
  return (): void => {
    window.location.hash = `${reverse}/${from}/${to}/${amount}`;
  };
}

function Transactions ({ address, className, reverse, withoutFree }: Props): React.ReactElement<Props> {
  const api = useApi();
  const { txCount } = useUserCount(address);
  const txs = useEvtTxs(address);

  return (
    <div className={className}>
      {!withoutFree && (
        <Section>
          <Title>Free transactions</Title>
          <div className='txCount'>
            {formatNumber(txCount)}/{formatNumber(api.consts.templateModule.freeTransactionLimit as unknown as number)}
          </div>
        </Section>
      )}
      <Section>
        <Title>Recent transactions</Title>
        {txs.length
          ? (
            <Table className='transactions'>
              {txs.map(({ amount, from, key, to, wasSent, when }) => (
                <tr key={key}>
                  <td className='date'>{when.toLocaleString()}</td>
                  <TdAddress address={wasSent ? to : from} />
                  <td className='value'>{wasSent ? '-' : '+'}{formatBalance(amount, { decimals: api.registry.chainDecimals, forceUnit: '-', withSi: false })}</td>
                  {reverse && (
                    <td>
                      <Button
                        isThin
                        label='Reverse'
                        onClick={reverseClick(reverse, from, to, amount.toHex())}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </Table>
          )
          : <div>no recent transactions</div>
        }
      </Section>
    </div>
  );
}

export default React.memo(styled(Transactions)`
  .txCount {
    text-align: left;
  }

  .transactions {
    td {
      &.address {
        padding-left: 0.5rem;
      }

      &.date {
        font-size: 0.8rem;
        width: 1rem;
        white-space: wrap;
      }

      &.icon {
        padding-right: 0;

        > div {
          display: inline-block;
          margin: 0;
        }
      }

      &.value {
        text-align: right;
        width: 100%;
      }
    }
  }
`);
