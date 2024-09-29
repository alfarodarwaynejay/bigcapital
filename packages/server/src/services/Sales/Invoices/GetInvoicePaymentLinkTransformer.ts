import { Transform } from 'form-data';
import { ItemEntryTransformer } from './ItemEntryTransformer';
import { SaleInvoiceTaxEntryTransformer } from './SaleInvoiceTaxEntryTransformer';
import { SaleInvoiceTransformer } from './SaleInvoiceTransformer';
import { Transformer } from '@/lib/Transformer/Transformer';

export class GetInvoicePaymentLinkMetaTransformer extends SaleInvoiceTransformer {
  /**
   * Exclude these attributes from payment link object.
   * @returns {Array}
   */
  public excludeAttributes = (): string[] => {
    return ['*'];
  };

  /**
   * Included attributes.
   * @returns {string[]}
   */
  public includeAttributes = (): string[] => {
    return [
      'customerName',
      'dueAmount',
      'dueDateFormatted',
      'invoiceDateFormatted',
      'total',
      'totalFormatted',
      'totalLocalFormatted',
      'subtotal',
      'subtotalFormatted',
      'subtotalLocalFormatted',
      'dueAmount',
      'dueAmountFormatted',
      'paymentAmount',
      'paymentAmountFormatted',
      'dueDate',
      'dueDateFormatted',
      'invoiceNo',
      'invoiceMessage',
      'termsConditions',
      'entries',
      'taxes',
      'organization',
      'isReceivable',
      'hasStripePaymentMethod',
    ];
  };

  public customerName(invoice) {
    return invoice.customer.displayName;
  }

  /**
   * Retrieves the organization metadata for the payment link.
   * @returns
   */
  public organization(invoice) {
    return this.item(
      this.context.organization,
      new GetPaymentLinkOrganizationMetaTransformer()
    );
  }

  /**
   * Retrieves the entries of the sale invoice.
   * @param {ISaleInvoice} invoice
   * @returns {}
   */
  protected entries = (invoice) => {
    return this.item(
      invoice.entries,
      new GetInvoicePaymentLinkEntryMetaTransformer(),
      {
        currencyCode: invoice.currencyCode,
      }
    );
  };

  /**
   * Retrieves the sale invoice entries.
   * @returns {}
   */
  protected taxes = (invoice) => {
    return this.item(
      invoice.taxes,
      new GetInvoicePaymentLinkTaxEntryTransformer(),
      {
        subtotal: invoice.subtotal,
        isInclusiveTax: invoice.isInclusiveTax,
        currencyCode: invoice.currencyCode,
      }
    );
  };

  protected isReceivable(invoice) {
    return invoice.dueAmount > 0;
  }

  protected hasStripePaymentMethod(invoice) {
    return invoice.paymentMethods.some(
      (paymentMethod) => paymentMethod.paymentIntegration.service === 'Stripe'
    );
  }
}

class GetPaymentLinkOrganizationMetaTransformer extends Transformer {
  /**
   * Include these attributes to item entry object.
   * @returns {Array}
   */
  public includeAttributes = (): string[] => {
    return [
      'primaryColor',
      'name',
      'address',
      'logoUri',
      'addressTextFormatted',
    ];
  };

  public excludeAttributes = (): string[] => {
    return ['*'];
  };

  /**
   * Retrieves the formatted text of organization address.
   * @returns {string}
   */
  public addressTextFormatted() {
    return this.context.organization.addressTextFormatted;
  }
}

class GetInvoicePaymentLinkEntryMetaTransformer extends ItemEntryTransformer {
  /**
   * Include these attributes to item entry object.
   * @returns {Array}
   */
  public includeAttributes = (): string[] => {
    return [
      'quantity',
      'quantityFormatted',
      'rate',
      'rateFormatted',
      'total',
      'totalFormatted',
      'itemName',
      'description',
    ];
  };

  public itemName(entry) {
    return entry.item.name;
  }

  /**
   * Exclude these attributes from payment link object.
   * @returns {Array}
   */
  public excludeAttributes = (): string[] => {
    return ['*'];
  };
}

class GetInvoicePaymentLinkTaxEntryTransformer extends SaleInvoiceTaxEntryTransformer {
  /**
   * Included attributes.
   * @returns {Array}
   */
  public includeAttributes = (): string[] => {
    return ['name', 'taxRateCode', 'taxRateAmount', 'taxRateAmountFormatted'];
  };
}
