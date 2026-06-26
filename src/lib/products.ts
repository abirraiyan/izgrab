import strawberry from "@/assets/product-strawberry.jpg";
import chocolate from "@/assets/product-chocolate.jpg";
import macarons from "@/assets/product-macarons.jpg";
import brownie from "@/assets/product-brownie.jpg";
import cheesecake from "@/assets/product-cheesecake.jpg";
import giftbox from "@/assets/product-giftbox.jpg";
import custom from "@/assets/product-custom.jpg";
import izLatte from "@/assets/iz-latte.jpg";
import izCroissant from "@/assets/iz-croissant.jpg";
import izCremeBrulee from "@/assets/iz-cremebrulee.jpg";
import izPecanTart from "@/assets/iz-pecantart.jpg";

export type Product = {
  slug: string;
  name: string;
  price: number;
  image: string;
  /** Optional product video URL (mp4/webm). Plays muted on hover in cards. */
  video?: string;
  category: string;
  tag?: "Best Seller" | "Limited" | "New";
  description: string;
  ingredients: string;
  sizes: string[];
  flavors: string[];
};

export const products: Product[] = [
  {
    slug: "coconut-cold-brew",
    name: "Coconut Cold Brew",
    price: 404,
    image: izLatte,
    category: "Coffee",
    tag: "Best Seller",
    description: "Bold cold brew finished with creamy coconut for a tropical, refreshing café signature.",
    ingredients: "Cold brew coffee, coconut cream, milk, ice, light sweetener.",
    sizes: ["Regular", "Large"],
    flavors: ["Classic Coconut", "Extra Strong", "Less Sweet"],
  },
  {
    slug: "iced-strawberry-matcha-latte",
    name: "Iced Strawberry Matcha Latte",
    price: 652,
    image: izLatte,
    category: "Coffee",
    tag: "Best Seller",
    description: "A smooth iced matcha latte layered with sweet strawberry and chilled milk.",
    ingredients: "Japanese matcha, strawberry, milk, ice, vanilla syrup.",
    sizes: ["Regular", "Large"],
    flavors: ["Strawberry", "Classic Matcha", "Oat Milk"],
  },
  {
    slug: "classic-croissant",
    name: "Classic Butter Croissant",
    price: 360,
    image: izCroissant,
    category: "Croissants",
    tag: "New",
    description: "Flaky, golden, European-style croissant baked fresh for coffee pairings.",
    ingredients: "Butter, flour, milk, yeast, sugar, sea salt.",
    sizes: ["Single", "Box of 4", "Box of 8"],
    flavors: ["Butter", "Chocolate", "Almond"],
  },
  {
    slug: "seafood-aglio-olio",
    name: "Seafood Aglio Olio",
    price: 1028,
    image: izCroissant,
    category: "Meals",
    description: "Al dente spaghetti tossed with shrimp, calamari, garlic, olive oil, sun-dried tomato and parmesan.",
    ingredients: "Spaghetti, shrimp, calamari, garlic, olive oil, sun-dried tomato, parmesan.",
    sizes: ["Single Serving"],
    flavors: ["Regular", "Extra Garlic", "Spicy"],
  },
  {
    slug: "petit-gateaux-cold-cheesecake",
    name: "Petit Gateaux Cold Cheesecake",
    price: 738,
    image: izCremeBrulee,
    category: "Cakes",
    description: "A chilled petit gâteau with creamy cheese filling over a soft biscuit base.",
    ingredients: "Cream cheese, biscuit, butter, cream, sugar, vanilla.",
    sizes: ["Petit", "Pair", "Box of 4"],
    flavors: ["Classic", "Berry", "Caramel"],
  },
  {
    slug: "cashewnut-caramel-tart",
    name: "Cashewnut Caramel Tart",
    price: 395,
    image: izPecanTart,
    category: "Desserts",
    tag: "Limited",
    description: "Buttery tart shell filled with silky caramel and roasted cashews for a rich café dessert.",
    ingredients: "Cashew nuts, caramel, butter, flour, cream, sugar.",
    sizes: ["Single", "Box of 4", "Box of 8"],
    flavors: ["Caramel", "Dark Chocolate", "Sea Salt"],
  },
];

export const categories = [
  { name: "Cakes", image: strawberry, slug: "cakes" },
  { name: "Coffee", image: izLatte, slug: "coffee" },
  { name: "Croissants", image: izCroissant, slug: "croissants" },
  { name: "Meals", image: izCremeBrulee, slug: "meals" },
  { name: "Desserts", image: izPecanTart, slug: "desserts" },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
