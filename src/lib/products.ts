const strawberry = '{"public_id":"iz-grab/products/atqprsdoxxp9pqmdezen","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983351/iz-grab/products/atqprsdoxxp9pqmdezen.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const izLatte = '{"public_id":"iz-grab/products/xdymybbgygjpnm1snt8b","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983352/iz-grab/products/xdymybbgygjpnm1snt8b.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const izCroissant = '{"public_id":"iz-grab/products/gupfdi5jqjnh3mfmmicq","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983353/iz-grab/products/gupfdi5jqjnh3mfmmicq.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const izCremeBrulee = '{"public_id":"iz-grab/products/wvdzrvlxuarvt2xe5y9v","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983354/iz-grab/products/wvdzrvlxuarvt2xe5y9v.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const izPecanTart = '{"public_id":"iz-grab/products/tposaf26ixv0rzbyf6ix","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983354/iz-grab/products/tposaf26ixv0rzbyf6ix.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';

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
    description:
      "Bold cold brew finished with creamy coconut for a tropical, refreshing café signature.",
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
    description:
      "Al dente spaghetti tossed with shrimp, calamari, garlic, olive oil, sun-dried tomato and parmesan.",
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
    description:
      "Buttery tart shell filled with silky caramel and roasted cashews for a rich café dessert.",
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
