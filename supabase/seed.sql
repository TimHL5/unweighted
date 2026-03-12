-- ============================================================
-- Unweighted - Seed Data
-- ============================================================
-- This file seeds the database with:
--   1. 200 common foods with accurate USDA nutrition data
--   2. 27 achievements for gamification
--   3. 5 starter challenges
-- ============================================================

-- ============================================================
-- 1. FOODS - 200 Common Foods with USDA Nutrition Data
-- ============================================================

-- -------------------------------------------------------
-- PROTEINS (15 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Chicken Breast, Grilled', NULL, NULL, 'verified', NULL, 113, '4 oz', 187, 35, 0, 4, 0, 0, 70, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Salmon, Atlantic', NULL, NULL, 'verified', NULL, 113, '4 oz', 233, 25, 0, 14, 0, 0, 59, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Ground Beef, 90/10', NULL, NULL, 'verified', NULL, 113, '4 oz', 200, 22, 0, 11, 0, 0, 75, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Turkey Breast, Deli', NULL, NULL, 'verified', NULL, 113, '4 oz', 120, 26, 0, 1, 0, 0, 1050, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Egg, Large', NULL, NULL, 'verified', NULL, 50, '1 egg', 72, 6, 0.4, 5, 0, 0.2, 71, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Greek Yogurt, Plain Nonfat', NULL, NULL, 'verified', NULL, 245, '1 cup', 100, 17, 6, 0.7, 0, 6, 68, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Cottage Cheese, 2%', NULL, NULL, 'verified', NULL, 226, '1 cup', 183, 24, 10, 5, 0, 7, 746, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Tuna, Canned in Water', NULL, NULL, 'verified', NULL, 85, '3 oz', 73, 17, 0, 0.5, 0, 0, 287, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Shrimp', NULL, NULL, 'verified', NULL, 113, '4 oz', 120, 23, 1, 2, 0, 0, 805, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Tofu, Firm', NULL, NULL, 'verified', NULL, 126, '1/2 cup', 88, 10, 2, 5, 0.5, 0.5, 11, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Whey Protein Powder', NULL, NULL, 'verified', NULL, 30, '1 scoop', 120, 24, 3, 1, 0, 1, 130, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Pork Chop, Boneless', NULL, NULL, 'verified', NULL, 113, '4 oz', 187, 30, 0, 7, 0, 0, 55, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Chicken Thigh', NULL, NULL, 'verified', NULL, 113, '4 oz', 209, 26, 0, 11, 0, 0, 84, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Tilapia', NULL, NULL, 'verified', NULL, 113, '4 oz', 110, 23, 0, 2, 0, 0, 56, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Ground Turkey', NULL, NULL, 'verified', NULL, 113, '4 oz', 170, 21, 0, 9, 0, 0, 88, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- GRAINS & STARCHES (12 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'White Rice, Cooked', NULL, NULL, 'verified', NULL, 186, '1 cup', 206, 4, 45, 0.4, 0.6, 0, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Brown Rice, Cooked', NULL, NULL, 'verified', NULL, 195, '1 cup', 216, 5, 45, 1.8, 3.5, 0.7, 10, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Oatmeal, Dry', NULL, NULL, 'verified', NULL, 40, '1/2 cup', 150, 5, 27, 2.5, 4, 0.6, 0, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Whole Wheat Bread', NULL, NULL, 'verified', NULL, 43, '1 slice', 110, 4, 20, 1.5, 3, 3, 170, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Pasta, Cooked', NULL, NULL, 'verified', NULL, 140, '1 cup', 220, 8, 43, 1.3, 2.5, 0.8, 1, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Quinoa, Cooked', NULL, NULL, 'verified', NULL, 185, '1 cup', 222, 8, 39, 3.6, 5, 1.6, 13, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Flour Tortilla, Large', NULL, NULL, 'verified', NULL, 64, '1 tortilla', 190, 5, 32, 5, 1.5, 1, 410, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Bagel, Plain', NULL, NULL, 'verified', NULL, 105, '1 medium', 270, 10, 53, 1.5, 2, 6, 430, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Cereal, Generic', NULL, NULL, 'verified', NULL, 30, '1 cup', 110, 2, 24, 0.5, 1, 9, 200, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Sweet Potato', NULL, NULL, 'verified', NULL, 130, '1 medium', 112, 2, 26, 0.1, 3.8, 5.4, 72, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Potato', NULL, NULL, 'verified', NULL, 150, '1 medium', 130, 3, 30, 0.2, 2.1, 1.3, 11, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'English Muffin', NULL, NULL, 'verified', NULL, 57, '1 muffin', 132, 5, 25, 1, 1.5, 2, 248, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- FRUITS (12 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Banana', NULL, NULL, 'verified', NULL, 118, '1 medium', 105, 1.3, 27, 0.4, 3.1, 14, 1, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Apple', NULL, NULL, 'verified', NULL, 182, '1 medium', 95, 0.5, 25, 0.3, 4.4, 19, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Blueberries', NULL, NULL, 'verified', NULL, 148, '1 cup', 84, 1, 21, 0.5, 3.6, 15, 1, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Strawberries', NULL, NULL, 'verified', NULL, 152, '1 cup', 49, 1, 12, 0.5, 3, 7.4, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Orange', NULL, NULL, 'verified', NULL, 131, '1 medium', 62, 1.2, 15, 0.2, 3.1, 12, 0, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Grapes', NULL, NULL, 'verified', NULL, 151, '1 cup', 104, 1, 27, 0.2, 1.4, 23, 3, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Avocado', NULL, NULL, 'verified', NULL, 68, '1/2 fruit', 114, 1.3, 6, 10.5, 4.6, 0.2, 5, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Mango, Sliced', NULL, NULL, 'verified', NULL, 165, '1 cup', 99, 1.4, 25, 0.6, 2.6, 23, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Watermelon, Diced', NULL, NULL, 'verified', NULL, 152, '1 cup', 46, 0.9, 12, 0.2, 0.6, 9.4, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Pineapple, Chunks', NULL, NULL, 'verified', NULL, 165, '1 cup', 82, 0.9, 22, 0.2, 2.3, 16, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Raspberries', NULL, NULL, 'verified', NULL, 123, '1 cup', 64, 1.5, 15, 0.8, 8, 5.4, 1, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Peach', NULL, NULL, 'verified', NULL, 150, '1 medium', 59, 1.4, 14, 0.4, 2.3, 13, 0, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- VEGETABLES (15 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Broccoli', NULL, NULL, 'verified', NULL, 91, '1 cup', 31, 2.6, 6, 0.3, 2.4, 1.5, 30, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Spinach, Raw', NULL, NULL, 'verified', NULL, 60, '2 cups', 14, 1.7, 2.2, 0.2, 1.3, 0.3, 47, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Carrots, Raw', NULL, NULL, 'verified', NULL, 128, '1 cup', 52, 1.2, 12, 0.3, 3.6, 6, 88, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Bell Pepper, Red', NULL, NULL, 'verified', NULL, 119, '1 medium', 37, 1, 7, 0.4, 2.1, 5, 4, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Tomato', NULL, NULL, 'verified', NULL, 123, '1 medium', 22, 1.1, 4.8, 0.2, 1.5, 3.2, 6, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Cucumber, Sliced', NULL, NULL, 'verified', NULL, 104, '1 cup', 16, 0.7, 3, 0.1, 0.5, 1.7, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Green Beans', NULL, NULL, 'verified', NULL, 125, '1 cup', 34, 1.8, 7.8, 0.1, 3.4, 3.3, 6, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Corn, Ear', NULL, NULL, 'verified', NULL, 90, '1 medium ear', 77, 3, 17, 1, 2, 3, 1, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Celery, Diced', NULL, NULL, 'verified', NULL, 101, '1 cup', 14, 0.7, 3, 0.2, 1.6, 1.3, 81, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Onion, Chopped', NULL, NULL, 'verified', NULL, 160, '1 cup', 64, 1.8, 15, 0.2, 2.7, 6.8, 6, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Cauliflower', NULL, NULL, 'verified', NULL, 107, '1 cup', 27, 2, 5.3, 0.3, 2.1, 2, 32, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Zucchini, Sliced', NULL, NULL, 'verified', NULL, 113, '1 cup', 19, 1.4, 3.5, 0.4, 1.1, 2.5, 10, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Asparagus', NULL, NULL, 'verified', NULL, 134, '1 cup', 27, 3, 5.2, 0.2, 2.8, 2.5, 3, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Kale, Chopped', NULL, NULL, 'verified', NULL, 67, '1 cup', 33, 2.9, 6.7, 0.6, 1.3, 1.6, 29, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Lettuce, Romaine', NULL, NULL, 'verified', NULL, 94, '2 cups', 16, 1.2, 3, 0.3, 2, 1.2, 8, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- DAIRY (10 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Whole Milk', NULL, NULL, 'verified', NULL, 244, '1 cup', 149, 8, 12, 8, 0, 12, 105, NULL, true, NULL, NOW()),
(gen_random_uuid(), '2% Milk', NULL, NULL, 'verified', NULL, 244, '1 cup', 122, 8, 12, 5, 0, 12, 115, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Cheddar Cheese', NULL, NULL, 'verified', NULL, 28, '1 oz', 114, 7, 0.4, 9.4, 0, 0.1, 176, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Mozzarella Cheese', NULL, NULL, 'verified', NULL, 28, '1 oz', 85, 6, 0.7, 6, 0, 0.3, 178, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Butter', NULL, NULL, 'verified', NULL, 14, '1 tbsp', 102, 0.1, 0, 11.5, 0, 0, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Cream Cheese', NULL, NULL, 'verified', NULL, 29, '2 tbsp', 99, 1.7, 1.6, 9.8, 0, 0.8, 86, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Parmesan Cheese', NULL, NULL, 'verified', NULL, 5, '1 tbsp', 21, 1.4, 0.2, 1.4, 0, 0, 76, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'String Cheese', NULL, NULL, 'verified', NULL, 28, '1 stick', 80, 7, 1, 5, 0, 0.5, 200, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Sour Cream', NULL, NULL, 'verified', NULL, 30, '2 tbsp', 57, 0.7, 1.1, 5.6, 0, 0.4, 15, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Half and Half', NULL, NULL, 'verified', NULL, 30, '2 tbsp', 39, 0.9, 1.3, 3.5, 0, 1.3, 12, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- FATS & OILS (9 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Olive Oil', NULL, NULL, 'verified', NULL, 14, '1 tbsp', 119, 0, 0, 13.5, 0, 0, 0, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Coconut Oil', NULL, NULL, 'verified', NULL, 14, '1 tbsp', 121, 0, 0, 13.5, 0, 0, 0, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Peanut Butter', NULL, NULL, 'verified', NULL, 32, '2 tbsp', 188, 8, 6, 16, 2, 3, 136, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Almond Butter', NULL, NULL, 'verified', NULL, 32, '2 tbsp', 196, 7, 6, 18, 3.3, 2, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Almonds', NULL, NULL, 'verified', NULL, 28, '1 oz (~23)', 164, 6, 6, 14, 3.5, 1.2, 0, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Walnuts', NULL, NULL, 'verified', NULL, 28, '1 oz (~14 halves)', 185, 4.3, 3.9, 18.5, 1.9, 0.7, 1, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Mixed Nuts', NULL, NULL, 'verified', NULL, 28, '1 oz', 172, 5, 6, 15, 2, 1.1, 3, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Chia Seeds', NULL, NULL, 'verified', NULL, 12, '1 tbsp', 58, 2, 5, 3.7, 4.1, 0, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Flaxseed, Ground', NULL, NULL, 'verified', NULL, 7, '1 tbsp', 37, 1.3, 2, 3, 1.9, 0.1, 2, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- SNACKS & COMMON (11 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Protein Bar, Generic', NULL, NULL, 'verified', NULL, 60, '1 bar', 200, 20, 22, 7, 3, 6, 200, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Granola Bar', NULL, NULL, 'verified', NULL, 40, '1 bar', 190, 3, 29, 7, 2, 12, 160, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Potato Chips', NULL, NULL, 'verified', NULL, 28, '1 oz', 152, 2, 15, 10, 1.2, 0.1, 170, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Dark Chocolate, 70%', NULL, NULL, 'verified', NULL, 28, '1 oz', 170, 2, 13, 12, 3, 7, 6, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Popcorn, Air-Popped', NULL, NULL, 'verified', NULL, 24, '3 cups', 93, 3, 19, 1, 3.6, 0.2, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Trail Mix', NULL, NULL, 'verified', NULL, 38, '1/4 cup', 175, 5, 15, 11, 2, 8, 45, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Hummus', NULL, NULL, 'verified', NULL, 30, '2 tbsp', 70, 2, 6, 5, 1, 0.3, 130, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Rice Cakes', NULL, NULL, 'verified', NULL, 18, '2 cakes', 70, 1.4, 15, 0.4, 0.4, 0, 50, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Pretzels', NULL, NULL, 'verified', NULL, 28, '1 oz', 108, 3, 23, 1, 0.9, 0.5, 352, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Beef Jerky', NULL, NULL, 'verified', NULL, 28, '1 oz', 82, 7, 5, 5, 0.4, 3, 590, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Crackers, Wheat', NULL, NULL, 'verified', NULL, 16, '5 crackers', 80, 1, 10, 4, 0.5, 1, 135, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- BEVERAGES (10 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Coffee, Black', NULL, NULL, 'verified', NULL, 240, '8 oz', 2, 0.3, 0, 0, 0, 0, 5, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Orange Juice', NULL, NULL, 'verified', NULL, 248, '8 oz', 112, 1.7, 26, 0.5, 0.5, 21, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Whole Milk Latte', NULL, NULL, 'verified', NULL, 355, '12 oz', 180, 10, 14, 9, 0, 13, 120, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Coca-Cola', NULL, NULL, 'verified', NULL, 355, '12 oz', 140, 0, 39, 0, 0, 39, 45, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Beer, Regular', NULL, NULL, 'verified', NULL, 355, '12 oz', 153, 1.6, 13, 0, 0, 0, 14, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Red Wine', NULL, NULL, 'verified', NULL, 148, '5 oz', 125, 0.1, 4, 0, 0, 0.9, 6, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Almond Milk, Unsweetened', NULL, NULL, 'verified', NULL, 240, '1 cup', 30, 1, 1, 2.5, 0.5, 0, 170, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Coconut Water', NULL, NULL, 'verified', NULL, 240, '1 cup', 46, 1.7, 9, 0.5, 2.6, 6, 252, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Green Tea', NULL, NULL, 'verified', NULL, 240, '8 oz', 2, 0, 0, 0, 0, 0, 7, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Sports Drink', NULL, NULL, 'verified', NULL, 355, '12 oz', 80, 0, 21, 0, 0, 21, 160, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- FAST FOOD (12 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Big Mac', 'McDonald''s', NULL, 'verified', NULL, 200, '1 burger', 590, 25, 46, 33, 3, 9, 1010, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Original Chicken Sandwich', 'Chick-fil-A', NULL, 'verified', NULL, 170, '1 sandwich', 440, 28, 40, 19, 1, 5, 1400, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Chicken Burrito Bowl', 'Chipotle', NULL, 'verified', NULL, 510, '1 bowl', 660, 50, 54, 24, 11, 4, 1680, NULL, true, NULL, NOW()),
(gen_random_uuid(), '6" Turkey Sub', 'Subway', NULL, 'verified', NULL, 220, '1 sub', 250, 18, 40, 3.5, 5, 6, 810, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Grande Caffe Latte', 'Starbucks', NULL, 'verified', NULL, 473, '16 oz', 190, 13, 19, 7, 0, 17, 170, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Pizza, Pepperoni', NULL, NULL, 'verified', NULL, 107, '1 slice', 298, 12, 34, 12, 2, 3.6, 683, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Medium Fries', 'McDonald''s', NULL, 'verified', NULL, 111, '1 serving', 340, 4, 44, 16, 4, 0, 260, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Crunchy Taco', 'Taco Bell', NULL, 'verified', NULL, 78, '1 taco', 170, 8, 13, 10, 3, 1, 310, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Baconator', 'Wendy''s', NULL, 'verified', NULL, 310, '1 burger', 940, 57, 38, 62, 1, 8, 1880, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Original Recipe Chicken Breast', 'KFC', NULL, 'verified', NULL, 161, '1 breast', 390, 39, 11, 21, 0, 0, 1190, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Mac and Cheese', 'Panera Bread', NULL, 'verified', NULL, 340, '1 bowl', 980, 35, 93, 51, 3, 8, 1910, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Double-Double', 'In-N-Out', NULL, 'verified', NULL, 330, '1 burger', 670, 37, 39, 41, 3, 10, 1440, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- CONDIMENTS & EXTRAS (10 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Ketchup', NULL, NULL, 'verified', NULL, 17, '1 tbsp', 20, 0, 5, 0, 0, 4, 160, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Mustard', NULL, NULL, 'verified', NULL, 5, '1 tsp', 3, 0.2, 0.3, 0.2, 0.2, 0.1, 55, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Mayonnaise', NULL, NULL, 'verified', NULL, 15, '1 tbsp', 94, 0.1, 0.1, 10, 0, 0.1, 88, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Ranch Dressing', NULL, NULL, 'verified', NULL, 30, '2 tbsp', 129, 0.4, 2, 13, 0, 1, 270, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Soy Sauce', NULL, NULL, 'verified', NULL, 16, '1 tbsp', 9, 0.9, 1, 0, 0.1, 0.1, 879, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Honey', NULL, NULL, 'verified', NULL, 21, '1 tbsp', 64, 0.1, 17, 0, 0, 17, 1, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Maple Syrup', NULL, NULL, 'verified', NULL, 20, '1 tbsp', 52, 0, 13, 0, 0, 12, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Salsa', NULL, NULL, 'verified', NULL, 32, '2 tbsp', 10, 0.5, 2, 0, 0.5, 1, 230, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Hot Sauce', NULL, NULL, 'verified', NULL, 5, '1 tsp', 1, 0, 0, 0, 0, 0, 124, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Barbecue Sauce', NULL, NULL, 'verified', NULL, 36, '2 tbsp', 70, 0.3, 16, 0.3, 0.2, 13, 310, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL PROTEINS (5 items to reach 200+ total)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Cod, Baked', NULL, NULL, 'verified', NULL, 113, '4 oz', 93, 20, 0, 0.8, 0, 0, 74, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Lamb, Leg', NULL, NULL, 'verified', NULL, 113, '4 oz', 217, 26, 0, 12, 0, 0, 65, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Bison, Ground', NULL, NULL, 'verified', NULL, 113, '4 oz', 146, 20, 0, 7, 0, 0, 66, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Turkey Bacon', NULL, NULL, 'verified', NULL, 16, '1 slice', 30, 2, 0, 2, 0, 0, 130, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Bacon, Pork', NULL, NULL, 'verified', NULL, 8, '1 slice', 43, 3, 0, 3.3, 0, 0, 137, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL GRAINS & STARCHES (5 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Couscous, Cooked', NULL, NULL, 'verified', NULL, 157, '1 cup', 176, 6, 36, 0.3, 2.2, 0.2, 8, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Corn Tortilla', NULL, NULL, 'verified', NULL, 26, '1 tortilla', 52, 1.4, 11, 0.7, 1.5, 0.2, 11, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Pancake, Plain', NULL, NULL, 'verified', NULL, 73, '1 medium', 175, 5, 22, 7, 0.7, 4, 400, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Waffle, Frozen', NULL, NULL, 'verified', NULL, 35, '1 waffle', 95, 2, 15, 3, 0.5, 2, 220, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Granola', NULL, NULL, 'verified', NULL, 55, '1/2 cup', 260, 6, 38, 10, 3.5, 12, 85, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL FRUITS (5 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Cherries', NULL, NULL, 'verified', NULL, 154, '1 cup', 97, 1.6, 25, 0.3, 3.2, 20, 0, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Pear', NULL, NULL, 'verified', NULL, 178, '1 medium', 101, 0.7, 27, 0.2, 5.5, 17, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Kiwi', NULL, NULL, 'verified', NULL, 76, '1 medium', 46, 0.9, 11, 0.4, 2.3, 7, 2, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Grapefruit', NULL, NULL, 'verified', NULL, 123, '1/2 fruit', 52, 0.9, 13, 0.2, 2, 8.5, 0, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Dried Cranberries', NULL, NULL, 'verified', NULL, 40, '1/4 cup', 123, 0.1, 33, 0.4, 2.3, 29, 2, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL VEGETABLES (5 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Brussels Sprouts', NULL, NULL, 'verified', NULL, 88, '1 cup', 38, 3, 8, 0.3, 3.3, 1.9, 22, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Mushrooms, White', NULL, NULL, 'verified', NULL, 70, '1 cup', 15, 2.2, 2.3, 0.2, 0.7, 1.4, 4, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Sweet Peas', NULL, NULL, 'verified', NULL, 145, '1 cup', 117, 8, 21, 0.6, 8.8, 8, 7, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Cabbage, Shredded', NULL, NULL, 'verified', NULL, 89, '1 cup', 22, 1.1, 5.2, 0.1, 2.2, 2.8, 16, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Edamame, Shelled', NULL, NULL, 'verified', NULL, 155, '1 cup', 188, 18, 14, 8, 8, 3, 9, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL DAIRY (3 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Skim Milk', NULL, NULL, 'verified', NULL, 244, '1 cup', 83, 8, 12, 0.2, 0, 12, 103, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Swiss Cheese', NULL, NULL, 'verified', NULL, 28, '1 oz', 108, 8, 1.5, 8, 0, 0.4, 54, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Feta Cheese', NULL, NULL, 'verified', NULL, 28, '1 oz', 75, 4, 1.2, 6, 0, 1.1, 260, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL FATS & OILS (3 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Canola Oil', NULL, NULL, 'verified', NULL, 14, '1 tbsp', 124, 0, 0, 14, 0, 0, 0, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Sesame Oil', NULL, NULL, 'verified', NULL, 14, '1 tbsp', 120, 0, 0, 13.6, 0, 0, 0, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Cashews', NULL, NULL, 'verified', NULL, 28, '1 oz', 157, 5, 9, 12, 0.9, 1.7, 3, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL SNACKS (5 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Tortilla Chips', NULL, NULL, 'verified', NULL, 28, '1 oz', 142, 2, 18, 7, 1.5, 0.3, 119, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Graham Crackers', NULL, NULL, 'verified', NULL, 28, '2 sheets', 118, 2, 22, 3, 0.8, 8, 169, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Pita Chips', NULL, NULL, 'verified', NULL, 28, '1 oz', 130, 3, 18, 5, 1, 0.5, 270, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Dried Mango', NULL, NULL, 'verified', NULL, 40, '5 pieces', 128, 0.6, 31, 0.5, 1.5, 27, 46, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Fruit Snacks', NULL, NULL, 'verified', NULL, 25, '1 pouch', 80, 0, 19, 0, 0, 11, 15, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL BEVERAGES (5 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Apple Juice', NULL, NULL, 'verified', NULL, 248, '8 oz', 114, 0.3, 28, 0.3, 0.5, 24, 10, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Oat Milk', NULL, NULL, 'verified', NULL, 240, '1 cup', 120, 3, 16, 5, 2, 7, 100, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Hot Chocolate', NULL, NULL, 'verified', NULL, 240, '8 oz', 190, 2, 27, 8, 1, 24, 140, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Kombucha', NULL, NULL, 'verified', NULL, 240, '8 oz', 30, 0, 7, 0, 0, 4, 10, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Cranberry Juice Cocktail', NULL, NULL, 'verified', NULL, 248, '8 oz', 137, 0, 34, 0.1, 0.3, 30, 5, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL FAST FOOD (5 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Whopper', 'Burger King', NULL, 'verified', NULL, 290, '1 burger', 657, 28, 49, 40, 2, 11, 980, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Chicken McNuggets (10 pc)', 'McDonald''s', NULL, 'verified', NULL, 162, '10 pieces', 410, 24, 25, 24, 1, 0, 900, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Quesadilla, Chicken', 'Taco Bell', NULL, 'verified', NULL, 184, '1 quesadilla', 500, 27, 37, 27, 3, 3, 1230, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Footlong Italian BMT', 'Subway', NULL, 'verified', NULL, 363, '1 sub', 820, 36, 78, 38, 5, 10, 2660, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Spicy Chicken Sandwich', 'Popeyes', NULL, 'verified', NULL, 221, '1 sandwich', 700, 28, 60, 42, 3, 7, 1473, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL CONDIMENTS & EXTRAS (5 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Italian Dressing', NULL, NULL, 'verified', NULL, 30, '2 tbsp', 70, 0, 3, 6, 0, 2, 310, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Balsamic Vinegar', NULL, NULL, 'verified', NULL, 15, '1 tbsp', 14, 0, 3, 0, 0, 2.4, 4, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Guacamole', NULL, NULL, 'verified', NULL, 30, '2 tbsp', 50, 0.6, 3, 4.5, 2, 0.2, 115, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Jam/Jelly', NULL, NULL, 'verified', NULL, 20, '1 tbsp', 50, 0, 13, 0, 0.2, 10, 6, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Sriracha', NULL, NULL, 'verified', NULL, 5, '1 tsp', 5, 0.1, 1, 0.1, 0, 0.8, 80, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- PREPARED MEALS & MISC (25 items to complete 200)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Chicken Fried Rice', NULL, NULL, 'verified', NULL, 250, '1 cup', 343, 14, 42, 13, 1.5, 2, 820, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Spaghetti with Meat Sauce', NULL, NULL, 'verified', NULL, 300, '1 serving', 374, 18, 46, 13, 3.5, 8, 680, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Caesar Salad with Chicken', NULL, NULL, 'verified', NULL, 300, '1 bowl', 360, 30, 14, 21, 3, 2, 740, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Chicken Noodle Soup', NULL, NULL, 'verified', NULL, 248, '1 cup', 62, 3.4, 7.3, 2.4, 0.5, 0.6, 866, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Grilled Cheese Sandwich', NULL, NULL, 'verified', NULL, 115, '1 sandwich', 366, 14, 27, 23, 1, 4, 730, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'PB&J Sandwich', NULL, NULL, 'verified', NULL, 130, '1 sandwich', 376, 13, 50, 15, 3.5, 19, 430, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Taco Salad', NULL, NULL, 'verified', NULL, 350, '1 bowl', 490, 24, 36, 28, 6, 5, 870, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Fish and Chips', NULL, NULL, 'verified', NULL, 340, '1 serving', 585, 24, 52, 31, 3, 1, 920, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Beef Stir-Fry', NULL, NULL, 'verified', NULL, 280, '1 cup', 310, 24, 18, 16, 3, 6, 780, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Miso Soup', NULL, NULL, 'verified', NULL, 240, '1 cup', 40, 3, 5, 1, 1, 1.1, 880, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Vegetable Soup', NULL, NULL, 'verified', NULL, 248, '1 cup', 72, 2, 12, 1.9, 2.5, 3.5, 750, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Chicken Caesar Wrap', NULL, NULL, 'verified', NULL, 240, '1 wrap', 470, 28, 38, 23, 2, 3, 1050, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Turkey Club Sandwich', NULL, NULL, 'verified', NULL, 280, '1 sandwich', 450, 30, 38, 20, 2, 5, 1200, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Pad Thai', NULL, NULL, 'verified', NULL, 280, '1 serving', 400, 14, 52, 15, 2, 10, 870, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Burrito, Bean & Cheese', NULL, NULL, 'verified', NULL, 280, '1 burrito', 380, 15, 50, 14, 7, 2, 940, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Chili con Carne', NULL, NULL, 'verified', NULL, 253, '1 cup', 256, 18, 22, 11, 5, 5, 1060, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Sushi, California Roll', NULL, NULL, 'verified', NULL, 180, '6 pieces', 255, 9, 38, 7, 2.8, 6, 480, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Ramen, Instant', NULL, NULL, 'verified', NULL, 85, '1 packet', 380, 8, 52, 14, 2, 2, 1520, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Frozen Pizza, Cheese', NULL, NULL, 'verified', NULL, 137, '1/4 pizza', 350, 15, 40, 14, 2, 6, 730, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Chicken Tikka Masala', NULL, NULL, 'verified', NULL, 280, '1 cup', 320, 22, 16, 18, 3, 5, 690, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Lasagna', NULL, NULL, 'verified', NULL, 300, '1 serving', 377, 20, 37, 16, 3, 7, 780, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Fried Egg Sandwich', NULL, NULL, 'verified', NULL, 150, '1 sandwich', 340, 16, 26, 19, 1, 3, 620, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Acai Bowl', NULL, NULL, 'verified', NULL, 300, '1 bowl', 380, 6, 65, 12, 8, 45, 30, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Smoothie, Mixed Berry', NULL, NULL, 'verified', NULL, 350, '16 oz', 220, 4, 48, 2, 4, 36, 40, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Overnight Oats', NULL, NULL, 'verified', NULL, 280, '1 cup', 310, 11, 48, 9, 6, 14, 50, NULL, true, NULL, NOW());

-- -------------------------------------------------------
-- ADDITIONAL ITEMS TO REACH 200 (13 items)
-- -------------------------------------------------------
INSERT INTO foods (id, name, brand, barcode, source, source_id, serving_size_g, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, image_url, is_verified, created_by, created_at) VALUES
(gen_random_uuid(), 'Egg White', NULL, NULL, 'verified', NULL, 33, '1 large white', 17, 3.6, 0.2, 0.1, 0, 0.2, 55, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Sardines, Canned in Oil', NULL, NULL, 'verified', NULL, 92, '1 can', 191, 23, 0, 11, 0, 0, 465, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Black Beans, Canned', NULL, NULL, 'verified', NULL, 130, '1/2 cup', 114, 8, 20, 0.5, 8.3, 0.3, 461, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Lentils, Cooked', NULL, NULL, 'verified', NULL, 198, '1 cup', 230, 18, 40, 0.8, 15.6, 3.6, 4, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Chickpeas, Canned', NULL, NULL, 'verified', NULL, 120, '1/2 cup', 134, 7, 22, 2.1, 5, 4, 292, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Soy Milk, Unsweetened', NULL, NULL, 'verified', NULL, 240, '1 cup', 80, 7, 4, 4, 1, 1, 75, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Plantain, Fried', NULL, NULL, 'verified', NULL, 118, '1 cup', 365, 1.5, 58, 15, 3.5, 25, 6, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'White Toast Bread', NULL, NULL, 'verified', NULL, 30, '1 slice', 79, 2.7, 15, 1, 0.6, 1.5, 147, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Brownie', NULL, NULL, 'verified', NULL, 56, '1 piece', 227, 3, 36, 9, 1.2, 21, 175, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Ice Cream, Vanilla', NULL, NULL, 'verified', NULL, 66, '1/2 cup', 137, 2.3, 16, 7.3, 0.5, 14, 53, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Cookie, Chocolate Chip', NULL, NULL, 'verified', NULL, 30, '1 medium', 140, 1.5, 19, 7, 0.5, 11, 90, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Donut, Glazed', NULL, NULL, 'verified', NULL, 60, '1 medium', 269, 4, 31, 15, 0.7, 14, 257, NULL, true, NULL, NOW()),
(gen_random_uuid(), 'Muffin, Blueberry', NULL, NULL, 'verified', NULL, 113, '1 medium', 377, 6, 52, 16, 2, 28, 447, NULL, true, NULL, NOW());


-- ============================================================
-- 2. ACHIEVEMENTS (27 total)
-- ============================================================

INSERT INTO achievements (id, slug, name, description, icon, category, requirement, xp_reward, rarity) VALUES

-- Logging achievements
(gen_random_uuid(), 'first_log', 'First Bite', 'Log your first food entry', '🍽️', 'logging',
 '{"type":"count","table":"food_log","target":1}'::jsonb, 10, 'common'),

(gen_random_uuid(), 'streak_7d_food', 'Week Warrior', 'Maintain a 7-day food logging streak', '🔥', 'logging',
 '{"type":"streak","streak_type":"food_log","target":7}'::jsonb, 50, 'uncommon'),

(gen_random_uuid(), 'streak_30d_food', 'Iron Stomach', 'Maintain a 30-day food logging streak', '💪', 'logging',
 '{"type":"streak","streak_type":"food_log","target":30}'::jsonb, 200, 'rare'),

(gen_random_uuid(), 'foods_100', 'Centurion', 'Log 100 different foods', '💯', 'logging',
 '{"type":"count","table":"food_log","target":100}'::jsonb, 100, 'uncommon'),

(gen_random_uuid(), 'recipe_creator', 'Chef Mode', 'Create your first recipe', '👨‍🍳', 'logging',
 '{"type":"count","table":"recipes","target":1}'::jsonb, 25, 'common'),

(gen_random_uuid(), 'water_streak_7d', 'Hydrated', 'Maintain a 7-day water logging streak', '💧', 'logging',
 '{"type":"streak","streak_type":"water","target":7}'::jsonb, 50, 'uncommon'),

(gen_random_uuid(), 'early_bird', 'Early Bird', 'Log breakfast before 8am for 5 days', '🌅', 'logging',
 '{"type":"early_log","target":5}'::jsonb, 75, 'uncommon'),

(gen_random_uuid(), 'macro_master', 'Macro Master', 'Hit all macro targets in a single day', '🎯', 'logging',
 '{"type":"macro_target_hit"}'::jsonb, 50, 'uncommon'),

-- Workout achievements
(gen_random_uuid(), 'first_workout', 'Let''s Go', 'Complete your first workout', '🏋️', 'workout',
 '{"type":"count","table":"workout_log","target":1}'::jsonb, 10, 'common'),

(gen_random_uuid(), 'workouts_10', 'Getting Stronger', 'Complete 10 workouts', '💪', 'workout',
 '{"type":"count","table":"workout_log","target":10}'::jsonb, 75, 'uncommon'),

(gen_random_uuid(), 'gym_rat', 'Gym Rat', 'Complete 20 workouts in a month', '🐀', 'workout',
 '{"type":"monthly_count","table":"workout_log","target":20}'::jsonb, 150, 'rare'),

(gen_random_uuid(), 'pr_breaker', 'New PR!', 'Set a personal record on any exercise', '🏆', 'workout',
 '{"type":"personal_record"}'::jsonb, 50, 'uncommon'),

-- Progress achievements
(gen_random_uuid(), 'first_weigh_in', 'Stepping Up', 'Log your first weight entry', '⚖️', 'progress',
 '{"type":"count","table":"weight_log","target":1}'::jsonb, 10, 'common'),

(gen_random_uuid(), 'down_5lb', 'Five Down', 'Lose 5 lbs from your starting weight', '📉', 'progress',
 '{"type":"weight_loss","target_kg":2.27}'::jsonb, 100, 'uncommon'),

(gen_random_uuid(), 'halfway', 'Halfway There', 'Reach 50% of your weight goal', '🎯', 'progress',
 '{"type":"goal_progress","target_pct":50}'::jsonb, 200, 'rare'),

(gen_random_uuid(), 'goal_reached', 'Mission Complete', 'Reach your goal weight', '🏁', 'progress',
 '{"type":"goal_progress","target_pct":100}'::jsonb, 500, 'legendary'),

(gen_random_uuid(), 'progress_photo', 'Mirror Check', 'Upload your first progress photo', '📸', 'progress',
 '{"type":"count","table":"progress_photos","target":1}'::jsonb, 25, 'common'),

-- Social achievements
(gen_random_uuid(), 'first_post', 'Hello World', 'Create your first post', '📝', 'social',
 '{"type":"count","table":"posts","target":1}'::jsonb, 10, 'common'),

(gen_random_uuid(), 'likes_10', 'Popular', 'Receive 10 likes on your posts', '❤️', 'social',
 '{"type":"total_likes","target":10}'::jsonb, 50, 'uncommon'),

(gen_random_uuid(), 'followers_10', 'Growing Circle', 'Get 10 followers', '👥', 'social',
 '{"type":"follower_count","target":10}'::jsonb, 75, 'uncommon'),

(gen_random_uuid(), 'social_butterfly', 'Social Butterfly', 'Comment on 20 posts', '🦋', 'social',
 '{"type":"count","table":"post_comments","target":20}'::jsonb, 75, 'uncommon'),

-- Accountability achievements
(gen_random_uuid(), 'first_group', 'Squad Up', 'Join your first accountability group', '🤝', 'accountability',
 '{"type":"count","table":"group_members","target":1}'::jsonb, 25, 'common'),

(gen_random_uuid(), 'checkin_perfect_week', 'Perfect Week', 'Complete all daily check-ins for a week', '✅', 'accountability',
 '{"type":"streak","streak_type":"check_in","target":7}'::jsonb, 100, 'rare'),

(gen_random_uuid(), 'checkins_4_consecutive', 'Committed', 'Complete 4 consecutive weekly check-ins', '📅', 'accountability',
 '{"type":"streak","streak_type":"check_in","target":28}'::jsonb, 150, 'rare'),

-- Gamification achievements
(gen_random_uuid(), 'level_10', 'Double Digits', 'Reach Level 10', '⭐', 'gamification',
 '{"type":"level","target":10}'::jsonb, 0, 'rare'),

(gen_random_uuid(), 'level_25', 'Quarter Century', 'Reach Level 25', '🌟', 'gamification',
 '{"type":"level","target":25}'::jsonb, 0, 'epic'),

(gen_random_uuid(), 'level_50', 'Legend', 'Reach Level 50', '👑', 'gamification',
 '{"type":"level","target":50}'::jsonb, 0, 'legendary');


-- ============================================================
-- 3. CHALLENGES (5 starter challenges)
-- ============================================================

INSERT INTO challenges (id, name, description, challenge_type, metric, target_value, duration_days, xp_reward, start_date, end_date, created_at) VALUES

(gen_random_uuid(), '7-Day Logger', 'Log every meal for 7 consecutive days', 'global', 'food_log_streak', 7, 7, 100,
 CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', NOW()),

(gen_random_uuid(), 'Protein Power', 'Hit your protein target for 5 days this week', 'global', 'protein_target_days', 5, 7, 75,
 CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', NOW()),

(gen_random_uuid(), 'Hydration Hero', 'Log 2L+ of water for 5 days', 'global', 'water_goal_days', 5, 7, 75,
 CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', NOW()),

(gen_random_uuid(), 'Social Starter', 'Create 3 posts this week', 'global', 'posts_created', 3, 7, 50,
 CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', NOW()),

(gen_random_uuid(), 'Group Up', 'Join or create an accountability group', 'global', 'group_join', 1, 30, 50,
 CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', NOW());


-- ============================================================
-- Summary:
--   Foods:        200 items across 10 categories
--   Achievements:  27 items across 6 categories
--   Challenges:     5 starter global challenges
-- ============================================================
