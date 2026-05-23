const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Room = require('./models/Room');
const MessMenu = require('./models/MessMenu');
const Notification = require('./models/Notification');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Room.deleteMany({}),
    MessMenu.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const hash = (p) => bcrypt.hash(p, 10);

  // Create users
  const [admin, warden, s1, s2, s3, parent] = await User.insertMany([
    { name: 'Admin User', email: 'admin@hostel.com', password: await hash('admin123'), role: 'admin', phone: '9000000001' },
    { name: 'Warden Singh', email: 'warden@hostel.com', password: await hash('warden123'), role: 'warden', phone: '9000000002' },
    { name: 'Shreshail Shinde', email: 'student@hostel.com', password: await hash('student123'), role: 'student', rollNo: 'TEAIDA22', phone: '9111111111' },
    { name: 'Chirag Jogi', email: 'chirag@hostel.com', password: await hash('chirag123'), role: 'student', rollNo: 'TEAIDA61', phone: '9111111112' },
    { name: 'Pruthviraj Sonowane', email: 'pruthvi@hostel.com', password: await hash('pruthvi123'), role: 'student', rollNo: 'TEAIDA29', phone: '9111111113' },
    { name: 'Parent User', email: 'parent@hostel.com', password: await hash('parent123'), role: 'parent', phone: '9222222222' },
  ]);

  // Create rooms
  const [r101, r102, r103] = await Room.insertMany([
    { roomNumber: '101', floor: 1, type: 'double', capacity: 2, monthlyFee: 5000, amenities: ['WiFi', 'AC'] },
    { roomNumber: '102', floor: 1, type: 'triple', capacity: 3, monthlyFee: 4000, amenities: ['WiFi', 'Fan'] },
    { roomNumber: '201', floor: 2, type: 'single', capacity: 1, monthlyFee: 7000, amenities: ['WiFi', 'AC', 'Attached Bathroom'], status: 'available' },
  ]);

  // Allocate students
  r101.occupants = [s1._id, s2._id];
  r101.status = 'occupied';
  await r101.save();
  r102.occupants = [s3._id];
  await r102.save();

  await User.findByIdAndUpdate(s1._id, { room: r101._id });
  await User.findByIdAndUpdate(s2._id, { room: r101._id });
  await User.findByIdAndUpdate(s3._id, { room: r102._id });

  // Link parent to student
  await User.findByIdAndUpdate(parent._id, { parentOf: s1._id });

  // Mess menu
  const messItems = [
    { day: 'Monday', breakfast: 'Poha, Chai', lunch: 'Dal, Rice, Roti, Sabzi', snacks: 'Samosa, Chai', dinner: 'Paneer Curry, Rice, Roti' },
    { day: 'Tuesday', breakfast: 'Upma, Juice', lunch: 'Rajma, Rice, Roti, Salad', snacks: 'Bread Pakoda, Chai', dinner: 'Dal Tadka, Jeera Rice, Roti' },
    { day: 'Wednesday', breakfast: 'Idli, Sambhar', lunch: 'Chole, Bhatura, Salad', snacks: 'Vada Pav, Chai', dinner: 'Mix Veg, Rice, Roti' },
    { day: 'Thursday', breakfast: 'Paratha, Curd', lunch: 'Dal Makhani, Rice, Roti', snacks: 'Kachori, Chai', dinner: 'Shahi Paneer, Naan, Rice' },
    { day: 'Friday', breakfast: 'Puri, Bhaji', lunch: 'Kadhi, Rice, Roti, Papad', snacks: 'Bhel Puri, Chai', dinner: 'Aloo Matar, Rice, Roti' },
    { day: 'Saturday', breakfast: 'Aloo Paratha, Butter', lunch: 'Biryani, Raita, Salad', snacks: 'Maggi, Chai', dinner: 'Dal Fry, Jeera Rice, Roti' },
    { day: 'Sunday', breakfast: 'Chole Bhature, Chai', lunch: 'Special Thali - Dal, Sabzi, Rice, Roti, Sweet', snacks: 'Jalebi, Chai', dinner: 'Paneer Butter Masala, Naan, Rice' },
  ];
  await MessMenu.insertMany(messItems);

  // Notifications
  await Notification.insertMany([
    { title: 'Welcome to HostelSync!', message: 'Your smart hostel management platform is ready. Explore all features.', type: 'success', recipient: null, createdBy: admin._id },
    { title: 'Mess Menu Updated', message: 'The mess menu for this week has been updated. Check the Mess section.', type: 'info', recipient: null, createdBy: warden._id },
    { title: 'Fee Reminder', message: 'April 2025 hostel fees are due by 10th April. Please pay on time.', type: 'warning', recipient: null, createdBy: admin._id },
  ]);

  console.log('\n✅ Database seeded successfully!\n');
  console.log('Login credentials:');
  console.log('  Admin:   admin@hostel.com   / admin123');
  console.log('  Warden:  warden@hostel.com  / warden123');
  console.log('  Student: student@hostel.com / student123');
  console.log('  Parent:  parent@hostel.com  / parent123\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
