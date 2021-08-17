import { Inject, Service } from 'typedi';
import PdfService from 'services/PDF/PdfService';
import { templateRender } from 'utils';
import HasTenancyService from 'services/Tenancy/TenancyService';

@Service()
export default class SaleReceiptsPdf {
  @Inject()
  pdfService: PdfService;

  @Inject()
  tenancy: HasTenancyService;

  /**
   * Retrieve sale invoice pdf content.
   * @param {} saleInvoice -
   */
  async saleReceiptPdf(tenantId: number, saleReceipt) {
    const i18n = this.tenancy.i18n(tenantId);
    const settings = this.tenancy.settings(tenantId);

    const organizationName = settings.get({
      group: 'organization',
      key: 'name',
    });
    const organizationEmail = settings.get({
      group: 'organization',
      key: 'email',
    });

    const htmlContent = templateRender('modules/receipt-regular', {
      saleReceipt,
      organizationEmail,
      organizationName,
      ...i18n,
    });
    const pdfContent = await this.pdfService.pdfDocument(htmlContent);

    return pdfContent;
  }
}
