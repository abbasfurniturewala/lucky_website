export const business = {
  name: "Lucky Interiors Furniture",
  tagline: "Furniture and home essentials in Mumbai",
  logo: "/lucky-interiors-logo.png",
  logoSrcSet: "/lucky-interiors-logo-320.webp 320w, /lucky-interiors-logo-640.webp 640w",
  email: "hello@luckyinteriorsfurniture.com",
  phoneDisplay: "+91 96195 78893",
  whatsappNumber: "919619578893",
  callNumber: "+919619578893",
  instagramEnabled: false,
  instagramUrl: "https://www.instagram.com/lucky_interiors_furniture/",
  locationLabel: "Mumbai location",
  hours: "Contact us before visiting to confirm opening hours.",
  mapsUrl: "https://maps.app.goo.gl/vYTMwEGrpCQwgADF8",
  mapsEmbedUrl: "https://www.google.com/maps?q=19.194342,72.847006&z=17&output=embed",
};

export const categories = [
  {
    name: "Living Room",
    description: "Sofas, TV units, recliners, and tables",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Bedroom",
    description: "Beds, wardrobes, side tables, and storage",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Dining",
    description: "Dining tables, chairs, and compact sets",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Office",
    description: "Chairs, study desks, and work-from-home setups",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Storage Furniture",
    description: "Cabinets, TV units, bookshelves, and compact storage",
    image:
      "/products/betterhomeindia/bh-039-modern-4-door-storage-cabinet-da/1.webp",
  },
];

export const promoBanner = {
  eyebrow: "Furniture catalog for Mumbai homes",
  title: "Furniture for Mumbai homes",
  text: "Browse products online, then contact us to confirm current price, dimensions, finish, and availability.",
  image:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=84",
};

export const homepageSeoContent = {
  title: "Browse furniture with the details that matter",
  text:
    "Explore sofas, beds, dining sets, wardrobes, centre tables, TV units, office furniture, and storage options in one catalog. Product pages help you compare the information currently available for each design, while category filters make larger collections easier to narrow down. Before deciding, confirm the latest price, dimensions, material details, colour, and availability by WhatsApp or phone. For furniture intended for a Mumbai flat, measure the room as well as doors, passages, stairs, and lift access so the selected piece can reach and fit the space comfortably.",
};

