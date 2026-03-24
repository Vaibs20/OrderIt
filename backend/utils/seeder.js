const fs = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");

const connectDatabase = require("../config/database");
const FoodItem = require("../models/foodItem");
const Menu = require("../models/menu");
const Restaurant = require("../models/restaurant");

dotenv.config({ path: path.join(__dirname, "..", "config", "config.env") });
connectDatabase();

const rootDir = path.join(__dirname, "..", "..");
const dataDir = path.join(rootDir, "Database");

const toPlainValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(toPlainValue);
  }

  if (value && typeof value === "object") {
    if ("$oid" in value) {
      return value.$oid;
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, childValue]) => [key, toPlainValue(childValue)])
    );
  }

  return value;
};

const loadJson = async (fileName) => {
  const filePath = path.join(dataDir, fileName);
  const raw = await fs.readFile(filePath, "utf8");
  return toPlainValue(JSON.parse(raw));
};

const seedDatabase = async () => {
  try {
    const [foodItems, menus, restaurants] = await Promise.all([
      loadJson("Internship.fooditems.json"),
      loadJson("Internship.menus.json"),
      loadJson("Internship.restaurants.json"),
    ]);

    await Promise.all([
      FoodItem.deleteMany(),
      Menu.deleteMany(),
      Restaurant.deleteMany(),
    ]);

    await Promise.all([
      FoodItem.insertMany(foodItems),
      Menu.insertMany(menus),
      Restaurant.insertMany(restaurants),
    ]);

    console.log("Database seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seedDatabase();
