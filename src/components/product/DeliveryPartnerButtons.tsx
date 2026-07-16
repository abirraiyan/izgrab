import React from "react";
import { DELIVERY_LINKS } from "@/config/deliveryLinks";

const FoodpandaIcon: React.FC = () => (
  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 13H9v-2h2v2zm0-4H9V9h2v2zm4 4h-2v-2h2v2zm0-4h-2V9h2v2z" />
  </svg>
);

const FoodiIcon: React.FC = () => (
  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21v-8c0-2.76-2.24-5-5-5z" />
  </svg>
);

interface DeliveryPartnerButtonsProps {
  foodpandaUrl?: string;
  foodiUrl?: string;
}

export const DeliveryPartnerButtons: React.FC<DeliveryPartnerButtonsProps> = React.memo(({
  foodpandaUrl,
  foodiUrl,
}) => {
  const finalFoodpandaUrl = foodpandaUrl || DELIVERY_LINKS.foodpanda;
  const finalFoodiUrl = foodiUrl || DELIVERY_LINKS.foodi;

  const hasFoodi = !!finalFoodiUrl;

  const handleRedirect = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <button
        onClick={() => handleRedirect(finalFoodpandaUrl)}
        className={`${
          hasFoodi ? "flex-1" : "w-full"
        } h-14 rounded-full bg-[#D70F64] hover:bg-[#b00c52] active:bg-[#960a45] text-white flex items-center justify-center gap-3 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#D70F64]/50 focus:ring-offset-2`}
        aria-label="Order this dessert on Foodpanda"
      >
        <FoodpandaIcon />
        <span>Order on Foodpanda</span>
      </button>

      {hasFoodi && (
        <button
          onClick={() => handleRedirect(finalFoodiUrl)}
          className="flex-1 h-14 rounded-full bg-[#FF6B00] hover:bg-[#d95b00] active:bg-[#b84d00] text-white flex items-center justify-center gap-3 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 focus:ring-offset-2"
          aria-label="Order this dessert on Foodi"
        >
          <FoodiIcon />
          <span>Order on Foodi</span>
        </button>
      )}
    </div>
  );
});

DeliveryPartnerButtons.displayName = "DeliveryPartnerButtons";
