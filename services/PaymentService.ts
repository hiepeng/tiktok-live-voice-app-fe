import { Platform } from 'react-native';
import { 
  initConnection, 
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases,
  ProductPurchase,
  SubscriptionPurchase,
  PurchaseError,
  endConnection
} from 'react-native-iap';
import { api } from './api';
import { SubscriptionType } from '@/interfaces/package.interface';

// Định nghĩa ID sản phẩm cho từng nền tảng
const SUBSCRIPTION_SKUS = {
  android: {
    basic: {
      monthly: 'basic_monthly',
      sixMonths: 'basic_six_months',
      yearly: 'basic_yearly'
    },
    standard: {
      monthly: 'standard_monthly',
      sixMonths: 'standard_six_months',
      yearly: 'standard_yearly'
    },
    premium: {
      monthly: 'premium_monthly',
      sixMonths: 'premium_six_months',
      yearly: 'premium_yearly'
    }
  },
  ios: {
    basic: {
      monthly: 'com.hiepnvna.tlivevoice.basic.monthly',
      sixMonths: 'com.hiepnvna.tlivevoice.basic.six_months',
      yearly: 'com.hiepnvna.tlivevoice.basic.yearly'
    },
    standard: {
      monthly: 'com.hiepnvna.tlivevoice.standard.monthly',
      sixMonths: 'com.hiepnvna.tlivevoice.standard.six_months',
      yearly: 'com.hiepnvna.tlivevoice.standard.yearly'
    },
    premium: {
      monthly: 'com.hiepnvna.tlivevoice.premium.monthly',
      sixMonths: 'com.hiepnvna.tlivevoice.premium.six_months',
      yearly: 'com.hiepnvna.tlivevoice.premium.yearly'
    }
  }
};

// Ánh xạ từ SubscriptionType và thời hạn sang SKU
function getSubscriptionSku(type: SubscriptionType, durationMonths: 1 | 6 | 12): string {
  const platform = Platform.OS as 'ios' | 'android';
  
  if (type === SubscriptionType.BASIC) {
    if (durationMonths === 1) return SUBSCRIPTION_SKUS[platform].basic.monthly;
    if (durationMonths === 6) return SUBSCRIPTION_SKUS[platform].basic.sixMonths;
    if (durationMonths === 12) return SUBSCRIPTION_SKUS[platform].basic.yearly;
  } 
  else if (type === SubscriptionType.STANDARD) {
    if (durationMonths === 1) return SUBSCRIPTION_SKUS[platform].standard.monthly;
    if (durationMonths === 6) return SUBSCRIPTION_SKUS[platform].standard.sixMonths;
    if (durationMonths === 12) return SUBSCRIPTION_SKUS[platform].standard.yearly;
  } 
  else if (type === SubscriptionType.PREMIUM) {
    if (durationMonths === 1) return SUBSCRIPTION_SKUS[platform].premium.monthly;
    if (durationMonths === 6) return SUBSCRIPTION_SKUS[platform].premium.sixMonths;
    if (durationMonths === 12) return SUBSCRIPTION_SKUS[platform].premium.yearly;
  }
  
  throw new Error('Invalid subscription type or duration');
}

class PaymentService {
  private purchaseUpdateSubscription: any;
  private purchaseErrorSubscription: any;
  private isInitialized: boolean = false;

  // Get active packages from backend
  async getActivePackages(): Promise<any[]> {
    try {
      const response: any = await api.get('/packages');
      console.log(response, "1121")
      return response;
    } catch (error) {
      console.error('Failed to fetch active packages', error);
      throw error;
    }
  }

  // Khởi tạo kết nối với cửa hàng
  async initializeIAP(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Kết nối với IAP
      await initConnection();
      
      // Lắng nghe sự kiện mua hàng thành công
      this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
        console.log("purchaseUpdatedListener", purchase)
        // Xác thực giao dịch với backend
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          await this.verifyPurchaseWithBackend(purchase);
          await finishTransaction({ purchase });
        }
      });
      
      // Lắng nghe sự kiện lỗi khi mua hàng
      this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
        console.log("purchaseErrorListener", error)
        console.error('Purchase error', error);
      });
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize IAP', error);
      return false;
    }
  }
  
  // Lấy danh sách sản phẩm từ cửa hàng
  async getAvailableSubscriptions(): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        console.log("Initializing IAP...");
        await this.initializeIAP();
      }

      const platform = Platform.OS as 'ios' | 'android';
      console.log("Current platform:", platform);
      
      const skus = [
        ...Object.values(SUBSCRIPTION_SKUS[platform].basic),
        ...Object.values(SUBSCRIPTION_SKUS[platform].standard),
        ...Object.values(SUBSCRIPTION_SKUS[platform].premium)
      ];
      console.log("Requesting products with SKUs:", skus);
      
      const products = await getProducts({ skus });
      console.log("Received products:", JSON.stringify(products, null, 2));
      
      if (products.length === 0) {
        console.warn("No products returned. Please check:");
        console.warn("1. Products are created in Google Play Console");
        console.warn("2. App is uploaded to Google Play Console");
        console.warn("3. Test account is added to License Testing");
        console.warn("4. Device is logged in with test account");
      }
      
      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }
  
  // Thực hiện mua gói đăng ký
  async purchaseSubscription(type: SubscriptionType, durationMonths: 1 | 6 | 12): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeIAP();
      }

      const sku = getSubscriptionSku(type, durationMonths);
      console.log("sku", sku)
    
      // Handle platform-specific purchase parameters
      const params = Platform.select({
        android: { skus: [sku] },
        ios: { sku }
      }) as { skus: string[] } | { sku: string };
    
      await requestPurchase(params as Parameters<typeof requestPurchase>[0]);
      return true;
    } catch (error) {
      console.error('Failed to purchase subscription', error);
      throw error;
    }
  }
  
  // Khôi phục giao dịch (chủ yếu cho iOS)
  async restorePurchases(): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        await this.initializeIAP();
      }

      const purchases = await getAvailablePurchases();
      
      // Xác thực các giao dịch đã mua với backend
      for (const purchase of purchases) {
        await this.verifyPurchaseWithBackend(purchase);
      }
      
      return purchases;
    } catch (error) {
      console.error('Failed to restore purchases', error);
      return [];
    }
  }
  
  // Xác thực giao dịch với backend
  private async verifyPurchaseWithBackend(purchase: ProductPurchase | SubscriptionPurchase): Promise<any> {
    try {
      // Gửi thông tin giao dịch đến backend để xác thực
      const response: any = await api.post('/subscriptions/verify-purchase', {
        productId: purchase.productId,
        transactionId: purchase.transactionId,
        transactionReceipt: purchase.transactionReceipt,
        platform: Platform.OS,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error verifying purchase with backend', error);
      throw error;
    }
  }
  
  // Hủy đăng ký lắng nghe sự kiện
  async cleanup(): Promise<void> {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }

    if (this.isInitialized) {
      await endConnection();
      this.isInitialized = false;
    }
  }
}

export default new PaymentService();
