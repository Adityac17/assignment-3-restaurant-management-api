// Development helper: wipes restaurants/menu items and loads a small demo dataset.
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const data = [
  { name: 'Spice Route', city: 'Pune', address: '12 MG Road', cuisine: 'Indian', rating: 4.7,
    menu: [{ name: 'Butter Naan', price: 60 }, { name: 'Paneer Tikka', price: 240 },
           { name: 'Dal Makhani', price: 220 }] },
  { name: 'Sakura House', city: 'Mumbai', address: '88 Bandra West', cuisine: 'Japanese', rating: 4.9,
    menu: [{ name: 'Salmon Nigiri', price: 380 }, { name: 'Miso Ramen', price: 420 },
           { name: 'Edamame', price: 150 }] },
  { name: 'Nonna Mia', city: 'Pune', address: '4 Koregaon Park', cuisine: 'Italian', rating: 4.5,
    menu: [{ name: 'Margherita Pizza', price: 350 }, { name: 'Carbonara', price: 410 }] },
  { name: 'Taco Libre', city: 'Bengaluru', address: '31 Indiranagar', cuisine: 'Mexican', rating: 4.2,
    menu: [{ name: 'Al Pastor Tacos', price: 290 }, { name: 'Churros', price: 180, isAvailable: false }] },
  { name: 'The Wok Station', city: 'Delhi', address: '7 Hauz Khas', cuisine: 'Chinese', rating: 4.4,
    menu: [{ name: 'Hakka Noodles', price: 260 }, { name: 'Kung Pao Chicken', price: 330 }] },
  { name: 'Olive & Thyme', city: 'Mumbai', address: '19 Colaba Causeway', cuisine: 'Mediterranean', rating: 3.9,
    menu: [{ name: 'Falafel Bowl', price: 310 }] },
  { name: 'Curry Corner', city: 'Bengaluru', address: '52 Jayanagar', cuisine: 'Indian', rating: 3.6,
    menu: [{ name: 'Chicken Biryani', price: 280 }] }
];

const seed = async () => {
  await connectDB();
  await Promise.all([Restaurant.deleteMany({}), MenuItem.deleteMany({})]);

  for (const { menu, ...restaurant } of data) {
    const created = await Restaurant.create(restaurant);
    await MenuItem.insertMany(menu.map((item) => ({ ...item, restaurantId: created._id })));
  }

  const [restaurants, items] = await Promise.all([
    Restaurant.countDocuments(),
    MenuItem.countDocuments()
  ]);
  console.log(`[SEED] ${restaurants} restaurants, ${items} menu items (users left untouched)`);

  await mongoose.connection.close();
};

seed().catch((err) => {
  console.error('[SEED] Failed:', err.message);
  process.exit(1);
});
