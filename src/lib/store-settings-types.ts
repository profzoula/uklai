export type StoreInfoSettings = {
  name: string;
  description: string;
  phone: string;
  email: string;
  country: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
};

export type PaymentSettings = {
  currency: string;
  stripe_enabled: boolean;
  paypal_enabled: boolean;
  cod_enabled: boolean;
};

export type ShippingSettings = {
  flat_rate: string;
  free_shipping_threshold: string;
  international_shipping: boolean;
  origin_country: string;
};

export type TaxSettings = {
  enabled: boolean;
  default_rate: string;
  prices_include_tax: boolean;
};

export type NotificationSettings = {
  order_confirmation: boolean;
  admin_new_order: boolean;
  shipping_updates: boolean;
  sms_updates: boolean;
  admin_email: string;
};

export type AllStoreSettings = {
  store: StoreInfoSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  tax: TaxSettings;
  notifications: NotificationSettings;
};

export const defaultStoreSettings: AllStoreSettings = {
  store: {
    name: "Briclix",
    description: "Briclix Store — premium products at unbeatable prices.",
    phone: "",
    email: "support@briclix.com",
    country: "United States",
    address: "",
    city: "",
    province: "Florida",
    postal_code: "",
  },
  payment: {
    currency: "USD",
    stripe_enabled: true,
    paypal_enabled: false,
    cod_enabled: false,
  },
  shipping: {
    flat_rate: "5.99",
    free_shipping_threshold: "50",
    international_shipping: false,
    origin_country: "United States",
  },
  tax: {
    enabled: true,
    default_rate: "7",
    prices_include_tax: false,
  },
  notifications: {
    order_confirmation: true,
    admin_new_order: true,
    shipping_updates: true,
    sms_updates: false,
    admin_email: "support@briclix.com",
  },
};

export function mergeStoreSettings(
  partial: Partial<AllStoreSettings>
): AllStoreSettings {
  return {
    store: { ...defaultStoreSettings.store, ...partial.store },
    payment: { ...defaultStoreSettings.payment, ...partial.payment },
    shipping: { ...defaultStoreSettings.shipping, ...partial.shipping },
    tax: { ...defaultStoreSettings.tax, ...partial.tax },
    notifications: {
      ...defaultStoreSettings.notifications,
      ...partial.notifications,
    },
  };
}

export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Haiti",
  "France",
  "Germany",
];
