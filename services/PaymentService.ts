import { Platform } from "react-native";
import {
  initConnection,
  getSubscriptions,
  requestSubscription,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  ProductPurchase,
  SubscriptionPurchase,
  PurchaseError,
  endConnection,
  Subscription,
} from "react-native-iap";
import { api } from "./api";
import { Package, SubscriptionType } from "@/interfaces/package.interface";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

// Định nghĩa ID sản phẩm cho từng nền tảng
const SUBSCRIPTION_SKUS = {
  android: {
    basic: ["basic1", "basic6", "basic12"],
    standard: ["standard1", "standard6", "standard12"],
    premium: ["premium1", "premium6", "premium12"],
  },
  ios: {
    basic: ["basic1", "basic6", "basic12"],
    standard: ["standard1", "standard6", "standard12"],
    premium: ["premium1", "premium6", "premium12"],
  },
};

// Type definitions for subscription data
interface PricingPhase {
  recurrenceMode: number;
  priceAmountMicros: string;
  billingCycleCount: number;
  billingPeriod: string;
  priceCurrencyCode: string;
  formattedPrice: string;
}

interface PricingPhases {
  pricingPhaseList: PricingPhase[];
}

interface SubscriptionOffer {
  pricingPhases: PricingPhases;
  offerToken: string;
  offerTags: string[];
  offerId: string | null;
  basePlanId: string;
}

interface SubscriptionWithOffers {
  productId: string;
  name: string;
  description: string;
  title: string;
  platform: string;
  subscriptionOfferDetails: SubscriptionOffer[];
}

// Helper function to get subscription SKU
const getSubscriptionSku = (type: SubscriptionType, durationMonths: 1 | 6 | 12): [string, string] => {
  const typeMap = {
    [SubscriptionType.BASIC]: "basic",
    [SubscriptionType.STANDARD]: "standard",
    [SubscriptionType.PREMIUM]: "premium",
  };

  if (type === SubscriptionType.FREE || type === SubscriptionType.CUSTOM) {
    throw new Error("Invalid subscription type");
  }

  return [typeMap[type], `${typeMap[type]}${durationMonths}`];
};

class PaymentService {
  private purchaseUpdateSubscription: any;
  private purchaseErrorSubscription: any;
  private isInitialized: boolean = false;
  private availableSubscriptions: SubscriptionWithOffers[] = [];

  // Get active packages from backend and merge with IAP prices
  async getActivePackages(): Promise<Package[]> {
    try {
      if (!this.isInitialized) {
        await this.initializeIAP();
      }

      // Get packages from backend
      const response: Package[] = await api.get("/packages");

      // Get prices from IAP
      const platform = Platform.OS as "ios" | "android";
      const skus = Object.keys(SUBSCRIPTION_SKUS[platform]);
      const subscriptions = (await getSubscriptions({ skus })) as SubscriptionWithOffers[];
      this.availableSubscriptions = subscriptions;

      // Update prices from IAP
      return response.map(pkg => {
        if (pkg.type === SubscriptionType.FREE || pkg.type === SubscriptionType.CUSTOM) {
          return pkg;
        }

        const typeMap = {
          [SubscriptionType.BASIC]: "basic",
          [SubscriptionType.STANDARD]: "standard",
          [SubscriptionType.PREMIUM]: "premium",
        };

        const typeSku = typeMap[pkg.type];
        const subscription = subscriptions.find(sub => sub.productId === typeSku);

        if (subscription) {
          // Get monthly price from subscription offer details
          const monthlyOffer = subscription.subscriptionOfferDetails.find(offer => offer.basePlanId === `${typeSku}1`);



          if (monthlyOffer) {
            const pricePhase = monthlyOffer.pricingPhases.pricingPhaseList[0];
            const price = pricePhase.priceAmountMicros ? parseFloat(pricePhase.priceAmountMicros) / 1000000 : 0;
            
            const value = {
              subscriptionOfferDetails: subscription.subscriptionOfferDetails,
              ...pkg,
              basePrice: price,
              baseFormattedPrice: pricePhase.formattedPrice,
              basePriceCurrencyCode: pricePhase.priceCurrencyCode,
            };

            return value;
          }
        }

        return { ...pkg, price: 0 };
      });
    } catch (error) {
      console.error("Failed to fetch active packages", error);
      throw error;
    }
  }

