// receipt-validator.service.ts
import { Receipt } from 'in-app-purchase';
import { google } from 'googleapis';
import iapValidator from 'utils/iap';
import type { IProduct } from 'models/product';
import type { AndroidReceipt, IUnifiedPurchaseData } from 'models/purchase/types';

export type ReceiptValidationResult =
  | { status: 'valid'; data: IUnifiedPurchaseData }
  | { status: 'expired' }
  | { status: 'invalid'; reason: string; cause?: any };

class ReceiptValidatorService {
  public async verifyReceipt(
    receipt: Receipt,
    product: IProduct
  ): Promise<ReceiptValidationResult> {
    const isIos = typeof receipt === 'string';

    try {
      const purchase = isIos
        ? await this.validateIosPurchase(receipt, product)
        : await this.validateAndroidPurchase(receipt as any);

      if (!purchase) {
        return { status: 'expired' };
      }

      return { status: 'valid', data: purchase };
    } catch (err: any) {
      const reason = err?.message || 'Unknown receipt validation error';

      return {
        status: 'invalid',
        reason,
        cause: err,
      };
    }
  }

  private async validateIosPurchase(
    receipt: string,
    product: IProduct
  ): Promise<IUnifiedPurchaseData | null> {
    const purchase = await iapValidator.validate(receipt, product.productId);

    if (!purchase) {
      return null;
    }

    const purchaseDate =
      (purchase as any).purchaseDateMs ||
      (typeof purchase.purchaseDate === 'string'
        ? new Date(purchase.purchaseDate).getTime()
        : purchase.purchaseDate);

    const expirationDate =
      purchase.expirationDate && (purchase as any).expirationDate > 0
        ? Number(purchase.expirationDate)
        : null;

    return {
      platform: 'ios',
      productId: product.productId,
      transactionId: purchase.transactionId,
      originalTransactionId: purchase.originalTransactionId,
      purchaseDate,
      expirationDate,
      isTrial: purchase.isTrial === true,
      isExpired: false,
      isVerified: true,
      verifiedBy: 'iap',
      createdByAdmin: false,
      raw: purchase,
    };
  }

  private async validateAndroidPurchase(
    receipt: AndroidReceipt
  ): Promise<IUnifiedPurchaseData | null> {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const authClient = (await auth.getClient()) as any;
    const publisher = google.androidpublisher({ version: 'v3', auth: authClient });

    const res = await publisher.purchases.subscriptionsv2.get({
      packageName: receipt.packageName,
      token: receipt.purchaseToken,
    });

    const data = res.data;
    const item = data.lineItems?.[0];
    if (!item) return null;

    const isExpired = data.subscriptionState === 'SUBSCRIPTION_STATE_EXPIRED';
    if (isExpired) return null;

    // 추후에는 만료되었음을 판단하는 로직을 더 추가해야 함.
    // const now = Date.now();
    // const expiryTime = item.expiryTime ? new Date(item.expiryTime).getTime() : null;

    // // subscriptionState가 active 아니고, expiryTime 기준으로도 만료되었으면 expired 처리
    // const state = data.subscriptionState;
    // const isEffectivelyExpired =
    //   state === 'SUBSCRIPTION_STATE_EXPIRED' || (expiryTime !== null && now >= expiryTime);

    // if (isEffectivelyExpired) return null;

    const purchaseDate = data.startTime ? new Date(data.startTime).getTime() : receipt.purchaseTime;
    const expirationDate = item.expiryTime ? new Date((item as any).expiryTime).getTime() : null;

    return {
      platform: 'android',
      productId: item.productId || '',
      transactionId: data.latestOrderId || '',
      originalTransactionId: undefined,
      purchaseDate,
      expirationDate,
      isTrial: false,
      isExpired: false,
      isVerified: true,
      verifiedBy: 'google-api',
      createdByAdmin: false,
      raw: data,
    };
  }
}

export const receiptValidatorService = new ReceiptValidatorService();
