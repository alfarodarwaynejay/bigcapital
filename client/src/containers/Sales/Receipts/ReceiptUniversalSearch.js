
import React from 'react';
import { MenuItem } from '@blueprintjs/core';

import { Icon, Choose, T } from 'components';

import { RESOURCES_TYPES } from "../../../common/resourcesTypes";
import withDrawerActions from "../../Drawer/withDrawerActions";


/**
 * Receipt universal search item select action. 
 */
function ReceiptUniversalSearchSelectComponent({
  // #ownProps
  resourceType,
  resourceId,
  onAction,

  // #withDrawerActions
  openDrawer,
}) {
  if (resourceType === RESOURCES_TYPES.RECEIPT) {
    openDrawer('receipt-drawer', { estimateId: resourceId });
  }
  return null;
}

export const ReceiptUniversalSearchSelect = withDrawerActions(
  ReceiptUniversalSearchSelectComponent,
);

/**
 * Status accessor.
 */
function ReceiptStatus({ receipt }) {
  return (
    <Choose>
      <Choose.When condition={receipt.is_closed}>
        <span class="closed"><T id={'closed'} /></span>
      </Choose.When>

      <Choose.Otherwise>
        <span class="draft"><T id={'draft'} /></span>
      </Choose.Otherwise>
    </Choose>
  );
}

/**
 * Receipt universal search item.
 */
export function ReceiptUniversalSearchItem(
  item,
  { handleClick, modifiers, query },
) {
  return (
    <MenuItem
      active={modifiers.active}
      text={
        <div>
          <div>{item.text}</div>
          <span class="bp3-text-muted">
            {item.reference.receipt_number}{' '}
            <Icon icon={'caret-right-16'} iconSize={16} />
            {item.reference.formatted_receipt_date}
          </span>
        </div>
      }
      label={
        <>
          <div class="amount">${item.reference.amount}</div>
          <ReceiptStatus receipt={item.reference} />
        </>
      }
      onClick={handleClick}
      className={'universal-search__item--receipt'}
    />
  );
}

/**
 * Transformes receipt resource item to search item.
 */
const transformReceiptsToSearch = (receipt) => ({
  text: receipt.customer.display_name,
  label: receipt.formatted_amount,
  reference: receipt,
});

/**
 * Receipt universal search bind configuration.
 */
export const universalSearchReceiptBind = () => ({
  resourceType: RESOURCES_TYPES.RECEIPT,
  optionItemLabel: 'Receipts',
  selectItemAction: ReceiptUniversalSearchSelect,
  itemRenderer: ReceiptUniversalSearchItem,
  itemSelect: transformReceiptsToSearch,
});
