import iap, { Receipt } from 'in-app-purchase';

const isProd = process.env.NODE_ENV === 'production';

// TODO: 이 부분 secret key 환경변수로 이전 필요.
iap.config({
  /* Configurations for Apple */
  appleExcludeOldTransactions: true,
  applePassword: '05cffed4530a4370b0e1c07389656a24',
  googleServiceAccount: {
    clientEmail: 'pickforme-pay@pc-api-7720781988710275417-821.iam.gserviceaccount.com',
    // eslint-disable-next-line max-len
    privateKey:
      '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCpsNhEVeviF1to\n0wxBXbNPr/5qPSfPxi8hsmZ6jT5VHh4TYzyn2zBc+wxZirwg84VICQF+8YkrnFhX\nqXycwhQvGf39adoCYOpgR6Yg3PvRIt7lVLXRzA9IrvBB9WHAdLXT0g0V8l+d/goS\nkML5mY+VvE+7WLmDDu55JtJkUblHSedd8hO5HK+54HsFAblcQxCV0VXd02VMtr7a\nBPN7/VulDDuLidYLGTZusmwBcoONLDYbD+R7rEaHcwU+GwDaRnMrz7MVDBjrOIAR\nvGoufAl+7Br4oTKeddCJVnQQcMSsmJGYzSXW0j+uNvjhE6Fg0W4coJxT8NOh8/mv\nweqO3J85AgMBAAECggEAKdi6cJm2xsYHTRG0xT7n/BgU99qWgYrobxkpZAIGc+Ou\nO44+tE9dvSRM/pzzuXWMcgAEjite7jILaCzcFeVXqGjyxaZvtKP1UKKCsbqFYCUH\nDkuGXhNCVqSLi9yJS3aMq4yynO2tTk9KaRspdfe8XMr4Z6Vg9FS/kwFzo3ky5YUJ\nW8TGDqAIVM7YozKSn1zEu7XgDeHdN/fmQKzXxPrF3Kkl3sHKVKuLGxGX+UKe6vdb\n3QzfA8zi45vf+x0sZsvNAPZywpI3W/EJlxlxwmowDTAPtcmAxgNzor4F3COFh43E\n8QobTf5Hub7VJMKqPej1D/z11ZG4L/s+ImRBYk3qfQKBgQDfnBwcpYKff/jvOXAH\njkvG8PpIVhBZph6R8CgklFXfkmqmxv6P20JXTBgjiUXVDf0ysY5YBKQJDT2JXqhN\nOXiG0lFLUfBHLSxhGzVB0SNishM76xz2WOeK05OM8y4rtYsrdnE7Ufz5JT76zpCA\nLX6hFG+JalDGI+lgj2eZ+HYaBQKBgQDCRVACmAB8Ew/zUunbr6qAnM+9ElOPF7eJ\n8aBjTrc2Uq31oUs4Zh3cjjIek0ZqJXpj2cR0jEp1rWQqoFn4r738z5rBUglAizDt\np8B06LjeDz38mbtNQXguZghmCmKGKXQ7QTfjBmjpWUMXTsYp+oGzAQYXW/LX+F+y\nLdCA6fuSpQKBgBjAGMR69WheK9mey+2qLG0Kw0k6bXje0EdrA6Z43MBwXmmzYP3f\nUQqEm69jRF1+vOXdjVnkuZte4c7QsWRK1jJmGSVzHltifqUI8+4jDf2gpExfi8cg\ntBBDtvNE/3lLEOpwo7vjKVMSclQkhQ4K+xctQeM9507nLq/Hb7o1LC1ZAoGARsvR\nk5BnJNAhkO/XT3rd7M64mdNy5gOjnD6Uz3vhIofQ42GrMttr6HNdam0LTSVpS7gR\nctOpUuckSLB0+T66QsY5RFgsDPxskT7/0Nr6e9ocIdC4RDgmnuoKB32jV/cFZ46l\n2jL8yoUAAR9w8d1bpKsr2BlnDzNxVFKD2Gbsig0CgYBTUQvbjt1v9LlbGUtjpLAD\n+fN0OvsXCb+9sB6nMxd22hYJGrb144w5CmMrO8/umO0w0E8W8s0dnmaMbn8AONCo\n4LACKvcTQfVv4GdWJclZLIdJ1bl02wUoDQEBvIs+P+4gUzgcHnQkeS9CbDPSMl9z\nlpKSobGEbQyP3QFJg4LNZQ==\n-----END PRIVATE KEY-----\n',
  },

  /* Configurations for Google Play */
  /*
  googlePublicKeyPath: 'path/to/public/key/directory/', // this is the path to the directory containing iap-sanbox/iap-live files
  googlePublicKeyStrSandBox: 'publicKeySandboxString', // this is the google iap-sandbox public key string
  googlePublicKeyStrLive: 'publicKeyLiveString', // this is the google iap-live public key string
  */

  googleAccToken: '4/0Adeu5BXtK3g1FYqaXTGK7q9Q0TkTZYPR4ndFHyZaM8HERrUTHK6nla5DPPs0q8_K2lIw8w',
  googleRefToken:
    '1//04qgOW7WsL4kdCgYIARAAGAQSNwF-L9Ir8nvRIM8ZIJcTjm7i58Sss9a0X1SJnhq2dMAimZXQp9zdN-peWhEPW_xidgnTD5NZyv4',
  googleClientID: '649829183423-hlfi9kcubo2pb8576j9l3qd69tk4pa15.apps.googleusercontent.com',
  googleClientSecret: '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',

  // sandbox
  test: !isProd,
  // debug
  // verbose: true,
});

