import type { FoodItem } from "./math";

/** Seed food database (~60 common items) — grams-based macros. */
export const SEED_FOODS: FoodItem[] = [
  { id: "egg-large", name: "Egg, large", servingGrams: 50, servingLabel: "1 large (50g)", per: { calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, sodium: 71 }, tags: ["protein"] },
  { id: "egg-white", name: "Egg white", servingGrams: 33, servingLabel: "1 white (33g)", per: { calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1 }, tags: ["protein"] },
  { id: "chicken-breast", name: "Chicken breast, cooked", servingGrams: 100, servingLabel: "100g", per: { calories: 165, protein: 31, carbs: 0, fat: 3.6 }, tags: ["protein"] },
  { id: "chicken-thigh", name: "Chicken thigh, cooked", servingGrams: 100, servingLabel: "100g", per: { calories: 209, protein: 26, carbs: 0, fat: 10.9 }, tags: ["protein"] },
  { id: "ground-beef-90", name: "Ground beef 90% lean, cooked", servingGrams: 100, servingLabel: "100g", per: { calories: 217, protein: 26, carbs: 0, fat: 11.8 }, tags: ["protein"] },
  { id: "salmon", name: "Salmon, Atlantic, cooked", servingGrams: 100, servingLabel: "100g", per: { calories: 208, protein: 20, carbs: 0, fat: 13 }, tags: ["protein", "fish"] },
  { id: "tuna-can", name: "Tuna, canned in water", servingGrams: 85, servingLabel: "1 can drained (85g)", per: { calories: 99, protein: 22, carbs: 0, fat: 0.7, sodium: 320 }, tags: ["protein"] },
  { id: "turkey-deli", name: "Turkey breast deli", servingGrams: 28, servingLabel: "1 slice (28g)", per: { calories: 29, protein: 5.5, carbs: 0.5, fat: 0.4, sodium: 230 }, tags: ["protein"] },
  { id: "tofu-firm", name: "Tofu, firm", servingGrams: 100, servingLabel: "100g", per: { calories: 144, protein: 17, carbs: 3, fat: 8.7 }, tags: ["protein", "vegan"] },
  { id: "greek-yogurt-0", name: "Greek yogurt, nonfat", servingGrams: 170, servingLabel: "1 container (170g)", per: { calories: 100, protein: 17, carbs: 6, fat: 0, sugar: 6 }, tags: ["dairy", "protein"] },
  { id: "greek-yogurt-2", name: "Greek yogurt, 2%", servingGrams: 170, servingLabel: "1 container (170g)", per: { calories: 150, protein: 16, carbs: 6, fat: 4, sugar: 5 }, tags: ["dairy"] },
  { id: "cottage-1", name: "Cottage cheese 1%", servingGrams: 113, servingLabel: "1/2 cup (113g)", per: { calories: 81, protein: 14, carbs: 3, fat: 1, sodium: 400 }, tags: ["dairy", "protein"] },
  { id: "milk-2", name: "Milk, 2%", servingGrams: 244, servingLabel: "1 cup (244g)", per: { calories: 122, protein: 8, carbs: 12, fat: 5, sugar: 12 }, tags: ["dairy"] },
  { id: "oat-milk", name: "Oat milk", servingGrams: 240, servingLabel: "1 cup", per: { calories: 120, protein: 3, carbs: 16, fat: 5, sugar: 7 }, tags: ["vegan"] },
  { id: "whey", name: "Whey protein isolate powder", servingGrams: 30, servingLabel: "1 scoop (30g)", per: { calories: 110, protein: 25, carbs: 1, fat: 0.5 }, tags: ["protein", "supplement"] },
  { id: "rice-white", name: "White rice, cooked", servingGrams: 158, servingLabel: "1 cup (158g)", per: { calories: 206, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6 }, tags: ["carb"] },
  { id: "rice-brown", name: "Brown rice, cooked", servingGrams: 195, servingLabel: "1 cup (195g)", per: { calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5 }, tags: ["carb"] },
  { id: "oats", name: "Oats, dry", servingGrams: 40, servingLabel: "1/2 cup dry (40g)", per: { calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4 }, tags: ["carb", "breakfast"] },
  { id: "bread-wheat", name: "Whole wheat bread", servingGrams: 28, servingLabel: "1 slice (28g)", per: { calories: 69, protein: 3.6, carbs: 11.6, fat: 1.1, fiber: 1.9 }, tags: ["carb"] },
  { id: "bagel", name: "Bagel, plain", servingGrams: 95, servingLabel: "1 medium (95g)", per: { calories: 260, protein: 10, carbs: 51, fat: 1.5, fiber: 2 }, tags: ["carb"] },
  { id: "pasta", name: "Pasta, cooked", servingGrams: 140, servingLabel: "1 cup (140g)", per: { calories: 220, protein: 8, carbs: 43, fat: 1.3, fiber: 2.5 }, tags: ["carb"] },
  { id: "potato", name: "Potato, baked", servingGrams: 173, servingLabel: "1 medium (173g)", per: { calories: 161, protein: 4.3, carbs: 37, fat: 0.2, fiber: 3.8 }, tags: ["carb"] },
  { id: "sweet-potato", name: "Sweet potato, baked", servingGrams: 114, servingLabel: "1 medium (114g)", per: { calories: 103, protein: 2.3, carbs: 24, fat: 0.2, fiber: 3.8 }, tags: ["carb"] },
  { id: "banana", name: "Banana", servingGrams: 118, servingLabel: "1 medium (118g)", per: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14 }, tags: ["fruit"] },
  { id: "apple", name: "Apple", servingGrams: 182, servingLabel: "1 medium (182g)", per: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19 }, tags: ["fruit"] },
  { id: "berries", name: "Mixed berries", servingGrams: 140, servingLabel: "1 cup (140g)", per: { calories: 70, protein: 1, carbs: 17, fat: 0.4, fiber: 5, sugar: 10 }, tags: ["fruit"] },
  { id: "avocado", name: "Avocado", servingGrams: 50, servingLabel: "1/3 fruit (50g)", per: { calories: 80, protein: 1, carbs: 4, fat: 7.5, fiber: 3 }, tags: ["fat", "fruit"] },
  { id: "broccoli", name: "Broccoli, cooked", servingGrams: 156, servingLabel: "1 cup (156g)", per: { calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5 }, tags: ["veg"] },
  { id: "spinach", name: "Spinach, raw", servingGrams: 30, servingLabel: "1 cup (30g)", per: { calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7 }, tags: ["veg"] },
  { id: "asparagus", name: "Asparagus, cooked", servingGrams: 90, servingLabel: "6 spears (90g)", per: { calories: 20, protein: 2.2, carbs: 3.7, fat: 0.2, fiber: 1.8 }, tags: ["veg"] },
  { id: "carrots", name: "Carrots, raw", servingGrams: 61, servingLabel: "1 medium (61g)", per: { calories: 25, protein: 0.6, carbs: 6, fat: 0.1, fiber: 1.7, sugar: 3 }, tags: ["veg"] },
  { id: "olive-oil", name: "Olive oil", servingGrams: 14, servingLabel: "1 tbsp (14g)", per: { calories: 119, protein: 0, carbs: 0, fat: 13.5 }, tags: ["fat"] },
  { id: "butter", name: "Butter", servingGrams: 14, servingLabel: "1 tbsp (14g)", per: { calories: 102, protein: 0.1, carbs: 0, fat: 11.5 }, tags: ["fat", "dairy"] },
  { id: "pb", name: "Peanut butter", servingGrams: 32, servingLabel: "2 tbsp (32g)", per: { calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 2 }, tags: ["fat", "protein"] },
  { id: "almonds", name: "Almonds", servingGrams: 28, servingLabel: "1 oz (28g)", per: { calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5 }, tags: ["fat", "nuts"] },
  { id: "cheese-cheddar", name: "Cheddar cheese", servingGrams: 28, servingLabel: "1 oz (28g)", per: { calories: 114, protein: 7, carbs: 0.4, fat: 9.4, sodium: 174 }, tags: ["dairy", "fat"] },
  { id: "rice-cakes", name: "Rice cake, plain", servingGrams: 9, servingLabel: "1 cake (9g)", per: { calories: 35, protein: 0.7, carbs: 7.3, fat: 0.3 }, tags: ["carb"] },
  { id: "tortilla", name: "Flour tortilla", servingGrams: 45, servingLabel: "1 medium (45g)", per: { calories: 140, protein: 4, carbs: 24, fat: 3.5, fiber: 1 }, tags: ["carb"] },
  { id: "black-beans", name: "Black beans, cooked", servingGrams: 172, servingLabel: "1 cup (172g)", per: { calories: 227, protein: 15, carbs: 41, fat: 0.9, fiber: 15 }, tags: ["carb", "protein", "vegan"] },
  { id: "lentils", name: "Lentils, cooked", servingGrams: 198, servingLabel: "1 cup (198g)", per: { calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 16 }, tags: ["protein", "vegan"] },
  { id: "quinoa", name: "Quinoa, cooked", servingGrams: 185, servingLabel: "1 cup (185g)", per: { calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5 }, tags: ["carb"] },
  { id: "protein-bar", name: "Protein bar (generic)", servingGrams: 60, servingLabel: "1 bar (60g)", per: { calories: 200, protein: 20, carbs: 22, fat: 6, fiber: 3, sugar: 8 }, tags: ["snack"] },
  { id: "coffee-black", name: "Coffee, black", servingGrams: 240, servingLabel: "1 cup", per: { calories: 2, protein: 0.3, carbs: 0, fat: 0 }, tags: ["drink"] },
  { id: "soda", name: "Cola soda", servingGrams: 355, servingLabel: "12 oz can", per: { calories: 140, protein: 0, carbs: 39, fat: 0, sugar: 39 }, tags: ["drink"] },
  { id: "beer", name: "Beer, regular", servingGrams: 356, servingLabel: "12 oz", per: { calories: 153, protein: 1.6, carbs: 13, fat: 0 }, tags: ["drink", "alcohol"] },
  { id: "wine", name: "Wine, red", servingGrams: 147, servingLabel: "5 oz", per: { calories: 125, protein: 0.1, carbs: 4, fat: 0 }, tags: ["drink", "alcohol"] },
  { id: "pizza-slice", name: "Pizza, cheese slice", servingGrams: 107, servingLabel: "1 slice (107g)", per: { calories: 285, protein: 12, carbs: 36, fat: 10, sodium: 640 }, tags: ["meal"] },
  { id: "burger", name: "Hamburger, single", servingGrams: 150, servingLabel: "1 sandwich", per: { calories: 350, protein: 17, carbs: 32, fat: 17, sodium: 500 }, tags: ["meal"] },
  { id: "fries", name: "French fries", servingGrams: 117, servingLabel: "medium (117g)", per: { calories: 365, protein: 4, carbs: 48, fat: 17 }, tags: ["carb", "fat"] },
  { id: "ice-cream", name: "Ice cream, vanilla", servingGrams: 66, servingLabel: "1/2 cup (66g)", per: { calories: 137, protein: 2.3, carbs: 16, fat: 7, sugar: 14 }, tags: ["dessert"] },
  { id: "dark-chocolate", name: "Dark chocolate 70%", servingGrams: 28, servingLabel: "1 oz (28g)", per: { calories: 170, protein: 2, carbs: 13, fat: 12, sugar: 7, fiber: 3 }, tags: ["dessert"] },
  { id: "honey", name: "Honey", servingGrams: 21, servingLabel: "1 tbsp (21g)", per: { calories: 64, protein: 0.1, carbs: 17, fat: 0, sugar: 17 }, tags: ["carb"] },
  { id: "maple", name: "Maple syrup", servingGrams: 20, servingLabel: "1 tbsp (20g)", per: { calories: 52, protein: 0, carbs: 13, fat: 0, sugar: 12 }, tags: ["carb"] },
  { id: "cream-cheese", name: "Cream cheese", servingGrams: 28, servingLabel: "2 tbsp (28g)", per: { calories: 99, protein: 2, carbs: 1.6, fat: 10 }, tags: ["dairy", "fat"] },
  { id: "sour-cream", name: "Sour cream", servingGrams: 30, servingLabel: "2 tbsp (30g)", per: { calories: 59, protein: 0.7, carbs: 1.3, fat: 5.8 }, tags: ["dairy"] },
  { id: "mayo", name: "Mayonnaise", servingGrams: 14, servingLabel: "1 tbsp (14g)", per: { calories: 94, protein: 0.1, carbs: 0.1, fat: 10 }, tags: ["fat"] },
  { id: "ketchup", name: "Ketchup", servingGrams: 17, servingLabel: "1 tbsp (17g)", per: { calories: 17, protein: 0.2, carbs: 4.5, fat: 0, sugar: 3.7, sodium: 160 }, tags: ["condiment"] },
  { id: "hummus", name: "Hummus", servingGrams: 30, servingLabel: "2 tbsp (30g)", per: { calories: 70, protein: 2, carbs: 6, fat: 5, fiber: 2 }, tags: ["snack"] },
  { id: "popcorn", name: "Popcorn, air-popped", servingGrams: 8, servingLabel: "1 cup (8g)", per: { calories: 31, protein: 1, carbs: 6, fat: 0.4, fiber: 1.2 }, tags: ["snack"] },
  { id: "salmon-rice-meal", name: "Recipe: Salmon + rice + asparagus", servingGrams: 400, servingLabel: "1 plate (400g)", per: { calories: 520, protein: 38, carbs: 45, fat: 18, fiber: 4 }, tags: ["recipe", "meal"], isRecipe: true },
  { id: "taco-plate", name: "Recipe: Beef tacos (2)", servingGrams: 250, servingLabel: "2 tacos", per: { calories: 480, protein: 28, carbs: 36, fat: 24, fiber: 4, sodium: 720 }, tags: ["recipe", "meal"], isRecipe: true },
];

export function searchFoods(foods: FoodItem[], q: string, limit = 25): FoodItem[] {
  const s = q.trim().toLowerCase();
  if (!s) return foods.filter((f) => f.favorite).slice(0, limit);
  return foods
    .filter(
      (f) =>
        f.name.toLowerCase().includes(s) ||
        f.brand?.toLowerCase().includes(s) ||
        f.tags?.some((t) => t.includes(s)) ||
        f.barcode === s
    )
    .slice(0, limit);
}
