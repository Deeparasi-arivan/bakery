const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Owner = require('../models/Owner');
const Shop = require('../models/Shop');
const Customer = require('../models/Customer');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const StockMovement = require('../models/StockMovement');
const BulkOrder = require('../models/BulkOrder');

const sampleCategories = [
  {
    name: 'Cake',
    slug: 'cake',
    description: 'Freshly baked artisanal cakes for everyday moments',
    icon: 'bi-cake2',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    displayOrder: 1
  },
  {
    name: 'Birthday Cake',
    slug: 'birthday-cake',
    description: 'Custom celebratory tiered birthday cakes with candles and ribbons',
    icon: 'bi-balloon-heart',
    image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&auto=format&fit=crop&q=80',
    displayOrder: 2
  },
  {
    name: 'Chocolate Cake',
    slug: 'chocolate-cake',
    description: 'Decadent dark and Belgian chocolate fudge gourmet delights',
    icon: 'bi-cup-hot',
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&auto=format&fit=crop&q=80',
    displayOrder: 3
  },
  {
    name: 'Black Forest Cake',
    slug: 'black-forest-cake',
    description: 'Classic German kirsch-infused chocolate layers with cherries and cream',
    icon: 'bi-flower1',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80',
    displayOrder: 4
  },
  {
    name: 'Red Velvet Cake',
    slug: 'red-velvet-cake',
    description: 'Crimson cocoa sponge layered with silky cream cheese frosting',
    icon: 'bi-heart',
    image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600&auto=format&fit=crop&q=80',
    displayOrder: 5
  },
  {
    name: 'Cupcake',
    slug: 'cupcake',
    description: 'Single-serve frosted cupcakes in vibrant baker batches',
    icon: 'bi-stars',
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&auto=format&fit=crop&q=80',
    displayOrder: 6
  },
  {
    name: 'Donut',
    slug: 'donut',
    description: 'Glazed, frosted, and sprinkle-topped ring donuts freshly fried daily',
    icon: 'bi-circle',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    displayOrder: 7
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bakery_management');
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing collections
    await Promise.all([
      Owner.deleteMany({}),
      Shop.deleteMany({}),
      Customer.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Address.deleteMany({}),
      Order.deleteMany({}),
      Sale.deleteMany({}),
      Expense.deleteMany({}),
      StockMovement.deleteMany({}),
      BulkOrder.deleteMany({})
    ]);

    console.log('[Seed] Cleared existing data.');

    // 1. Create Default Owner
    const owner = await Owner.create({
      name: 'Deepa Dhiya',
      email: 'owner@bakery.com',
      phone: '9042487448',
      password: 'deepadhiya',
      role: 'owner'
    });
    console.log(`[Seed] Created Owner: ${owner.phone} / deepadhiya`);

    // 2. Create Shop
    const shop = await Shop.create({
      shopName: 'SweetHome Bakery & Patisserie',
      ownerName: 'Deepa Dhiya',
      owner: owner._id,
      shopLogo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
      contactNumber: '9876543210',
      email: 'contact@sweetdelight.com',
      street: '42 Pastry Lane, Indiranagar',
      lane: '2nd Cross, Near Central Park',
      village: 'Halasuru',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560038',
      isVerified: true
    });

    owner.shop = shop._id;
    await owner.save();
    console.log(`[Seed] Created Shop: ${shop.shopName}`);

    // 3. Create Categories
    const categoriesMap = {};
    for (const catData of sampleCategories) {
      const cat = await Category.create(catData);
      categoriesMap[cat.name] = cat._id;
    }
    console.log(`[Seed] Created ${sampleCategories.length} Categories.`);

    // 4. Create Sample Products across required categories
    const sampleProducts = [
      {
        name: 'Classic Vanilla Bean Cloud Cake',
        description: 'Moist Madagascar vanilla bean sponge layered with light mascarpone mousse and white chocolate curls.',
        category: categoriesMap['Cake'],
        price: 550,
        quantity: '500g',
        stock: 18,
        lowStockThreshold: 4,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
        rating: 4.9,
        reviewsCount: 38,
        isFeatured: true
      },
      {
        name: 'Celebration Rainbow Birthday Cake',
        description: 'Stunning 6-layer rainbow sponge cake frosted with vanilla buttercream and decorated with party sprinkles.',
        category: categoriesMap['Birthday Cake'],
        price: 890,
        quantity: '1kg',
        stock: 12,
        lowStockThreshold: 3,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&auto=format&fit=crop&q=80',
        rating: 4.95,
        reviewsCount: 52,
        isFeatured: true
      },
      {
        name: 'Grand Birthday Confetti Buttercream Cake',
        description: 'Two-tier golden sponge filled with rich vanilla frosting, chocolate drip, and macaron toppers.',
        category: categoriesMap['Birthday Cake'],
        price: 1450,
        quantity: '1.5kg',
        stock: 6,
        lowStockThreshold: 2,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80',
        rating: 4.88,
        reviewsCount: 24
      },
      {
        name: 'Belgian Dark Truffle Chocolate Cake',
        description: 'Intense 70% dark Belgian chocolate ganache enveloped over ultra-soft cocoa sponge with gold dust flakes.',
        category: categoriesMap['Chocolate Cake'],
        price: 720,
        quantity: '500g',
        stock: 22,
        lowStockThreshold: 5,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&auto=format&fit=crop&q=80',
        rating: 4.98,
        reviewsCount: 84,
        isFeatured: true
      },
      {
        name: 'Molten Chocolate Hazelnut Crunch Cake',
        description: 'Nutella cream layers interleaved with crushed roasted hazelnuts and a glossy mirror glaze finish.',
        category: categoriesMap['Chocolate Cake'],
        price: 850,
        quantity: '1kg',
        stock: 9,
        lowStockThreshold: 3,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80',
        rating: 4.9,
        reviewsCount: 46
      },
      {
        name: 'Authentic Black Forest Cherry Gateau',
        description: 'Traditional Black forest layered with imported sour cherries, chocolate shavings, and fresh Chantilly cream.',
        category: categoriesMap['Black Forest Cake'],
        price: 680,
        quantity: '500g',
        stock: 14,
        lowStockThreshold: 4,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80',
        rating: 4.85,
        reviewsCount: 60,
        isFeatured: true
      },
      {
        name: 'Royal Black Forest Premium 1kg',
        description: 'Rich dark cherry compote layered between Dutch cocoa sponge and Swiss chocolate crown garnishes.',
        category: categoriesMap['Black Forest Cake'],
        price: 1150,
        quantity: '1kg',
        stock: 7,
        lowStockThreshold: 3,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80',
        rating: 4.9,
        reviewsCount: 31
      },
      {
        name: 'Classic Crimson Red Velvet Cake',
        description: 'Signature buttermilk and cacao crimson sponge topped with velvety smooth Philadelphia cream cheese frosting.',
        category: categoriesMap['Red Velvet Cake'],
        price: 750,
        quantity: '500g',
        stock: 15,
        lowStockThreshold: 4,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600&auto=format&fit=crop&q=80',
        rating: 4.92,
        reviewsCount: 77,
        isFeatured: true
      },
      {
        name: 'Red Velvet Heart Special 1kg',
        description: 'Heart-shaped handcrafted red velvet cake with ruby chocolate crisp pearls and red velvet crumbs.',
        category: categoriesMap['Red Velvet Cake'],
        price: 1290,
        quantity: '1kg',
        stock: 3, // Low stock indicator
        lowStockThreshold: 4,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&auto=format&fit=crop&q=80',
        rating: 4.96,
        reviewsCount: 42
      },
      {
        name: 'Assorted Gourmet Cupcakes Box (Pack of 6)',
        description: 'Six delectable cupcakes: 2 Dark Choco, 2 Red Velvet Cream Cheese, and 2 Salted Caramel Vanilla.',
        category: categoriesMap['Cupcake'],
        price: 360,
        quantity: '6 Pcs',
        stock: 25,
        lowStockThreshold: 5,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&auto=format&fit=crop&q=80',
        rating: 4.88,
        reviewsCount: 95,
        isFeatured: true
      },
      {
        name: 'Blueberry Swirl Frosted Cupcakes (Pack of 4)',
        description: 'Tender vanilla cupcakes bursting with wild blueberries and topped with whipped blueberry cream.',
        category: categoriesMap['Cupcake'],
        price: 260,
        quantity: '4 Pcs',
        stock: 16,
        lowStockThreshold: 4,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&auto=format&fit=crop&q=80',
        rating: 4.75,
        reviewsCount: 39
      },
      {
        name: 'Classic Chocolate Glazed Ring Donut (Box of 4)',
        description: 'Airy yeast-raised rings dipped in rich dark chocolate glaze and drizzled with white chocolate.',
        category: categoriesMap['Donut'],
        price: 240,
        quantity: '4 Pcs',
        stock: 30,
        lowStockThreshold: 6,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
        rating: 4.82,
        reviewsCount: 110,
        isFeatured: true
      },
      {
        name: 'Rainbow Confetti Sugar Donuts (Box of 4)',
        description: 'Fluffy golden fried donuts glazed in strawberry icing and showered with cheerful sugar confetti.',
        category: categoriesMap['Donut'],
        price: 220,
        quantity: '4 Pcs',
        stock: 2, // Low stock indicator
        lowStockThreshold: 5,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop&q=80',
        rating: 4.79,
        reviewsCount: 65
      }
    ];

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`[Seed] Created ${createdProducts.length} Products.`);

    // 5. Create Sample Customers
    const customer1 = await Customer.create({
      name: 'Priya Ramesh',
      phone: '9876500001',
      email: 'priya@gmail.com',
      isVerified: true
    });

    const customer2 = await Customer.create({
      name: 'Rahul Verma',
      phone: '9876500002',
      email: 'rahul@gmail.com',
      isVerified: true
    });

    // 6. Create Customer Addresses
    const addr1 = await Address.create({
      customer: customer1._id,
      name: 'Priya Ramesh',
      phoneNumber: '9876500001',
      doorNumber: 'Flat 302, Green Glen Apts',
      street: '14th Cross, 6th Main Road',
      village: 'Koramangala',
      taluk: 'Bangalore South',
      district: 'Bangalore Urban',
      pincode: '560034',
      state: 'Karnataka',
      isDefault: true
    });

    customer1.defaultAddress = addr1._id;
    await customer1.save();

    const addr2 = await Address.create({
      customer: customer2._id,
      name: 'Rahul Verma',
      phoneNumber: '9876500002',
      doorNumber: 'Villa #18, Palm Meadows',
      street: 'Airport Road',
      village: 'Varthur',
      taluk: 'Bangalore East',
      district: 'Bangalore Urban',
      pincode: '560066',
      state: 'Karnataka',
      isDefault: true
    });

    customer2.defaultAddress = addr2._id;
    await customer2.save();

    // 7. Create Sample Completed and Pending Orders
    const order1 = await Order.create({
      orderNumber: 'BK-20261013-1001',
      customer: customer1._id,
      items: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          image: createdProducts[0].image,
          price: createdProducts[0].price,
          quantity: 1,
          subtotal: 550
        },
        {
          product: createdProducts[9]._id,
          name: createdProducts[9].name,
          image: createdProducts[9].image,
          price: createdProducts[9].price,
          quantity: 1,
          subtotal: 360
        }
      ],
      subtotal: 910,
      deliveryFee: 0,
      totalAmount: 910,
      deliveryAddress: {
        name: addr1.name,
        phoneNumber: addr1.phoneNumber,
        doorNumber: addr1.doorNumber,
        street: addr1.street,
        village: addr1.village,
        taluk: addr1.taluk,
        district: addr1.district,
        state: addr1.state,
        pincode: addr1.pincode
      },
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'Completed',
      orderStatus: 'Delivered',
      statusHistory: [
        { status: 'Pending', timestamp: new Date(Date.now() - 3600000 * 5) },
        { status: 'Confirmed', timestamp: new Date(Date.now() - 3600000 * 4) },
        { status: 'Preparing', timestamp: new Date(Date.now() - 3600000 * 3) },
        { status: 'Ready', timestamp: new Date(Date.now() - 3600000 * 2) },
        { status: 'Out for Delivery', timestamp: new Date(Date.now() - 3600000 * 1) },
        { status: 'Delivered', timestamp: new Date() }
      ]
    });

    const order2 = await Order.create({
      orderNumber: 'BK-20261013-1002',
      customer: customer2._id,
      items: [
        {
          product: createdProducts[3]._id,
          name: createdProducts[3].name,
          image: createdProducts[3].image,
          price: createdProducts[3].price,
          quantity: 1,
          subtotal: 720
        }
      ],
      subtotal: 720,
      deliveryFee: 0,
      totalAmount: 720,
      deliveryAddress: {
        name: addr2.name,
        phoneNumber: addr2.phoneNumber,
        doorNumber: addr2.doorNumber,
        street: addr2.street,
        village: addr2.village,
        taluk: addr2.taluk,
        district: addr2.district,
        state: addr2.state,
        pincode: addr2.pincode
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Preparing',
      statusHistory: [
        { status: 'Pending', timestamp: new Date(Date.now() - 1800000) },
        { status: 'Confirmed', timestamp: new Date(Date.now() - 1200000) },
        { status: 'Preparing', timestamp: new Date(Date.now() - 600000) }
      ]
    });

    // 8. Create Sales
    await Sale.create({
      order: order1._id,
      orderNumber: order1.orderNumber,
      customer: customer1._id,
      customerName: 'Priya Ramesh',
      amount: 910,
      paymentMethod: 'RAZORPAY',
      itemsCount: 2,
      date: new Date()
    });

    await Sale.create({
      order: order2._id,
      orderNumber: order2.orderNumber,
      customer: customer2._id,
      customerName: 'Rahul Verma',
      amount: 720,
      paymentMethod: 'COD',
      itemsCount: 1,
      date: new Date()
    });

    // Earlier sales for history
    const pastSales = [
      { orderNumber: 'BK-20261010-0890', customerName: 'Deepa Krishnan', amount: 1450, paymentMethod: 'RAZORPAY', itemsCount: 2, date: new Date(Date.now() - 86400000 * 3) },
      { orderNumber: 'BK-20261011-0912', customerName: 'Arun Kumar', amount: 890, paymentMethod: 'COD', itemsCount: 1, date: new Date(Date.now() - 86400000 * 2) },
      { orderNumber: 'BK-20261012-0945', customerName: 'Sita Menon', amount: 1250, paymentMethod: 'RAZORPAY', itemsCount: 3, date: new Date(Date.now() - 86400000 * 1) }
    ];
    await Sale.insertMany(pastSales);

    // 9. Create Expenses
    const sampleExpenses = [
      {
        category: 'Ingredients',
        amount: 3200,
        date: new Date(Date.now() - 86400000 * 2),
        description: 'Belgian cocoa powder, Madagascar vanilla pods, and organic butter 10kg',
        recordedBy: owner._id
      },
      {
        category: 'Packaging',
        amount: 1100,
        date: new Date(Date.now() - 86400000 * 3),
        description: 'Pastry boxes, golden cake boards, and ribbon rolls',
        recordedBy: owner._id
      },
      {
        category: 'Utilities',
        amount: 850,
        date: new Date(Date.now() - 86400000 * 5),
        description: 'Commercial oven cooking gas cylinder refills',
        recordedBy: owner._id
      },
      {
        category: 'Maintenance',
        amount: 500,
        date: new Date(Date.now() - 86400000 * 6),
        description: 'Electric planetary mixer servicing and blade sharpening',
        recordedBy: owner._id
      }
    ];
    await Expense.insertMany(sampleExpenses);

    // 10. Create Bulk Orders
    const sampleBulkOrders = [
      {
        customerName: 'Karthik & Sneha',
        contactNumber: '9845012345',
        email: 'sneha.wedding@gmail.com',
        eventType: 'Wedding',
        eventDate: new Date(Date.now() + 86400000 * 14),
        requiredItems: '3-tier Rustic White Chocolate Buttercream Wedding Cake with fresh lavender + 100 assorted dessert cupcakes',
        estimatedBudget: 8500,
        advanceAmount: 3000,
        status: 'Confirmed',
        notes: 'Delivery to Grand Palace Hall at 4:00 PM. Requires chiller transport.'
      },
      {
        customerName: 'Infosys Team Lead (Anita)',
        contactNumber: '9900112233',
        email: 'anita.c@infosys.com',
        eventType: 'Corporate',
        eventDate: new Date(Date.now() + 86400000 * 5),
        requiredItems: '50 Boxed Chocolate Truffle Cupcakes with custom corporate edible wafer logo print',
        estimatedBudget: 4200,
        advanceAmount: 2000,
        status: 'In Progress',
        notes: 'Deliver to Electronic City campus Gate 2.'
      },
      {
        customerName: 'Vikram Joshi',
        contactNumber: '9880099881',
        email: 'vikram.j@gmail.com',
        eventType: 'Birthday',
        eventDate: new Date(Date.now() + 86400000 * 7),
        requiredItems: '2-tier Superhero Fondant Cake (Chocolate Truffle) 3kg for son 5th birthday',
        estimatedBudget: 3500,
        advanceAmount: 0,
        status: 'Inquiry',
        notes: 'Needs custom Spider-Man design. Waiting for confirmation.'
      }
    ];
    await BulkOrder.insertMany(sampleBulkOrders);

    console.log('[Seed] Database seeded successfully with realistic bakery records!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
