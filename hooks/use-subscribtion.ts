import { create } from "zustand";

type SubscriptionPlan = {
  subscription: "Basic" | "Pro";
  setSubscription: (subscription: "Basic" | "Pro") => void;  // Make sure this is defined
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  totalStorage: number;
  setTotalStorage: (totalStorage: number) => void;
};

export const useSubscription = create<SubscriptionPlan>((set) => ({
  subscription: "Basic",
  setSubscription: (subscription) => set({ subscription }),  // Make sure this is included
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
  totalStorage: 0,
  setTotalStorage: (totalStorage) => set({ totalStorage }),
}));