export const shopCategories = [
  {
    name: "Sofas",
    slug: "sofas",
    filterCategory: "Living Room",
    description: "Browse sofa styles for living rooms, lounges, and family seating.",
    seoTitle: "Sofas in Mumbai | Sofa Sets | Lucky Interiors",
    seoDescription:
      "Explore sofa sets for Mumbai living rooms. Compare seating, colours, materials and sizes, then enquire with Lucky Interiors by WhatsApp or phone.",
    heading: "Sofas in Mumbai",
    relatedSlugs: ["centre-tables", "recliners", "chairs", "cabinets-sideboards", "beds", "dining-sets"],
    seoContent: {
      intro:
        "Compare sofa options for everyday living rooms, family seating, and compact spaces. Check seating capacity, overall width, upholstery, colour, and current availability before choosing a design. Measure the entry door, lift, passage, and final wall area so the sofa can be delivered and positioned comfortably.",
      buyingTitle: "Choosing a sofa for your living room",
      buyingPoints: [
        "Start with the number of seats and the layout your room can support without blocking walkways.",
        "Compare the sofa's full width and depth with the available wall area, not only the seat dimensions.",
        "Confirm upholstery, colour, frame details, price, and availability for the exact product before ordering.",
      ],
      faqs: [
        {
          question: "How should I measure my room for a sofa?",
          answer:
            "Measure the intended wall, walking clearance, doors, passages, stairs, and lift. Compare those measurements with the product's full width, depth, and height.",
        },
        {
          question: "How do I confirm a sofa's current price and availability?",
          answer:
            "Open the product page and send its name or link by WhatsApp, or call us. The current information for that design can then be confirmed.",
        },
      ],
    },
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=82",
  },
  {
    name: "Beds",
    slug: "beds",
    filterCategory: "Bedroom",
    description: "Explore bed options, storage beds, and bedroom furniture pairings.",
    seoTitle: "Beds in Mumbai | Bedroom & Storage Beds | Lucky Interiors",
    seoDescription:
      "Browse beds for Mumbai bedrooms, including storage options where available. Compare sizes and details, then enquire for current availability.",
    heading: "Beds in Mumbai",
    relatedSlugs: ["wardrobes", "bedroom-sets", "dressing-table", "shoe-racks", "sofas", "centre-tables"],
    seoContent: {
      intro:
        "Browse beds for different bedroom layouts and compare the details available for each design. Check the external frame size as well as mattress compatibility, because the full bed usually needs more floor area than the mattress alone. If storage is shown or listed, confirm the exact mechanism and internal space for that product.",
      buyingTitle: "Planning space for a bed",
      buyingPoints: [
        "Measure the complete bed footprint and leave enough clearance to walk and open nearby wardrobes or drawers.",
        "Confirm mattress size, storage type, material, headboard depth, and assembly requirements for the selected design.",
        "Check door, staircase, passage, and lift dimensions before confirming a large bed frame.",
      ],
      faqs: [
        {
          question: "Is mattress size the same as the bed's full size?",
          answer:
            "No. The external frame and headboard can make the complete bed wider or longer than the mattress. Use the product's full dimensions when planning the room.",
        },
        {
          question: "Are all beds available with storage?",
          answer:
            "Storage depends on the individual design. Confirm the exact storage configuration and mechanism shown for the product before ordering.",
        },
      ],
    },
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=82",
  },
  {
    name: "Bedroom Sets",
    slug: "bedroom-sets",
    filterCategory: "Bedroom",
    description: "Complete bedroom sets with beds, wardrobes, dressing units, and storage options.",
    image:
      "/products/betterhomeindia/bh-271-kingdom-luxury-bedroom-set-with-upho/1.jpg",
  },
  {
    name: "Dining Sets",
    slug: "dining-sets",
    filterCategory: "Dining",
    description: "Dining tables and chairs for compact homes and family spaces.",
    seoTitle: "Dining Tables in Mumbai | Dining Sets | Lucky Interiors",
    seoDescription:
      "Explore dining tables and sets for Mumbai homes. Compare seating capacity, dimensions, materials and finishes before you enquire.",
    heading: "Dining Tables and Sets in Mumbai",
    relatedSlugs: ["chairs", "centre-tables", "cabinets-sideboards", "sofas", "beds", "study-tables"],
    seoContent: {
      intro:
        "Explore dining tables and complete dining sets for everyday meals and family seating. The number of chairs is only one part of room planning: compare the table's full length and width, then allow space for chairs to pull out and for people to walk behind them.",
      buyingTitle: "Choosing the right dining-table size",
      buyingPoints: [
        "Match seating capacity to regular use while checking the full table and chair dimensions.",
        "Allow practical clearance around the table so chairs can move without blocking doors or walkways.",
        "Confirm what the set includes, along with material, finish, price, and current availability.",
      ],
      faqs: [
        {
          question: "How much space should I leave around a dining table?",
          answer:
            "Plan enough room for chairs to pull out and for people to pass behind them. Measure the actual room and any nearby doors or cabinets before selecting a table.",
        },
        {
          question: "Does every dining product include chairs?",
          answer:
            "Not necessarily. Check the product name, images, and set contents, then confirm exactly what is included before ordering.",
        },
      ],
    },
    image:
      "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=700&q=82",
  },
  {
    name: "Study Tables",
    slug: "study-tables",
    filterCategory: "Office",
    description: "Study desks and work tables for students and home offices.",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=700&q=82",
  },
  {
    name: "Centre Tables",
    slug: "centre-tables",
    filterCategory: "Living Room",
    description: "Centre tables and accent tables for everyday living room use.",
    seoTitle: "Centre Tables in Mumbai | Coffee Tables | Lucky Interiors",
    seoDescription:
      "Browse centre and coffee tables in Mumbai. Compare dimensions, shapes, materials, colours and storage options before enquiring.",
    heading: "Centre Tables in Mumbai",
    relatedSlugs: ["sofas", "cabinets-sideboards", "recliners", "chairs", "dining-sets", "bookshelves"],
    seoContent: {
      intro:
        "Compare centre and coffee tables by shape, dimensions, finish, and storage. A table should be easy to reach from the sofa while leaving comfortable walking space around the seating area. Check the product's height as well as its width and depth before choosing.",
      buyingTitle: "Finding a centre table that fits",
      buyingPoints: [
        "Use the sofa length and available floor area to shortlist a proportionate table size.",
        "Round or oval edges can help circulation in tighter layouts, while rectangular tables suit longer sofa arrangements.",
        "Confirm top material, base material, storage, finish, price, and availability for the exact product.",
      ],
      faqs: [
        {
          question: "What should I measure before buying a centre table?",
          answer:
            "Measure the open floor area between the sofa and surrounding furniture, then compare it with the table's width, depth, and height.",
        },
        {
          question: "Are centre tables and coffee tables the same?",
          answer:
            "The terms are commonly used for the low table placed in a seating area. Product size, shape, material, and storage are more useful comparison points than the label alone.",
        },
      ],
    },
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=82",
  },
  {
    name: "Recliners",
    slug: "recliners",
    filterCategory: "Living Room",
    description: "Comfort seating and recliner-inspired lounge furniture options.",
    image: "/products/betterhomeindia/bh-202-single-seater-sofa-classic-leath/1.webp",
  },
  {
    name: "Wardrobes",
    slug: "wardrobes",
    filterCategory: "Bedroom",
    description: "Wardrobes, sliding storage, mirror options, and bedroom organization.",
    seoTitle: "Wardrobes in Mumbai | Bedroom Storage | Lucky Interiors",
    seoDescription:
      "Browse wardrobes for Mumbai bedrooms. Compare door styles, dimensions, colours and storage layouts, then enquire for current options.",
    heading: "Wardrobes in Mumbai",
    relatedSlugs: ["beds", "bedroom-sets", "dressing-table", "shoe-racks", "bookshelves", "cabinets-sideboards"],
    seoContent: {
      intro:
        "Browse wardrobes with different door styles, colours, and internal-storage layouts. Measure the wall width, ceiling height, skirting, switches, and floor clearance. For hinged doors, include the space needed to open them; for sliding doors, confirm the usable internal depth and track arrangement.",
      buyingTitle: "Planning bedroom storage",
      buyingPoints: [
        "Compare external width, height, and depth with the exact wall and nearby furniture.",
        "Choose the internal balance of shelves, drawers, and hanging space according to what you need to store.",
        "Confirm door type, mirror, material, internal layout, assembly, price, and availability for the selected wardrobe.",
      ],
      faqs: [
        {
          question: "Should I choose sliding or hinged wardrobe doors?",
          answer:
            "Sliding doors do not swing into the room, while hinged doors provide direct access to each section. The better choice depends on room clearance and the product's internal layout.",
        },
        {
          question: "What measurements are needed for a wardrobe?",
          answer:
            "Measure wall width, floor-to-ceiling height, available depth, skirting, switches, doorways, passages, stairs, and lift access.",
        },
      ],
    },
    image: "/products/betterhomeindia/bh-248-4-door-wooden-wardrobe-premium-b/1.webp",
  },
  {
    name: "TV Unit & Cabinets",
    slug: "cabinets-sideboards",
    filterCategory: "Storage Furniture",
    description: "TV units, media cabinets, sideboards, and practical storage furniture.",
    image: "/products/betterhomeindia/bh-055-walnut-tv-cabinet-wooden-tv-unit/1.webp",
  },
  {
    name: "Bookshelves",
    slug: "bookshelves",
    filterCategory: "Storage Furniture",
    description: "Bookshelves, bookcases, and display racks for organized rooms.",
    image:
      "/products/betterhomeindia/bh-006-wooden-open-bookshelf-modern-3-t/1.webp",
  },
  {
    name: "Office Furniture",
    slug: "office-furniture",
    filterCategory: "Office",
    description: "Office chairs, desks, and work-from-home furniture options.",
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=700&q=82",
  },
  {
    name: "Chairs",
    slug: "chairs",
    filterCategory: "Living Room",
    description: "Everyday chairs for flexible seating in homes, events, and casual spaces.",
    image:
      "/products/betterhomeindia/bh-303-glam-plastic-chair-set-of-4-steel-pe/1.jpg",
  },
  {
    name: "Dressing Tables",
    slug: "dressing-table",
    filterCategory: "Bedroom",
    description: "Dressing tables with mirrors, storage cabinets, and practical bedroom organization.",
    image:
      "/products/betterhomeindia/bh-360-premium-solid-wood-dressing-table-wi/1.jpg",
  },
  {
    name: "Outdoor Furniture",
    slug: "outdoor-furniture",
    filterCategory: "Outdoor Furniture",
    description: "Garden sets, balcony seating, and outdoor furniture for relaxed open-air spaces.",
    image:
      "/products/betterhomeindia/bh-324-4-seater-outdoor-garden-table-and-ch/1.jpg",
  },
  {
    name: "Swings",
    slug: "swings",
    filterCategory: "Outdoor Furniture",
    description: "Hanging chairs and garden swings for balconies, terraces, and outdoor corners.",
    image:
      "/products/betterhomeindia/bh-370-imported-couple-hanging-swing-chair/1.jpg",
  },
  {
    name: "Shoe Racks",
    slug: "shoe-racks",
    filterCategory: "Bedroom",
    description: "Shoe racks and small-space storage options for organized homes.",
    image: "/products/categories/shoe-rack.jpg",
  },
];
