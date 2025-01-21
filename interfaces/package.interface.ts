export interface Package {
  id: string;
  name: string;
  price: number | null; // null for custom/contact admin packages
  duration: string;
  features: string[];
  maxStreams: number;
  maxDuration: number; // in minutes, 0 means unlimited
  recommended?: boolean;
  isCustom?: boolean; // flag for custom packages requiring admin contact
}

export const PACKAGES: Package[] = [
  {
    id: "1",
    name: "Free",
    price: 0,
    duration: "1 month",
    features: ["Monitor 1 live stream (max 30 minutes)", "Text-to-Speech for comments", "Export to Excel"],
    maxStreams: 1,
    maxDuration: 30,
  },
  {
    id: "2",
    name: "Basic",
    price: 3.99,
    duration: "1 month",
    features: ["Monitor 1 live stream no time limit", "Text-to-Speech for comments", "Export to Excel"],
    maxStreams: 1,
    maxDuration: 0,
  },
  {
    id: "3",
    name: "Standard",
    price: 7.99,
    duration: "1 month",
    features: ["Monitor 2 live stream no time limit", "Text-to-Speech for comments", "Export to Excel"],
    maxStreams: 2,
    maxDuration: 0,
    recommended: true,
  },
  {
    id: "4",
    name: "Premium",
    price: 19.99,
    duration: "1 month",
    features: ["Monitor up to 5 live streams simultaneously", "Text-to-Speech for comments", "Export to Excel"],
    maxStreams: 5,
    maxDuration: 0,
  },
  {
    id: "5",
    name: "Custom",
    price: null,
    duration: "Flexible",
    features: [
      "Custom number of streams",
      "All Premium features",
      "Priority support",
      "Custom features on request",
      "Contact admin for pricing"
    ],
    maxStreams: 999, // Placeholder value, actual limit set by admin
    maxDuration: 0,
    isCustom: true
  },
];