class IAPValidator {
  private initialized = iap.setup();

  public async validate(receipt: Receipt, productId: string) {
    await this.initialized;
    const validationResult = await iap
      .validate(receipt)
      .then(async (validatedData: any) => {
        const all = Array.isArray(validatedData.latest_receipt_info)
          ? validatedData.latest_receipt_info
          : [];

        // 1) 같은 productId 중 "최신" 건 고르기 (expires_date_ms > purchase_date_ms 우선)
        const pickTime = (x: any) => Number(x.expires_date_ms ?? x.purchase_date_ms ?? 0);
        const candidates = all.filter((x: any) => x.product_id === productId);
        if (candidates.length === 0) return null;

        const target = candidates.sort((a: any, b: any) => pickTime(b) - pickTime(a))[0];

        // 2) 환불되었는지 확인
        const canceledMs = Number(target.cancellation_date_ms ?? 0);
        const canceledStr = target.cancellation_date;
        if (canceledMs > 0 || canceledStr) return null;

        // 3) 만료 컷 (+ 그레이스 기간 예외)
        const now = Date.now();
        const expires = Number(target.expires_date_ms ?? 0);
        const grace = Number(target.grace_period_expires_date_ms ?? 0); // 없으면 0

        const effectivelyExpired = expires !== 0 && expires < now && (grace === 0 || grace < now);
        if (effectivelyExpired) return null;

        const options = {
          ignoreCanceled: true, // Apple ONLY: purchaseData will NOT contain cancceled items
          ignoreExpired: true, // purchaseData will NOT contain exipired subscription items
        };

        const purchaseDatas = iap.getPurchaseData(validatedData, options) ?? [];

        const matched = purchaseDatas.find((p: any) => {
          const sameProduct = p.productId === productId;
          const sameTxn =
            (p.originalTransactionId &&
              p.originalTransactionId == target.original_transaction_id) ||
            (p.transactionId && p.transactionId == target.transaction_id);
          return sameProduct && sameTxn;
        });

        if (matched) return matched;

        return {
          quantity: Number(target.quantity ?? 1),
          productId: target.product_id,
          transactionId: target.transaction_id,
          originalTransactionId: target.original_transaction_id,
          purchaseDate: target.purchase_date,
          purchaseDateMs: Number(target.purchase_date_ms ?? 0),
          expirationDate: Number(target.expires_date_ms ?? 0) || 0,
          isTrial: String(target.is_trial_period ?? 'false') === 'true',
          bundleId: validatedData?.receipt?.bundle_id,
        };
      })
      .catch((err) => {
        console.log(err);
        throw new Error(err);
      });

    return validationResult;
  }
}

// {
// quantity: 1,
// productId: 'pickforme__plus',
// transactionId: '480002608038237',
// originalTransactionId: '480002608038237',
// purchaseDate: '2025-08-07 03:50:40 Etc/GMT',
// purchaseDateMs: 1754538640000,
// purchaseDatePst: '2025-08-06 20:50:40 America/Los_Angeles',
// originalPurchaseDate: '2025-08-07 03:50:40 Etc/GMT',
// originalPurchaseDateMs: 1754538640000,
// originalPurchaseDatePst: '2025-08-06 20:50:40 America/Los_Angeles',
// isTrialPeriod: 'false',
// inAppOwnershipType: 'PURCHASED',
// isTrial: false,
// bundleId: 'com.sigonggan.pickforme',
// expirationDate: 0
// }

const iapValidator = new IAPValidator();

export default iapValidator;