  // Khởi tạo kết nối với cửa hàng
  async initializeIAP(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      await initConnection();

      let duplicate: Record<string, number> = {};

      // Lắng nghe sự kiện mua gói cước thành công
      this.purchaseUpdateSubscription = purchaseUpdatedListener(async purchase => {
        if (duplicate[JSON.stringify(purchase)]) {
          duplicate[JSON.stringify(purchase)] += 1;
        } else {
          duplicate[JSON.stringify(purchase)] = 1;
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            try {
              const data = await this.verifySubscriptionWithBackend(purchase);
              console.log("data", data);
            } catch (error) {
              console.error("Error verifying subscription with backend", error);
            } finally {
              // await finishTransaction({ purchase, isConsumable: true });
              await finishTransaction({ purchase, isConsumable: false });
            }
          }
        }
      });

      let duplicateError: Record<string, number> = {};
      this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
        if (duplicateError[JSON.stringify(error)]) {
          duplicateError[JSON.stringify(error)] += 1;
        } else {
          duplicateError[JSON.stringify(error)] = 1;
          console.error("Subscription purchase error", error);
        }
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize IAP", error);
      return false;
    }
  }

  // Lấy danh sách gói cước từ cửa hàng
  async getAvailableSubscriptions(): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        await this.initializeIAP();
      }

      const platform = Platform.OS as "ios" | "android";
      const skus = Object.keys(SUBSCRIPTION_SKUS[platform]);

      const subscriptions = await getSubscriptions({ skus });
      if (!subscriptions || !subscriptions.length) {
        console.warn("No subscriptions available. Please check store configuration.");
      }

      return subscriptions;
    } catch (error) {
      console.error("Failed to get subscriptions:", error);
      throw error;
    }
  }

  // Xác thực gói cước với backend
  private async verifySubscriptionWithBackend(purchase: ProductPurchase | SubscriptionPurchase): Promise<any> {
    try {
      console.log("purchase:", purchase);
      const response: any = await api.post("/subscriptions/verify-purchase", {
        productId: purchase.productId,
        transactionId: purchase.transactionId,
        transactionReceipt: purchase.transactionReceipt,
        platform: Platform.OS,
      });
      console.log("response", response);
      if (response._id) {
        const store = useSubscriptionStore.getState();
        await store.fetchCurrentSubscription();
      }
      return response;
    } catch (error) {
      console.error("Error verifying subscription with backend", error);
      throw error;
    } finally {
      const store = useSubscriptionStore.getState();
      store.setPurchasing(false);
    }
  }

  // Thực hiện mua gói cước
  async purchaseSubscription(type: SubscriptionType, durationMonths: 1 | 6 | 12): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeIAP();
      }

      const [typeSku, sku] = getSubscriptionSku(type, durationMonths);
      console.log("Attempting to purchase subscription:", sku);

      const subscription = this.availableSubscriptions.find(sub => sub.productId === typeSku);
      if (!subscription) {
        throw new Error("No subscriptions available");
      }

      const offerToken = (subscription as any).subscriptionOfferDetails.find(
        (item: any) => item.basePlanId === sku,
      )?.offerToken;

      if (!offerToken) {
        throw new Error("No offer token available");
      }

      const params = Platform.select({
        android: {
          skus: [typeSku],
          subscriptionOffers: [
            {
              sku: typeSku,
              offerToken: offerToken,
            },
          ],
        },
        ios: { typeSku },
      }) as { skus: string[]; subscriptionOffers: any[] } | { sku: string };

      const store = useSubscriptionStore.getState();
      store.setPurchasing(true);
      await requestSubscription(params as Parameters<typeof requestSubscription>[0]);
      return true;
    } catch (error: any) {
      const store = useSubscriptionStore.getState();
      store.setPurchasing(false);
      console.error("Failed to purchase subscription", error);
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

  // Reset IAP state when user logs out
  async resetIAPState(): Promise<void> {
    await this.cleanup();
  }

  // Reinitialize IAP when user logs in
  async reinitializeIAP(): Promise<void> {
    await this.cleanup();
    await this.initializeIAP();
  }
}

export default new PaymentService();
