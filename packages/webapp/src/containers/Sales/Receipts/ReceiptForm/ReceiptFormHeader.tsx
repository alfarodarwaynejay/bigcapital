// @ts-nocheck
import React, { useMemo } from 'react';
import intl from 'react-intl-universal';
import { useFormikContext } from 'formik';
import { Group, PageFormBigNumber } from '@/components';
import ReceiptFormHeaderFields from './ReceiptFormHeaderFields';
import { getEntriesTotal } from '@/containers/Entries/utils';

/**
 * Receipt form header section.
 */
function ReceiptFormHeader({
  // #ownProps
  onReceiptNumberChanged,
}) {
  return (
    <Group
      position="apart"
      align={'flex-start'}
      display="flex"
      bg="white"
      p="25px 32px"
      borderBottom="1px solid #d2dce2"
    >
      <ReceiptFormHeaderFields
        onReceiptNumberChanged={onReceiptNumberChanged}
      />
      <ReceiptFormHeaderBigTotal />
    </Group>
  );
}

/**
 * The big total amount of receipt form.
 * @returns {React.ReactNode}
 */
function ReceiptFormHeaderBigTotal() {
  const {
    values: { currency_code, entries },
  } = useFormikContext();

  // Calculate the total due amount of bill entries.
  const totalDueAmount = useMemo(() => getEntriesTotal(entries), [entries]);

  return (
    <PageFormBigNumber
      label={intl.get('due_amount')}
      amount={totalDueAmount}
      currencyCode={currency_code}
    />
  );
}

export default ReceiptFormHeader;
