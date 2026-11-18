// Run with: npm run seed   (wipes users, destinations and reviews, then inserts sample data)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Destination = require('./models/Destination');
const Review = require('./models/Review');

const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

const destinations = [
  {
    name: 'Paris', city: 'Paris', country: 'France', category: 'city', budget: 'luxury',
    image: IMG('photo-1502602898657-3e91760cbb34'),
    bestTime: 'April to June, September to October',
    description: 'The city of light is packed with world-class museums, cafe-lined boulevards, grand architecture and some of the best food on the planet.',
    attractions: [
      { name: 'Eiffel Tower', description: 'Iconic iron tower with views across the city.', tip: 'Book summit tickets online to skip the queue.' },
      { name: 'Louvre Museum', description: 'Home of the Mona Lisa and 35,000 other works.', tip: 'Visit on Friday evening when it stays open late.' },
      { name: 'Montmartre', description: 'Hilltop village of artists, steps and Sacre-Coeur.', tip: 'Go at sunrise for empty streets.' },
    ],
  },
  {
    name: 'Kyoto', city: 'Kyoto', country: 'Japan', category: 'heritage', budget: 'mid',
    image: IMG('photo-1493976040374-85c8e12f0c0e'),
    bestTime: 'Late March to April, November',
    description: 'Japan\'s old capital holds thousands of temples, wooden tea houses and quiet gardens, with geisha districts still alive in the evenings.',
    attractions: [
      { name: 'Fushimi Inari Shrine', description: 'Thousands of vermilion torii gates up a forested hill.', tip: 'Walk past the first viewpoint to lose the crowds.' },
      { name: 'Kinkaku-ji', description: 'The Golden Pavilion reflected in a mirror pond.', tip: 'Arrive at opening time for the best light.' },
      { name: 'Arashiyama Bamboo Grove', description: 'A towering bamboo path on the western edge of the city.', tip: 'Pair it with the nearby monkey park.' },
    ],
  },
  {
    name: 'Jaipur', city: 'Jaipur', country: 'India', category: 'heritage', budget: 'budget',
    image: IMG('photo-1477587458883-47145ed94245'),
    bestTime: 'October to March',
    description: 'The Pink City of Rajasthan blends hilltop forts, royal palaces and busy bazaars selling textiles, jewellery and blue pottery.',
    attractions: [
      { name: 'Amer Fort', description: 'A hilltop fort-palace of mirrored halls and ramparts.', tip: 'Go early and walk up instead of taking the jeep.' },
      { name: 'Hawa Mahal', description: 'The honeycomb facade of the Palace of Winds.', tip: 'Best photographed from a cafe across the street in the morning.' },
      { name: 'City Palace', description: 'Royal residence with museums and courtyards.', tip: 'Hire a guide for the textile and weapons galleries.' },
    ],
  },
  {
    name: 'Bali', city: 'Ubud', country: 'Indonesia', category: 'nature', budget: 'budget',
    image: IMG('photo-1537996194471-e657df975ab4'),
    bestTime: 'April to October (dry season)',
    description: 'Terraced rice fields, jungle temples, surf beaches and a deep craft culture make this island easy to love and easy to slow down in.',
    attractions: [
      { name: 'Tegallalang Rice Terraces', description: 'Layered green terraces just north of Ubud.', tip: 'Arrive before 8am to beat the tour buses.' },
      { name: 'Uluwatu Temple', description: 'A clifftop sea temple above the surf.', tip: 'Stay for the sunset Kecak fire dance.' },
      { name: 'Sacred Monkey Forest', description: 'Forest sanctuary with temples and macaques.', tip: 'Keep sunglasses and snacks in your bag.' },
    ],
  },
  {
    name: 'Santorini', city: 'Oia', country: 'Greece', category: 'beach', budget: 'luxury',
    image: IMG('photo-1570077188670-e3a8d69ac5ff'),
    bestTime: 'May to early October',
    description: 'White-washed villages cling to a volcanic caldera, with blue-domed churches, black-sand beaches and famous sunsets.',
    attractions: [
      { name: 'Oia Sunset Point', description: 'The classic caldera sunset viewing spot.', tip: 'Arrive 90 minutes early for a spot on the wall.' },
      { name: 'Fira to Oia Hike', description: 'A clifftop trail linking two caldera towns.', tip: 'Start at 8am and carry water.' },
      { name: 'Red Beach', description: 'A beach framed by dramatic red volcanic cliffs.', tip: 'Wear sturdy shoes for the rocky path in.' },
    ],
  },
  {
    name: 'Goa', city: 'Panaji', country: 'India', category: 'beach', budget: 'budget',
    image: IMG('photo-1512343879784-a960bf40e7f2'),
    bestTime: 'November to February',
    description: 'Sun, sand and Portuguese-era churches. North Goa is lively and full of shacks and markets, while the south is quieter and more relaxed.',
    attractions: [
      { name: 'Basilica of Bom Jesus', description: 'A UNESCO-listed baroque church in Old Goa.', tip: 'Dress modestly and visit in the morning.' },
      { name: 'Palolem Beach', description: 'A calm crescent bay in South Goa.', tip: 'Kayak at dawn to spot dolphins.' },
      { name: 'Fontainhas', description: 'Colourful old Latin quarter of Panaji.', tip: 'Take a walking tour for the stories behind the houses.' },
    ],
  },
  {
    name: 'Manali', city: 'Manali', country: 'India', category: 'mountain', budget: 'budget',
    image: IMG('photo-1626621341517-bbf3d9990a23'),
    bestTime: 'March to June, December to January for snow',
    description: 'A Himalayan valley town of pine forests, apple orchards and snowy passes, popular for trekking, paragliding and mountain road trips.',
    attractions: [
      { name: 'Solang Valley', description: 'Adventure hub for paragliding, zorbing and skiing.', tip: 'Go before noon, as winds pick up later.' },
      { name: 'Hadimba Temple', description: 'A wooden cave temple in a cedar forest.', tip: 'Quieter early on weekday mornings.' },
      { name: 'Jogini Waterfall', description: 'A scenic short hike above Vashisht village.', tip: 'Bring a jacket, as spray keeps it chilly.' },
    ],
  },
  {
    name: 'Rome', city: 'Rome', country: 'Italy', category: 'heritage', budget: 'mid',
    image: IMG('photo-1552832230-c0197dd311b5'),
    bestTime: 'April to May, September to October',
    description: 'Two thousand years of history sit side by side with piazzas, trattorias and street life. Every corner holds a ruin, fountain or masterpiece.',
    attractions: [
      { name: 'Colosseum', description: 'The vast amphitheatre of ancient Rome.', tip: 'Buy a combined Forum and Palatine ticket in advance.' },
      { name: 'Vatican Museums', description: 'Raphael rooms and the Sistine Chapel.', tip: 'Book the first entry slot of the day.' },
      { name: 'Trastevere', description: 'Cobbled neighbourhood of trattorias and bars.', tip: 'Eat away from the main square for better prices.' },
    ],
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected. Clearing old data...');
    await Promise.all([User.deleteMany({}), Destination.deleteMany({}), Review.deleteMany({})]);

    const admin = await User.create({
      name: 'Admin', email: 'admin@wanderly.com', password: 'Admin@123', role: 'admin',
    });
    const demo = await User.create({
      name: 'Demo Traveller', email: 'demo@wanderly.com', password: 'Demo@123',
    });

    const created = await Destination.insertMany(
      destinations.map((d) => ({ ...d, createdBy: admin._id }))
    );

    // A few starter reviews so ratings are not empty
    const samples = [
      { rating: 5, comment: 'Absolutely worth the trip. Go early to avoid crowds.' },
      { rating: 4, comment: 'Beautiful place, a bit busy in peak season.' },
    ];
    for (const dest of created.slice(0, 4)) {
      await Review.create({ destination: dest._id, user: demo._id, ...samples[0] });
      await Review.create({ destination: dest._id, user: admin._id, ...samples[1] });
      await Review.recalc(dest._id);
    }

    console.log(`Seeded ${created.length} destinations.`);
    console.log('Admin login: admin@wanderly.com / Admin@123');
    console.log('Demo login:  demo@wanderly.com / Demo@123');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
