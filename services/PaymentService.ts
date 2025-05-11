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
  PurchaseError
} from 'react-native-iap';
import { api } from './api';
import { SubscriptionType } from '@/interfaces/package.interface';
import Constants from 'expo-constants';

// Kiểm tra xem có đang chạy trong Expo Go không
const isExpoGo = Constants.appOwnership === 'expo';

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
    // Nếu đang chạy trong Expo Go, trả về true mà không khởi tạo IAP
    if (isExpoGo) {
      console.log('Running in Expo Go environment, skipping IAP initialization');
      return true;
    }
    
    try {
      await initConnection();
      
      // Lắng nghe sự kiện mua hàng thành công
      this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
        // Xác thực giao dịch với backend
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          await this.verifyPurchaseWithBackend(purchase);
          await finishTransaction({ purchase });
        }
      });
      
      // Lắng nghe sự kiện lỗi khi mua hàng
      this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
        console.error('Purchase error', error);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to initialize IAP', error);
      return false;
    }
  }
  
  // Lấy danh sách sản phẩm từ cửa hàng
  async getAvailableSubscriptions(): Promise<any[]> {
    // Nếu đang chạy trong Expo Go, trả về mảng rỗng
    if (isExpoGo) {
      console.log('Running in Expo Go environment, returning mock subscriptions');
      // Trả về dữ liệu giả để test UI
      return [
        {
          productId: 'basic_monthly',
          title: 'Basic Monthly (Test)',
          description: 'Basic subscription for 1 month',
          price: '9.99',
          currency: 'USD'
        }
      ];
    }
    
    try {
      const platform = Platform.OS as 'ios' | 'android';
      const skus = [
        ...Object.values(SUBSCRIPTION_SKUS[platform].basic),
        ...Object.values(SUBSCRIPTION_SKUS[platform].standard),
        ...Object.values(SUBSCRIPTION_SKUS[platform].premium)
      ];
      
      const products = await getProducts({ skus });
      return products;
    } catch (error) {
      console.error('Failed to get products', error);
      return [];
    }
  }
  
  // Thực hiện mua gói đăng ký
  async purchaseSubscription(type: SubscriptionType, durationMonths: 1 | 6 | 12): Promise<boolean> {
    // Nếu đang chạy trong Expo Go, gọi trực tiếp API backend
    if (isExpoGo) {
      console.log('Running in Expo Go environment, calling backend API directly');
      try {
        // Gọi API backend trực tiếp để xử lý mua gói cước
        const response: any = await api.post('/subscriptions/purchase', { 
          type, 
          durationMonths
        });
        console.log('Purchase response:', response.data);
        return true;
      } catch (error) {
        console.error('Failed to purchase subscription via backend', error);
        throw error; // Ném lỗi để UI có thể hiển thị thông báo lỗi
      }
    }
    
    try {
      const sku = getSubscriptionSku(type, durationMonths);
      await requestPurchase({ sku });
      return true;
    } catch (error) {
      console.error('Failed to purchase subscription', error);
      throw error;
    }
  }
  
  // Khôi phục giao dịch (chủ yếu cho iOS)
  async restorePurchases(): Promise<any[]> {
    // Nếu đang chạy trong Expo Go, trả về mảng rỗng
    if (isExpoGo) {
      console.log('Running in Expo Go environment, simulating restore purchases');
      return [];
    }
    
    try {
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
  cleanup(): void {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
  }
}

export default new PaymentService();
