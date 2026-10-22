import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Compass, MapPin, Calendar, Users, Shield, Award, Heart, Phone, Mail, 
  ChevronRight, ChevronLeft, Star, Menu, X, Globe, Search, Filter, 
  ExternalLink, CheckCircle, AlertCircle, ArrowUpRight, ArrowRight, Instagram, MessageCircle, Play, Pause, DollarSign, CreditCard
} from 'lucide-react';

// ==========================================
// 1. SAFELY PATCH DOM REMOVAL FOR GOOGLE TRANSLATE
// ==========================================
if (typeof window !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console && console.warn) console.warn('Cannot remove child, parent mismatch - intercepted for Google Translate compatibility.');
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console && console.warn) console.warn('Cannot insert before, parent mismatch - intercepted for Google Translate compatibility.');
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

// ==========================================
// 2. DATA MODELS & LOCAL DATASET
// ==========================================

export const SAFARI_PACKAGES = [
  {
    id: "3-day-masai-mara-magic",
    title: "3 Days Masai Mara Big Cats Flying Safari",
    duration: "3 Days / 2 Nights",
    origin: "flying",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    description: "Soar over the Rift Valley directly into the heart of the Masai Mara. Experience thrilling game drives targeting the Big Five, big cat prides, and majestic savanna sunsets.",
    highlights: ["Non-stop scenic flight to Mara", "Unlimited game drives", "Luxury tented bush accommodation", "Big Five sighting opportunity"],
    inclusions: ["Return flights from Wilson Airport", "Airstrip transfers in Mara", "Full board luxury lodge accommodation", "All park entrance fees", "Professional English speaking driver guide", "Game drives in 4x4 Land Cruiser"],
    exclusions: ["International airfare", "Travel insurance", "Personal expenses & tips", "Hot Air Balloon Safari ($450 p/p)"],
    accommodation: [{ type: "Luxury Tented Camps (e.g. Mara Serena / Ashnil Mara)" }],
    itinerary: [
      { day: 1, title: "Flight to Masai Mara & Afternoon Game Drive", description: "Board your early flight from Nairobi Wilson Airport to Mara airstrip. Arrive in time for lunch, check in at your camp, and head out for an afternoon game drive across the golden grasslands.", image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80" },
      { day: 2, title: "Full Day Big Five Exploration in Masai Mara", description: "Spend a full day exploring the Mara reserve with picnic lunches served under an acacia tree. Track lions, leopards, cheetahs, elephants, and large buffalo herds.", image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80" },
      { day: 3, title: "Early Morning Game Drive & Return to Nairobi", description: "Catch the sunrise on an early morning game drive when predators are most active. After breakfast, transfer to the airstrip for your flight back to Nairobi.", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: "4-day-amboseli-tsavo-express",
    title: "4 Days Kilimanjaro Views & Tsavo Red Elephants Safari",
    duration: "4 Days / 3 Nights",
    origin: "mombasa",
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80",
    description: "Departing from Mombasa, witness the legendary red dust elephants of Tsavo East and West, before driving into Amboseli with majestic Mount Kilimanjaro backdrop.",
    highlights: ["Mombasa pick-up & drop-off", "Mount Kilimanjaro iconic vistas", "Tsavo's famous red elephants", "Mzima Springs hippos & crocodiles"],
    inclusions: ["Transport in 4x4 Safari Land Cruiser", "All park fees and taxes", "3 Nights full board lodge stay", "Mineral water during safari", "Experienced driver-guide"],
    exclusions: ["Visas and personal insurance", "Alcoholic beverages", "Tips and gratuities"],
    accommodation: [{ type: "Safari Lodges (Kilaguni Serena & Amboseli Serena)" }],
    itinerary: [
      { day: 1, title: "Mombasa Coast to Tsavo East National Park", description: "Depart Mombasa morning drive to Tsavo East. Enjoy game viewing en-route to your lodge. Afternoon game drive tracking giant elephant herds.", image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80" },
      { day: 2, title: "Tsavo East to Tsavo West Mzima Springs", description: "Early game drive, cross over into Tsavo West. Visit Mzima Springs underwater viewing chamber to watch hippos and fish.", image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80" },
      { day: 3, title: "Tsavo West to Amboseli National Park", description: "Drive towards Amboseli National Park. Arrive for lunch with magnificent views of Mt. Kilimanjaro. Afternoon game drive in swampy marshes teeming with wildlife.", image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80" },
      { day: 4, title: "Amboseli Early Drive & Return to Coastal Beach Resort", description: "Early sunrise drive, hearty breakfast, and head back down to Mombasa Coast or Diani Beach.", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: "5-day-kenya-classic-road-safari",
    title: "5 Days Masai Mara & Lake Nakuru Road Odyssey",
    duration: "5 Days / 4 Nights",
    origin: "by-road",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    description: "Our signature 4x4 overland safari journeying through the Great Rift Valley, viewing white rhinos and flamingoes at Lake Nakuru, followed by 3 action-packed days in Masai Mara.",
    highlights: ["Overland scenic Great Rift Valley drive", "Rhino Sanctuary at Lake Nakuru", "3 Days deep exploration in Mara", "Maasai Cultural Village Visit"],
    inclusions: ["4x4 Land Cruiser with pop-up roof", "Full board accommodation", "All park entry vouchers", "AMREF Flying Doctors Emergency Evacuation cover"],
    exclusions: ["Tips", "Drinks", "Laundry"],
    accommodation: [{ type: "Mid-Range & Luxury Lodges" }],
    itinerary: [
      { day: 1, title: "Nairobi to Lake Nakuru National Park", description: "Pick up from hotel/airport. Stop at the Great Rift Valley viewpoint. Arrive Lake Nakuru for lunch and afternoon game drive watching black & white rhinos.", image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80" },
      { day: 2, title: "Lake Nakuru to Masai Mara Game Reserve", description: "Drive through golden wheat fields of Narok into Masai Mara. Afternoon game drive upon arrival.", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80" },
      { day: 3, title: "Full Day Mara Wilderness Tracking", description: "Full day game drive with packed lunch box. Visit Mara River to spot hippos and basking crocodiles.", image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80" },
      { day: 4, title: "Second Full Day in Mara & Maasai Village Tour", description: "Morning game drive. Afternoon optional visit to authentic Maasai Manyatta to learn traditional dances and bushcraft.", image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80" },
      { day: 5, title: "Masai Mara to Nairobi Departure", description: "Morning breakfast, final photo-stop, scenic drive back to Nairobi.", image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: "6-day-grand-kenya-group-safari",
    title: "6 Days Grand Kenya Group Joiner Expedition",
    duration: "6 Days / 5 Nights",
    origin: "group",
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1200&q=80",
    description: "Join small group fellow wildlife lovers covering Amboseli, Lake Naivasha Crescent Island boat safari, and Masai Mara. Unbeatable value with guaranteed window seat.",
    highlights: ["Guaranteed window seat in 4x4", "Boat ride on Lake Naivasha", "Walk with giraffes on Crescent Island", "Amboseli + Nakuru + Masai Mara"],
    inclusions: ["Group transport 4x4 Cruiser", "Full board accommodations", "Naivasha Boat Safari ticket", "Park entry fees"],
    exclusions: ["Personal items", "Beverages"],
    accommodation: [{ type: "Mid-Range Safari Lodges & Camps" }],
    itinerary: [
      { day: 1, title: "Nairobi to Amboseli", description: "Meet fellow travellers and drive south to Amboseli beneath Mount Kilimanjaro.", image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80" },
      { day: 2, title: "Amboseli Game Viewing", description: "Full day game drive spotting giant tuskers in dust clouds.", image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80" },
      { day: 3, title: "Amboseli to Lake Naivasha", description: "Drive to Lake Naivasha. Afternoon boat safari watching hippo pods and fish eagles.", image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80" },
      { day: 4, title: "Lake Naivasha to Masai Mara", description: "Proceed into the Great Mara ecosystem.", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80" },
      { day: 5, title: "Full Day Mara Adventure", description: "Expensive game tracking in central Mara plains.", image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80" },
      { day: 6, title: "Mara to Nairobi Drop-off", description: "Breakfast, return journey to Nairobi.", image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: "3-day-amboseli-express-nairobi",
    title: "3 Days Amboseli Kilimanjaro Giant Elephant Safari",
    duration: "3 Days / 2 Nights",
    origin: "nairobi",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
    description: "Quick getaway from Nairobi straight to Amboseli National Park. Experience close encounter with Africa's largest elephant herds against snow-capped Kilimanjaro.",
    highlights: ["Observation Hill panorama", "Hundreds of free-ranging elephants", "Maasai cultural interactions"],
    inclusions: ["4x4 Safari Landcruiser", "Full board lodge stay", "Park fees"],
    exclusions: ["Tips & personal insurance"],
    accommodation: [{ type: "Amboseli Serena Lodge / Oltukai Lodge" }],
    itinerary: [
      { day: 1, title: "Nairobi to Amboseli National Park", description: "Morning departure from Nairobi hotel. Drive south through Kapiti Plains to Amboseli. Afternoon game drive.", image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80" },
      { day: 2, title: "Full Day Amboseli Wildlife Safari", description: "Early morning photoshoot with Kilimanjaro background. Full day game drives through swamps and dry lake beds.", image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80" },
      { day: 3, title: "Amboseli to Nairobi Departure", description: "Morning game drive, brunch, and drive back to Nairobi.", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: "4-day-flying-mombasa-to-mara",
    title: "4 Days Coastal Beach to Masai Mara Luxury Flying Safari",
    duration: "4 Days / 3 Nights",
    origin: "flying-mombasa",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    description: "Fly direct from Ukunda (Diani) or Moi International Airport Mombasa to Masai Mara airstrip. Seamlessly blend turquoise Indian Ocean beaches with world-class bush wildlife.",
    highlights: ["Direct coastal flight to Mara", "Zero long road transfers", "Ultimate Bush & Beach luxury"],
    inclusions: ["Return coastal flight tickets", "Luxury camp full board", "Game drives in open 4x4"],
    exclusions: ["Personal drinks & balloon safari"],
    accommodation: [{ type: "Governos Camp / Neptune Mara Rianta" }],
    itinerary: [
      { day: 1, title: "Diani/Mombasa Flight to Masai Mara", description: "Board direct flight to Masai Mara. Land on bush airstrip and transfer to camp.", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80" },
      { day: 2, title: "Full Day Mara Big Cat Tracking", description: "Immerse in the wild Mara savanna.", image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80" },
      { day: 3, title: "Morning Bush Walk & Sunset Drive", description: "Guided bush walk with seasoned naturalists and evening sundowner.", image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80" },
      { day: 4, title: "Mara Flight Back to Coast", description: "Morning flight landing back in Diani / Mombasa in time for beach afternoon.", image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80" }
    ]
  }
];

export const DESTINATIONS = [
  {
    slug: "masai-mara",
    name: "Masai Mara National Reserve",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    oneLiner: "World famous home of the Great Wildebeest Migration & Big Cats.",
    overview: "The Masai Mara is Kenya's premier wildlife conservation area, famous worldwide for its dense population of lions, cheetahs, leopards, and the annual Wildebeest Migration across the river.",
    wildlife: ["Lion", "Leopard", "Cheetah", "Elephant", "Rhino", "Wildebeest", "Hippo"],
    bestTime: "July to October for Great Migration; year-round for Big Cats."
  },
  {
    slug: "amboseli",
    name: "Amboseli National Park",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
    oneLiner: "Majestic elephant herds beneath the iconic snowy peak of Mt. Kilimanjaro.",
    overview: "Crowned by Mount Kilimanjaro, Africa's highest peak, Amboseli National Park is one of Kenya's most popular parks. It is best known for huge herds of free-ranging tuskers.",
    wildlife: ["African Elephant", "Giraffe", "Zebra", "Lion", "Hyena", "Flamingo"],
    bestTime: "June to October and January to February."
  },
  {
    slug: "tsavo",
    name: "Tsavo East & West National Parks",
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80",
    oneLiner: "Vast rugged wilderness known for famous dust-red elephants & natural springs.",
    overview: "Forming one of the largest national parks in the world, Tsavo offers dramatic volcanic landscapes, red volcanic soil, Mzima Springs, and vast wilderness.",
    wildlife: ["Red Elephants", "Rhino", "Buffalo", "Leopard", "Crocodiles", "Hippo"],
    bestTime: "June to September and December to March."
  },
  {
    slug: "samburu",
    name: "Samburu National Reserve",
    image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80",
    oneLiner: "Arid northern paradise featuring rare Special Five species.",
    overview: "Located in arid northern Kenya, Samburu features the Ewaso Nyiro River and unique endemic species known as the Samburu Special Five.",
    wildlife: ["Grevys Zebra", "Reticulated Giraffe", "Beisa Oryx", "Somali Ostrich", "Gerenuk"],
    bestTime: "Dry seasons: June to October and December to March."
  },
  {
    slug: "lake-naivasha",
    name: "Lake Naivasha & Hell's Gate",
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1200&q=80",
    oneLiner: "Freshwater Great Rift Valley lake with boat safaris & cycling past wildlife.",
    overview: "A serene freshwater lake in the Rift Valley, surrounded by yellow fever acacia trees. Famous for hippo boat rides and walking/cycling in Hell's Gate National Park.",
    wildlife: ["Hippo Pods", "Fish Eagles", "Waterbuck", "Giraffe", "Buffalo"],
    bestTime: "Year-round destinations."
  },
  {
    slug: "diani-beach",
    name: "Diani Beach & Kwale Coast",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    oneLiner: "Pristine white sand beach, warm turquoise ocean, and marine adventures.",
    overview: "Consistently voted Africa's top beach destination, Diani Beach is the headquarters for Cats Claws Expedition, offering ideal post-safari relaxation.",
    wildlife: ["Dolphins", "Colobus Monkeys", "Sea Turtles", "Coral Reef Marine Life"],
    bestTime: "October to April for warm sunny beach weather."
  }
];

export const EXCURSIONS = {
  nairobi: [
    {
      id: "nairobi-giraffe-elephant-tour",
      title: "Nairobi Giraffe Centre & Elephant Orphanage Day Tour",
      image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80",
      description: "Feed Rothschild giraffes by hand and meet baby orphaned elephants at the Sheldrick Wildlife Trust. Includes Karen Blixen Museum and lunch.",
      highlights: ["Kiss a Rothschild giraffe", "Meet baby elephants at 11am feeding", "Karen Blixen Coffee Garden lunch"],
      duration: "Full Day (8:30 AM - 4:00 PM)"
    },
    {
      id: "nairobi-national-park-half-day",
      title: "Nairobi National Park Morning Safari Drive",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
      description: "The world's only wildlife capital! Spot free-roaming lions, rhinos, and zebras with city skyscrapers in the background.",
      highlights: ["High rhino density", "City backdrop skyline photos", "Early morning lion tracking"],
      duration: "Half Day (6:00 AM - 11:00 AM)"
    }
  ],
  mombasa: [
    {
      id: "mombasa-city-fort-jesus-tour",
      title: "Mombasa Historic City & Fort Jesus Heritage Tour",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      description: "Explore UNESCO World Heritage site Fort Jesus, walk through narrow Swahili Old Town streets, visit spice markets and famous elephant tusks monument.",
      highlights: ["Fort Jesus Museum guided entry", "Old Town Swahili architecture", "Spice & market shopping"],
      duration: "Half Day or Full Day"
    },
    {
      id: "wasini-dolphin-dhow-safari",
      title: "Wasini Island Dolphin Dhow Cruise & Snorkeling Safari",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
      description: "Sail on a traditional Swahili Dhow in Kisite Mpunguti Marine Park. Spot wild dolphins, snorkel pristine coral reefs, and relish seafood feast on Wasini Island.",
      highlights: ["Dolphin watching cruise", "Marine park coral reef snorkeling", "Wasini Island crab & seafood lunch"],
      duration: "Full Day (6:30 AM - 5:30 PM)"
    }
  ]
};

export const ACCOMMODATION_CATEGORIES = [
  {
    slug: "luxury-tented-camps",
    name: "Luxury Tented Camps",
    description: "Opulent canvas suites featuring plush bedding, en-suite marble bathrooms, private viewing decks, and personalized butler service deep in the wild.",
    lodges: [
      { name: "Mara Serena Safari Lodge", description: "Perched high on a hill overlooking the vast Mara plains with panoramic Wildebeest river crossing views." },
      { name: "Ashnil Mara Camp", description: "Located right along the Mara River, ideal for watching hippos and wildlife directly from tent verandas." },
      { name: "Governos Camp Mara", description: "Nestled along the thick riverine forest, offering classic old-world safari luxury." }
    ]
  },
  {
    slug: "safari-lodges",
    name: "Safari Lodges",
    description: "Solid stone and timber architectural masterpieces built inside national parks with swimming pools, waterhole viewing decks, and gourmet dining.",
    lodges: [
      { name: "Kilaguni Serena Safari Lodge", description: "Tsavo West lodge situated right in front of a natural waterhole frequented by elephants and leopards daily." },
      { name: "Amboseli Serena Lodge", description: "Inspired by traditional Maasai Manyattas, looking out directly toward snow-capped Mt. Kilimanjaro." },
      { name: "Sarova Lion Hill Game Lodge", description: "Set on a hill inside Lake Nakuru National Park with views across the pink flamingo lake." }
    ]
  },
  {
    slug: "coastal-resorts",
    name: "Coastal Resorts & Beach Villas",
    description: "Tropical coastal havens on Diani Beach and Mombasa North Coast with infinity pools, oceanfront dining, and private beach lounges.",
    lodges: [
      { name: "Baobab Beach Resort & Spa", description: "World-class luxury beach resort perched on a cliff overlooking golden sand Diani shores." },
      { name: "Neptune Village Beach Resort", description: "Swahili style thatched bungalows surrounded by lush tropical gardens in Kwale Diani." }
    ]
  }
];

export const GALLERY_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80", park: "Masai Mara", title: "Lion Pride on Mara Rock" },
  { url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80", park: "Amboseli", title: "Elephants beneath Mt. Kilimanjaro" },
  { url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80", park: "Tsavo", title: "Tsavo Red Dust Elephants" },
  { url: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80", park: "Samburu", title: "Samburu Leopard in Acacia" },
  { url: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80", park: "Lake Naivasha", title: "Lake Naivasha Sunset Hippo" },
  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", park: "Diani Beach", title: "Diani Beach Paradise" }
];

export const TEAM_MEMBERS = [
  {
    name: "Dennis Stephine",
    title: "Founder & Lead Expedition Specialist",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    bio: "Born and raised in Kenya with over 12 years of guiding experience across Masai Mara, Amboseli, and Tsavo. Dennis ensures every guest experiences the wild heart of Kenya."
  },
  {
    name: "Stephine Ndenga",
    title: "Operations Director & Guest Relations",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    bio: "Specializing in luxury custom itineraries and seamless travel logistics, Stephine oversees field operations from our Kwale Diani headquarters."
  }
];

export const TESTIMONIALS = [
  { quote: "Cats Claws Expedition gave us the trip of a lifetime! Dennis found a mother leopard and her cub within 2 hours of entering the Mara. Absolutely flawless logistics.", author: "Elena & Marcus", origin: "Germany", rating: 5 },
  { quote: "Flying from Diani direct to Masai Mara was so seamless. The 4x4 Land Cruiser was brand new, super comfortable with charging ports. 10/10 service!", author: "David Thompson", origin: "United Kingdom", rating: 5 },
  { quote: "The best safari agency in Kenya! Very transparent, prompt WhatsApp updates, and zero hidden fees. Kilimanjaro views at Amboseli were breathtaking.", author: "Sarah L.", origin: "United States", rating: 5 },
  { quote: "Stephine organized our custom 6-day private safari for 8 family members. Outstanding food, amazing lodges, and warm Kenyan hospitality throughout.", author: "Jean-Luc M.", origin: "France", rating: 5 }
];

// ==========================================
// 3. UTILITY HOOKS & COMPONENTS
// ==========================================

// Scroll to top on route change helper
const ScrollToTop = ({ currentPath }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);
  return null;
};

// Reusable Search Sort Bar
const SearchSortBar = ({ searchQuery, setSearchQuery, sortBy, setSortBy }) => (
  <div className="bg-[#121212] p-4 rounded-xl border border-[#332a1e] flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
    <div className="relative w-full md:w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/60 w-4 h-4" />
      <input
        type="text"
        placeholder="Search safaris, destinations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-[#080808] border border-[#2a2218] rounded-lg text-amber-100 placeholder-amber-500/40 focus:outline-none focus:border-amber-500 text-sm"
      />
    </div>
    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
      <Filter className="text-amber-500 w-4 h-4" />
      <span className="text-xs text-amber-200/60 uppercase tracking-wider">Sort By:</span>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="bg-[#080808] border border-[#2a2218] text-amber-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
      >
        <option value="default">Featured First</option>
        <option value="title">Name (A - Z)</option>
        <option value="duration">Duration (Days)</option>
      </select>
    </div>
  </div>
);

// Lightbox modal component
const LightboxModal = ({ photo, onClose }) => {
  if (!photo) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full bg-[#121212] border border-[#3a2f1d] rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/60 text-amber-400 p-2 rounded-full hover:bg-amber-500 hover:text-black transition-all">
          <X className="w-6 h-6" />
        </button>
        <img src={photo.url} alt={photo.title} className="w-full max-h-[75vh] object-cover" />
        <div className="p-6 text-center">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">{photo.park}</span>
          <h3 className="text-xl font-serif text-amber-100 mt-1">{photo.title}</h3>
        </div>
      </div>
    </div>
  );
};

// Google Translate Launcher Trigger
const GoogleTranslateWidget = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.google && window.google.translate) {
      setLoaded(true);
      return;
    }
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
        'google_translate_element'
      );
      setLoaded(true);
    };
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="relative inline-block">
      <div id="google_translate_element" className="translate-container text-xs text-amber-200"></div>
    </div>
  );
};

// ==========================================
// 4. NAVBAR & FOOTER
// ==========================================

const Navbar = ({ currentPath, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [safarisDropdown, setSafarisDropdown] = useState(false);
  const [excursionsDropdown, setExcursionsDropdown] = useState(false);
  const safarisTimer = useRef(null);
  const excursionsTimer = useRef(null);

  const handleMouseEnterSafaris = () => {
    clearTimeout(safarisTimer.current);
    setSafarisDropdown(true);
  };
  const handleMouseLeaveSafaris = () => {
    safarisTimer.current = setTimeout(() => setSafarisDropdown(false), 150);
  };

  const handleMouseEnterExcursions = () => {
    clearTimeout(excursionsTimer.current);
    setExcursionsDropdown(true);
  };
  const handleMouseLeaveExcursions = () => {
    excursionsTimer.current = setTimeout(() => setExcursionsDropdown(false), 150);
  };

  const handleNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setSafarisDropdown(false);
    setExcursionsDropdown(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-[#2a2218] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div onClick={() => handleNav('/')} className="cursor-pointer flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 flex items-center justify-center shadow-lg shadow-amber-950/50 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="font-serif text-lg md:text-xl font-bold tracking-tight text-amber-100 group-hover:text-amber-400 transition-colors block leading-tight">
              CATS CLAWS
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-medium block">
              EXPEDITION
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-amber-100/90">
          <button onClick={() => handleNav('/')} className={`hover:text-amber-400 transition-colors ${currentPath === '/' ? 'text-amber-400 font-semibold' : ''}`}>
            Home
          </button>

          {/* Kenya Safaris Dropdown */}
          <div className="relative" onMouseEnter={handleMouseEnterSafaris} onMouseLeave={handleMouseLeaveSafaris}>
            <button className={`hover:text-amber-400 transition-colors flex items-center gap-1 ${currentPath.startsWith('/safaris') ? 'text-amber-400 font-semibold' : ''}`}>
              Kenya Safaris <ChevronRight className={`w-3.5 h-3.5 transition-transform ${safarisDropdown ? 'rotate-90 text-amber-400' : ''}`} />
            </button>
            {safarisDropdown && (
              <div className="absolute top-full left-0 w-64 pt-2">
                <div className="bg-[#0f0f0f] border border-[#332a1e] rounded-xl shadow-2xl py-2 overflow-hidden backdrop-blur-xl">
                  <button onClick={() => handleNav('/safaris/nairobi')} className="w-full text-left px-4 py-2.5 hover:bg-[#1a150d] hover:text-amber-400 text-xs font-medium text-amber-100 border-b border-[#221a10]">
                    Safaris from Nairobi
                  </button>
                  <button onClick={() => handleNav('/safaris/mombasa')} className="w-full text-left px-4 py-2.5 hover:bg-[#1a150d] hover:text-amber-400 text-xs font-medium text-amber-100 border-b border-[#221a10]">
                    Safaris from Mombasa
                  </button>
                  <button onClick={() => handleNav('/safaris/flying')} className="w-full text-left px-4 py-2.5 hover:bg-[#1a150d] hover:text-amber-400 text-xs font-medium text-amber-100 border-b border-[#221a10]">
                    Flying Safaris from Nairobi
                  </button>
                  <button onClick={() => handleNav('/safaris/flying-mombasa')} className="w-full text-left px-4 py-2.5 hover:bg-[#1a150d] hover:text-amber-400 text-xs font-medium text-amber-100 border-b border-[#221a10]">
                    Flying Safaris from Mombasa
                  </button>
                  <button onClick={() => handleNav('/safaris/group')} className="w-full text-left px-4 py-2.5 hover:bg-[#1a150d] hover:text-amber-400 text-xs font-medium text-amber-100 border-b border-[#221a10]">
                    Group Safaris
                  </button>
                  <button onClick={() => handleNav('/safaris/by-road')} className="w-full text-left px-4 py-2.5 hover:bg-[#1a150d] hover:text-amber-400 text-xs font-medium text-amber-100">
                    Kenya Safaris By Road
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Excursions Dropdown */}
          <div className="relative" onMouseEnter={handleMouseEnterExcursions} onMouseLeave={handleMouseLeaveExcursions}>
            <button className={`hover:text-amber-400 transition-colors flex items-center gap-1 ${currentPath.startsWith('/excursions') ? 'text-amber-400 font-semibold' : ''}`}>
              Excursions <ChevronRight className={`w-3.5 h-3.5 transition-transform ${excursionsDropdown ? 'rotate-90 text-amber-400' : ''}`} />
            </button>
            {excursionsDropdown && (
              <div className="absolute top-full left-0 w-48 pt-2">
                <div className="bg-[#0f0f0f] border border-[#332a1e] rounded-xl shadow-2xl py-2 overflow-hidden backdrop-blur-xl">
                  <button onClick={() => handleNav('/excursions/nairobi')} className="w-full text-left px-4 py-2.5 hover:bg-[#1a150d] hover:text-amber-400 text-xs font-medium text-amber-100 border-b border-[#221a10]">
                    Nairobi Day Excursions
                  </button>
                  <button onClick={() => handleNav('/excursions/mombasa')} className="w-full text-left px-4 py-2.5 hover:bg-[#1a150d] hover:text-amber-400 text-xs font-medium text-amber-100">
                    Mombasa Day Excursions
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => handleNav('/accommodation')} className={`hover:text-amber-400 transition-colors ${currentPath.startsWith('/accommodation') ? 'text-amber-400 font-semibold' : ''}`}>
            Accommodation
          </button>
          <button onClick={() => handleNav('/destinations')} className={`hover:text-amber-400 transition-colors ${currentPath.startsWith('/destination') ? 'text-amber-400 font-semibold' : ''}`}>
            Destinations
          </button>
          <button onClick={() => handleNav('/gallery')} className={`hover:text-amber-400 transition-colors ${currentPath === '/gallery' ? 'text-amber-400 font-semibold' : ''}`}>
            Gallery
          </button>
          <button onClick={() => handleNav('/about')} className={`hover:text-amber-400 transition-colors ${currentPath === '/about' ? 'text-amber-400 font-semibold' : ''}`}>
            About
          </button>
          <button onClick={() => handleNav('/contact')} className={`hover:text-amber-400 transition-colors ${currentPath === '/contact' ? 'text-amber-400 font-semibold' : ''}`}>
            Contact
          </button>
        </div>

        {/* Right Action + Language */}
        <div className="hidden lg:flex items-center gap-4">
          <GoogleTranslateWidget />
          <button
            onClick={() => handleNav('/booking')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg shadow-amber-950/40 hover:scale-105 transition-all"
          >
            Book Now
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          <GoogleTranslateWidget />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-amber-400 hover:text-amber-200">
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-b border-[#2a2218] px-4 pt-4 pb-8 space-y-4 max-h-[85vh] overflow-y-auto">
          <button onClick={() => handleNav('/')} className="block w-full text-left py-2 text-amber-100 hover:text-amber-400 text-sm font-medium">Home</button>
          <div className="pl-2 border-l border-amber-500/30 space-y-2 py-1">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold block">Kenya Safaris</span>
            <button onClick={() => handleNav('/safaris/nairobi')} className="block w-full text-left py-1.5 text-xs text-amber-200/80 hover:text-amber-400">Safaris from Nairobi</button>
            <button onClick={() => handleNav('/safaris/mombasa')} className="block w-full text-left py-1.5 text-xs text-amber-200/80 hover:text-amber-400">Safaris from Mombasa</button>
            <button onClick={() => handleNav('/safaris/flying')} className="block w-full text-left py-1.5 text-xs text-amber-200/80 hover:text-amber-400">Flying Safaris from Nairobi</button>
            <button onClick={() => handleNav('/safaris/flying-mombasa')} className="block w-full text-left py-1.5 text-xs text-amber-200/80 hover:text-amber-400">Flying Safaris from Mombasa</button>
            <button onClick={() => handleNav('/safaris/group')} className="block w-full text-left py-1.5 text-xs text-amber-200/80 hover:text-amber-400">Group Safaris</button>
            <button onClick={() => handleNav('/safaris/by-road')} className="block w-full text-left py-1.5 text-xs text-amber-200/80 hover:text-amber-400">Kenya Safaris By Road</button>
          </div>
          <div className="pl-2 border-l border-amber-500/30 space-y-2 py-1">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold block">Day Excursions</span>
            <button onClick={() => handleNav('/excursions/nairobi')} className="block w-full text-left py-1.5 text-xs text-amber-200/80 hover:text-amber-400">Nairobi Excursions</button>
            <button onClick={() => handleNav('/excursions/mombasa')} className="block w-full text-left py-1.5 text-xs text-amber-200/80 hover:text-amber-400">Mombasa Excursions</button>
          </div>
          <button onClick={() => handleNav('/accommodation')} className="block w-full text-left py-2 text-amber-100 hover:text-amber-400 text-sm font-medium">Accommodation</button>
          <button onClick={() => handleNav('/destinations')} className="block w-full text-left py-2 text-amber-100 hover:text-amber-400 text-sm font-medium">Destinations</button>
          <button onClick={() => handleNav('/gallery')} className="block w-full text-left py-2 text-amber-100 hover:text-amber-400 text-sm font-medium">Gallery</button>
          <button onClick={() => handleNav('/about')} className="block w-full text-left py-2 text-amber-100 hover:text-amber-400 text-sm font-medium">About</button>
          <button onClick={() => handleNav('/contact')} className="block w-full text-left py-2 text-amber-100 hover:text-amber-400 text-sm font-medium">Contact</button>
          <button
            onClick={() => handleNav('/booking')}
            className="w-full text-center bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider py-3 rounded-xl mt-4"
          >
            Book Expedition Now
          </button>
        </div>
      )}
    </nav>
  );
};

const Footer = ({ navigate }) => (
  <footer className="bg-[#050505] border-t border-[#221b12] text-amber-100/70 pt-16 pb-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-serif text-xl font-bold text-amber-100">Cats Claws Expedition</span>
        </div>
        <p className="text-xs text-amber-200/60 leading-relaxed mb-6">
          Pride of the Jungles — Experience Kenya Like Never Before. Premier luxury bespoke safaris, flying expeditions, and coastal marine tours.
        </p>
        <div className="flex gap-3 text-amber-400">
          <a href="https://wa.me/254727694559" target="_blank" rel="noreferrer" className="p-2 bg-[#121212] border border-[#2a2218] rounded-full hover:bg-amber-500 hover:text-black transition-all">
            <MessageCircle className="w-4 h-4" />
          </a>
          <a href="mailto:info.catsclawsexpedition@gmail.com" className="p-2 bg-[#121212] border border-[#2a2218] rounded-full hover:bg-amber-500 hover:text-black transition-all">
            <Mail className="w-4 h-4" />
          </a>
          <a href="tel:+254102013200" className="p-2 bg-[#121212] border border-[#2a2218] rounded-full hover:bg-amber-500 hover:text-black transition-all">
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div>
        <h4 className="font-serif text-amber-400 text-sm uppercase tracking-widest font-semibold mb-4">Quick Links</h4>
        <ul className="space-y-2 text-xs">
          <li><button onClick={() => navigate('/safaris/nairobi')} className="hover:text-amber-400 transition-colors">Safaris From Nairobi</button></li>
          <li><button onClick={() => navigate('/safaris/mombasa')} className="hover:text-amber-400 transition-colors">Safaris From Mombasa</button></li>
          <li><button onClick={() => navigate('/safaris/flying')} className="hover:text-amber-400 transition-colors">Luxury Flying Safaris</button></li>
          <li><button onClick={() => navigate('/accommodation')} className="hover:text-amber-400 transition-colors">Luxury Lodges & Tented Camps</button></li>
          <li><button onClick={() => navigate('/destinations')} className="hover:text-amber-400 transition-colors">Kenya National Parks</button></li>
          <li><button onClick={() => navigate('/booking')} className="hover:text-amber-400 transition-colors">Make a Booking</button></li>
        </ul>
      </div>

      <div>
        <h4 className="font-serif text-amber-400 text-sm uppercase tracking-widest font-semibold mb-4">Headquarters</h4>
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>Diani Baazaar Shopping Center, Diani Beach, Kwale, Kenya</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-500 shrink-0" />
            <span>+254 102 013 200</span>
          </p>
          <p className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>WhatsApp: +254 727 694 559</span>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-500 shrink-0" />
            <span>info.catsclawsexpedition@gmail.com</span>
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-serif text-amber-400 text-sm uppercase tracking-widest font-semibold mb-4">Newsletter</h4>
        <p className="text-xs text-amber-200/60 mb-3">Subscribe for migration updates and seasonal safari specials.</p>
        <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing to Cats Claws Expedition updates!"); }} className="space-y-2">
          <input
            type="email"
            required
            placeholder="Enter your email address"
            className="w-full px-3 py-2 bg-[#101010] border border-[#2a2218] rounded-lg text-xs text-amber-100 placeholder-amber-500/40 focus:outline-none focus:border-amber-500"
          />
          <button type="submit" className="w-full bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider py-2 rounded-lg hover:bg-amber-400 transition-all">
            Subscribe
          </button>
        </form>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1a150e] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-amber-500/50">
      <p>© {new Date().getFullYear()} Cats Claws Expedition. All Rights Reserved. Pride of the Jungles.</p>
      <div className="flex gap-6">
        <span>Licensed Kenya Tour Operator</span>
        <span>Pesapal Secure Payments</span>
      </div>
    </div>
  </footer>
);

// Floating WhatsApp Widget
const FloatingWhatsApp = () => (
  <a
    href="https://wa.me/254727694559?text=Hello%20Cats%20Claws%20Expedition,%20I%20would%20like%20to%20inquire%20about%20a%20Kenya%20Safari."
    target="_blank"
    rel="noreferrer"
    className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle className="w-6 h-6 fill-current" />
    <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
      Chat With Safari Expert
    </span>
  </a>
);

// ==========================================
// 5. PAGE COMPONENTS
// ==========================================

// PAGE 1: HOME PAGE
const HomePage = ({ navigate }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const marqueeRef = useRef(null);

  // Auto advance slideshow every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SAFARI_PACKAGES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[650px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-black/70 z-10" />
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=80"
          alt="Cats Claws Kenya Safari"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse transition-transform duration-10000"
        />
        <div className="relative z-20 max-w-5xl mx-auto text-center px-4 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
            <span className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold">
              Cats Claws Expedition
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-amber-100 leading-tight drop-shadow-2xl">
            Pride of the Jungles
          </h1>
          <p className="text-base sm:text-xl text-amber-200/80 max-w-2xl mx-auto font-light leading-relaxed">
            Experience Kenya Like Never Before. Bespoke African luxury safaris, wild cat encounters, and endless savanna horizons.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/booking')}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold px-8 py-4 rounded-full shadow-2xl text-sm uppercase tracking-wider hover:scale-105 transition-all"
            >
              Book Expedition Now
            </button>
            <button
              onClick={() => navigate('/safaris/nairobi')}
              className="w-full sm:w-auto bg-black/60 border border-amber-500/40 hover:bg-amber-500/10 text-amber-100 font-medium px-8 py-4 rounded-full backdrop-blur-md text-sm uppercase tracking-wider transition-all"
            >
              Explore Safaris
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-70">
          <span className="text-[10px] uppercase tracking-widest text-amber-400">Scroll To Discover</span>
          <div className="w-5 h-9 border-2 border-amber-400/50 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-amber-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Featured Destinations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-2">Unrivaled Destinations</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-amber-100 font-bold">Kenya's Crown Jewels</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DESTINATIONS.slice(0, 5).map((dest, index) => {
            const isWide = index === 0;
            return (
              <div
                key={dest.slug}
                className={`group relative rounded-2xl overflow-hidden border border-[#2a2218] bg-[#0c0c0c] min-h-[320px] ${
                  isWide ? 'md:col-span-2' : ''
                }`}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                  <h3 className="font-serif text-2xl font-bold text-amber-100 mb-2">{dest.name}</h3>
                  <p className="text-xs text-amber-200/70 mb-6 max-w-lg line-clamp-2">{dest.oneLiner}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/destination/${dest.slug}`)}
                      className="bg-black/60 border border-amber-500/50 hover:bg-amber-500 hover:text-black text-amber-200 text-xs px-4 py-2 rounded-full backdrop-blur-md transition-all"
                    >
                      Learn More
                    </button>
                    <button
                      onClick={() => navigate(`/safaris-by-destination/${dest.slug}`)}
                      className="bg-amber-500 text-black hover:bg-amber-400 font-semibold text-xs px-4 py-2 rounded-full transition-all"
                    >
                      Show Safaris
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/destinations')}
            className="inline-flex items-center gap-2 text-amber-400 border-b border-amber-500/40 pb-1 hover:border-amber-400 text-sm font-semibold tracking-wider uppercase transition-all"
          >
            View More Destinations <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Top Safari Adventures 2026/27 Slideshow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#0c0c0c] border border-[#2a2218] rounded-3xl p-6 sm:p-12 relative overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-2">Flagship Journeys</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-amber-100 font-bold">Top Safari Adventures 2026/27</h2>
        </div>

        {(() => {
          const currentSlide = SAFARI_PACKAGES[slideIndex];
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#2a2218]">
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover transition-all duration-700"
                />
                <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/40 text-xs px-3 py-1.5 rounded-full font-semibold">
                  {currentSlide.duration}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-1">
                    Featured Expedition #{slideIndex + 1}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">{currentSlide.title}</h3>
                </div>
                <p className="text-sm text-amber-200/70 leading-relaxed">{currentSlide.description}</p>
                <div className="space-y-2">
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">Safari Highlights:</span>
                  <div className="flex flex-wrap gap-2">
                    {currentSlide.highlights.map((h, i) => (
                      <span key={i} className="bg-[#18140f] border border-[#302619] text-amber-200/90 text-xs px-3 py-1 rounded-md">
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => navigate(`/safari/${currentSlide.id}`)}
                    className="bg-amber-500 text-black font-semibold px-6 py-3 rounded-full hover:bg-amber-400 transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    View Safari Itinerary <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Slideshow Dots Pagination */}
        <div className="flex justify-center items-center gap-3 mt-8">
          {SAFARI_PACKAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSlideIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                slideIndex === idx ? 'w-8 bg-amber-500' : 'w-2.5 bg-amber-900/50 hover:bg-amber-700'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gradient-to-b from-[#0a0a0a] via-[#120f0b] to-[#0a0a0a] py-16 border-y border-[#2a2218]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-2">Our Advantage</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-amber-100 font-bold">Why Choose Cats Claws Expedition</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#0e0c09] border border-[#261f14] p-6 rounded-2xl hover:border-amber-500/40 transition-all text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-amber-100 font-bold">Expert Local Guides</h3>
              <p className="text-xs text-amber-200/60 leading-relaxed">Born & raised naturalists with decades of bush tracking expertise and deep Maasai cultural heritage.</p>
            </div>

            <div className="bg-[#0e0c09] border border-[#261f14] p-6 rounded-2xl hover:border-amber-500/40 transition-all text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-amber-100 font-bold">Safety & Comfort First</h3>
              <p className="text-xs text-amber-200/60 leading-relaxed">Custom 4x4 Land Cruisers with popup roofs, unlimited mineral water, long-range radios, and AMREF air cover.</p>
            </div>

            <div className="bg-[#0e0c09] border border-[#261f14] p-6 rounded-2xl hover:border-amber-500/40 transition-all text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-amber-100 font-bold">Tailor-Made Safaris</h3>
              <p className="text-xs text-amber-200/60 leading-relaxed">100% customizable journeys tailored precisely to your schedule, budget, photographer goals, or family needs.</p>
            </div>

            <div className="bg-[#0e0c09] border border-[#261f14] p-6 rounded-2xl hover:border-amber-500/40 transition-all text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-amber-100 font-bold">Unforgettable Moments</h3>
              <p className="text-xs text-amber-200/60 leading-relaxed">Private bush breakfasts, hot air balloon flights over the Mara, and sunset sundowners on Kwale beaches.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stay in Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-[#2a2218] aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80"
              alt="Safari Lodge Accommodation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block mb-1">Luxury Accommodations</span>
              <p className="text-xl font-serif text-amber-100">Hand-picked wilderness lodges & luxury tented camps</p>
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block">Bespoke Hospitality</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-amber-100 font-bold">Stay in Style Across the Wild</h2>
            <p className="text-sm text-amber-200/70 leading-relaxed">
              We partner with Kenya's premier eco-lodges, high-end tented safari camps, and coastal luxury beach resorts to ensure your resting hours are as magnificent as your game drives.
            </p>

            <div className="space-y-4">
              <div className="bg-[#0e0c09] p-4 rounded-xl border border-[#221b12]">
                <h4 className="text-amber-400 font-bold text-sm mb-1">Ultra Luxury Tented Suites</h4>
                <p className="text-xs text-amber-200/60">Canvas pavilions with king beds, private plunge pools, and uninterrupted savanna panoramas.</p>
              </div>
              <div className="bg-[#0e0c09] p-4 rounded-xl border border-[#221b12]">
                <h4 className="text-amber-400 font-bold text-sm mb-1">Mid-Range Eco Lodges</h4>
                <p className="text-xs text-amber-200/60">Comfortable stone lodges with swimming pools, waterholes, and outstanding dining.</p>
              </div>
              <div className="bg-[#0e0c09] p-4 rounded-xl border border-[#221b12]">
                <h4 className="text-amber-400 font-bold text-sm mb-1">Budget Bush Camps</h4>
                <p className="text-xs text-amber-200/60">Clean, secure, and authentic rustic camping options without sacrificing safety.</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/accommodation')}
              className="bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-amber-400 transition-all inline-block"
            >
              Plan Your Stay
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section className="bg-[#080808] border-y border-[#221b12] py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <p className="text-sm font-semibold text-amber-200">
            Rated 4.9 / 5 Stars on <a href="https://google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Google Reviews</a>
          </p>
          <h2 className="font-serif text-3xl font-bold text-amber-100 mt-2">What Our Guests Say</h2>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
              <div key={idx} className="w-80 sm:w-96 bg-[#120f0b] border border-[#2c2317] p-6 rounded-2xl shrink-0 space-y-4">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-amber-100/80 italic leading-relaxed">"{t.quote}"</p>
                <div className="border-t border-[#221a10] pt-3 flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-400">{t.author}</span>
                  <span className="text-amber-200/50">{t.origin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-[#302619] bg-[#120e0a] p-10 sm:p-16 text-center space-y-6">
          <img
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80"
            alt="Safari Sunset CTA"
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block relative z-10">Start Planning Today</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100 relative z-10 max-w-2xl mx-auto">
            Ready for Your Kenya Safari Adventure?
          </h2>
          <p className="text-sm text-amber-200/80 max-w-xl mx-auto relative z-10 leading-relaxed">
            Contact our safari design experts now for a tailored quote. We turn African wilderness dreams into extraordinary reality.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 pt-4">
            <button
              onClick={() => navigate('/booking')}
              className="bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider px-8 py-4 rounded-full hover:bg-amber-400 transition-all shadow-xl"
            >
              Book Your Expedition
            </button>
            <a
              href="https://wa.me/254727694559"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 text-white font-semibold text-xs uppercase tracking-wider px-8 py-4 rounded-full hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" /> Instant WhatsApp Quote
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// PAGE 2: SAFARI LISTINGS PAGE (/safaris/:origin)
const SafarisPage = ({ origin, navigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const titles = {
    nairobi: "Safaris Departing From Nairobi",
    mombasa: "Safaris Departing From Mombasa & Diani",
    flying: "Luxury Flying Safaris From Nairobi",
    "flying-mombasa": "Flying Safaris From Mombasa / Diani",
    group: "Kenya Small Group Joiner Safaris",
    "by-road": "Kenya 4x4 Overland Safaris By Road"
  };

  const filteredSafaris = useMemo(() => {
    let list = SAFARI_PACKAGES.filter((s) => {
      if (origin && s.origin !== origin) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      }
      return true;
    });

    if (sortBy === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "duration") {
      list.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    }
    return list;
  }, [origin, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#2a2218] pb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-1">
          Bespoke Packages
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
          {titles[origin] || "Kenya Safaris & Expeditions"}
        </h1>
      </div>

      <SearchSortBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} sortBy={sortBy} setSortBy={setSortBy} />

      {filteredSafaris.length === 0 ? (
        <div className="text-center py-16 bg-[#101010] border border-[#2a2218] rounded-2xl">
          <p className="text-amber-200/70 text-sm">No safari packages matched your filter criteria.</p>
          <button onClick={() => { setSearchQuery(""); setSortBy("default"); }} className="mt-4 text-xs text-amber-400 underline">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSafaris.map((safari) => (
            <div
              key={safari.id}
              className="bg-[#0e0c0a] border border-[#261f15] rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={safari.image}
                  alt={safari.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/40 text-[11px] px-3 py-1 rounded-full font-semibold">
                  {safari.duration}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-amber-100 mb-2 group-hover:text-amber-400 transition-colors">
                    {safari.title}
                  </h3>
                  <p className="text-xs text-amber-200/60 line-clamp-3 leading-relaxed mb-4">
                    {safari.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {safari.highlights.slice(0, 3).map((h, i) => (
                      <span key={i} className="text-[10px] bg-[#1a140d] border border-[#332819] text-amber-300 px-2.5 py-1 rounded">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#20180f] flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/safari/${safari.id}`)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider py-2.5 rounded-lg transition-all text-center"
                  >
                    View Itinerary & Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// PAGE 3: SAFARI DETAIL PAGE (/safari/:id)
const SafariDetailPage = ({ id, navigate }) => {
  const safari = SAFARI_PACKAGES.find((s) => s.id === id) || SAFARI_PACKAGES[0];

  const currentIndex = SAFARI_PACKAGES.findIndex((s) => s.id === safari.id);
  const prevSafari = SAFARI_PACKAGES[(currentIndex - 1 + SAFARI_PACKAGES.length) % SAFARI_PACKAGES.length];
  const nextSafari = SAFARI_PACKAGES[(currentIndex + 1) % SAFARI_PACKAGES.length];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/safaris/nairobi')}
          className="text-amber-400 hover:text-amber-200 text-xs uppercase tracking-wider font-semibold flex items-center gap-1"
        >
          ← Back to Safaris Overview
        </button>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-[#2a2218] bg-[#0c0c0c] p-6 sm:p-12">
        <img
          src={safari.image}
          alt={safari.title}
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
        />
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-block bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {safari.duration}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">{safari.title}</h1>
          <p className="text-sm sm:text-base text-amber-200/80 leading-relaxed">{safari.description}</p>
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div className="space-y-6">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block">Day-By-Day Plan</span>
        <h2 className="font-serif text-2xl sm:text-3xl text-amber-100 font-bold">Detailed Itinerary</h2>

        <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 sm:before:left-6 before:w-0.5 before:bg-[#2e2417]">
          {safari.itinerary.map((item) => (
            <div key={item.day} className="relative pl-10 sm:pl-14 space-y-3">
              <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-amber-500 border-4 border-[#0a0a0a] text-black font-bold text-xs flex items-center justify-center">
                {item.day}
              </div>
              <div className="bg-[#0e0c0a] border border-[#261f15] p-6 rounded-2xl space-y-3">
                <h3 className="font-serif text-lg font-bold text-amber-100">
                  Day {item.day}: {item.title}
                </h3>
                <p className="text-xs text-amber-200/70 leading-relaxed">{item.description}</p>
                {item.image && (
                  <div className="mt-3 rounded-xl overflow-hidden max-h-60">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inclusions & Exclusions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0b100c] border border-emerald-900/40 p-6 rounded-2xl space-y-4">
          <h3 className="font-serif text-lg text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> What Is Included
          </h3>
          <ul className="space-y-2 text-xs text-amber-100/80">
            {safari.inclusions.map((inc, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{inc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#120b0b] border border-rose-900/40 p-6 rounded-2xl space-y-4">
          <h3 className="font-serif text-lg text-rose-400 font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> What Is Excluded
          </h3>
          <ul className="space-y-2 text-xs text-amber-100/80">
            {safari.exclusions.map((exc, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>{exc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lodges by Destination Row */}
      <div className="bg-[#0e0c0a] border border-[#261f15] p-6 rounded-2xl space-y-4">
        <h3 className="font-serif text-lg text-amber-100 font-bold">Featured Lodges For This Safari</h3>
        <p className="text-xs text-amber-200/60">Explore accommodation partners in destinations covered on this safari:</p>
        <div className="flex flex-wrap gap-3">
          {DESTINATIONS.map((d) => (
            <button
              key={d.slug}
              onClick={() => navigate(`/accommodation/${d.slug}`)}
              className="bg-[#1a140d] border border-[#332819] text-amber-300 hover:bg-amber-500 hover:text-black text-xs px-4 py-2 rounded-lg transition-all"
            >
              Lodges in {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Prev / Next Navigation */}
      <div className="flex justify-between items-center border-t border-[#20180f] pt-8">
        <button
          onClick={() => navigate(`/safari/${prevSafari.id}`)}
          className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Previous: {prevSafari.title}
        </button>
        <button
          onClick={() => navigate(`/safari/${nextSafari.id}`)}
          className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
        >
          Next: {nextSafari.title} <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* CTA Booking Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-black p-8 sm:p-12 rounded-3xl text-center space-y-4">
        <h2 className="font-serif text-2xl sm:text-4xl font-bold">Reserve Your Seat On This Safari</h2>
        <p className="text-xs sm:text-sm font-medium max-w-lg mx-auto text-black/80">
          Lock in your preferred travel dates with Cats Claws Expedition today.
        </p>
        <button
          onClick={() => navigate(`/booking?safari=${safari.id}`)}
          className="bg-black text-amber-400 hover:bg-neutral-900 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full transition-all"
        >
          Proceed to Booking Form
        </button>
      </div>
    </div>
  );
};

// PAGE 4: EXCURSIONS PAGE (/excursions/:location)
const ExcursionsPage = ({ location, navigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const items = EXCURSIONS[location] || EXCURSIONS.nairobi;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#2a2218] pb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-1">Day Trips & Tours</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100 capitalize">
          {location} Day Excursions
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((ex) => (
          <div key={ex.id} className="bg-[#0e0c0a] border border-[#261f15] rounded-2xl overflow-hidden flex flex-col group">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={ex.image} alt={ex.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-amber-400 text-xs px-3 py-1 rounded-full font-semibold">
                {ex.duration}
              </span>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-amber-100 mb-2">{ex.title}</h3>
                <p className="text-xs text-amber-200/60 leading-relaxed mb-4">{ex.description}</p>
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">Highlights:</span>
                  <ul className="text-xs text-amber-200/80 space-y-1">
                    {ex.highlights.map((h, i) => (
                      <li key={i}>• {h}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => navigate(`/booking?safari=${ex.id}`)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider py-2.5 rounded-lg transition-all"
              >
                Book Excursion
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// PAGE 5: DESTINATIONS INDEX & DETAIL & SAFARIS BY DESTINATION
const DestinationsPage = ({ navigate }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
    <div className="border-b border-[#2a2218] pb-6">
      <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-1">Explore Kenya</span>
      <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">National Parks & Destinations</h1>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {DESTINATIONS.map((d) => (
        <div key={d.slug} className="bg-[#0e0c0a] border border-[#261f15] rounded-2xl overflow-hidden group">
          <div className="relative aspect-[16/10] overflow-hidden">
            <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-amber-100">{d.name}</h3>
            <p className="text-xs text-amber-200/60 leading-relaxed">{d.oneLiner}</p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/destination/${d.slug}`)}
                className="flex-1 bg-black/60 border border-amber-500/40 text-amber-200 text-xs py-2 rounded-lg hover:bg-amber-500 hover:text-black transition-all"
              >
                Learn More
              </button>
              <button
                onClick={() => navigate(`/safaris-by-destination/${d.slug}`)}
                className="flex-1 bg-amber-500 text-black font-semibold text-xs py-2 rounded-lg hover:bg-amber-400 transition-all"
              >
                Show Safaris
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DestinationDetailPage = ({ slug, navigate }) => {
  const dest = DESTINATIONS.find((d) => d.slug === slug) || DESTINATIONS[0];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <button onClick={() => navigate('/destinations')} className="text-amber-400 hover:underline text-xs font-semibold uppercase tracking-wider">
        ← Back to All Destinations
      </button>

      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] border border-[#2a2218]">
        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Kenya Destination Guide</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">{dest.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-2xl text-amber-100 font-bold">Park Overview</h2>
          <p className="text-sm text-amber-200/80 leading-relaxed">{dest.overview}</p>

          <h3 className="font-serif text-xl text-amber-100 font-bold">Key Wildlife Species</h3>
          <div className="flex flex-wrap gap-2">
            {dest.wildlife.map((animal, i) => (
              <span key={i} className="bg-[#18140f] border border-[#302619] text-amber-300 text-xs px-3 py-1.5 rounded-lg">
                🐘 {animal}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#0e0c0a] border border-[#261f15] p-6 rounded-2xl space-y-4 h-fit">
          <h3 className="font-serif text-lg text-amber-400 font-bold">Travel Advice</h3>
          <div>
            <span className="text-xs text-amber-500 font-bold uppercase block">Best Time to Visit:</span>
            <p className="text-xs text-amber-100/80 mt-1">{dest.bestTime}</p>
          </div>
          <button
            onClick={() => navigate(`/safaris-by-destination/${dest.slug}`)}
            className="w-full bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider py-3 rounded-lg hover:bg-amber-400 transition-all mt-4"
          >
            Show Safaris Visiting {dest.name}
          </button>
        </div>
      </div>
    </div>
  );
};

const SafarisByDestinationPage = ({ slug, navigate }) => {
  const dest = DESTINATIONS.find((d) => d.slug === slug);
  const destName = dest ? dest.name : slug;

  const matches = SAFARI_PACKAGES.filter(
    (s) =>
      s.title.toLowerCase().includes(slug.replace('-', ' ')) ||
      s.description.toLowerCase().includes(slug.replace('-', ' ')) ||
      s.itinerary.some((it) => it.description.toLowerCase().includes(slug.replace('-', ' ')))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#2a2218] pb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-1">Filtered Expedition Search</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
          Safaris Visiting {destName}
        </h1>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 bg-[#101010] border border-[#2a2218] rounded-2xl">
          <p className="text-amber-200/70 text-sm">All our customized itineraries cover {destName} on request!</p>
          <button onClick={() => navigate('/booking')} className="mt-4 bg-amber-500 text-black text-xs font-semibold px-6 py-2 rounded-full">
            Request Custom Safari
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {matches.map((safari) => (
            <div key={safari.id} className="bg-[#0e0c0a] border border-[#261f15] rounded-2xl overflow-hidden flex flex-col">
              <img src={safari.image} alt={safari.title} className="aspect-[16/10] object-cover" />
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-amber-100">{safari.title}</h3>
                  <p className="text-xs text-amber-200/60 line-clamp-3 mt-2">{safari.description}</p>
                </div>
                <button
                  onClick={() => navigate(`/safari/${safari.id}`)}
                  className="w-full bg-amber-500 text-black font-semibold text-xs py-2.5 rounded-lg hover:bg-amber-400"
                >
                  View Itinerary
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// PAGE 6: ACCOMMODATION PAGES (/accommodation and /accommodation/:slug)
const AccommodationIndexPage = ({ navigate }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
    <div className="border-b border-[#2a2218] pb-6">
      <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-1">Luxury Living</span>
      <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">Lodge Categories</h1>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {ACCOMMODATION_CATEGORIES.map((cat) => (
        <div key={cat.slug} className="bg-[#0e0c0a] border border-[#261f15] p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-amber-100 mb-2">{cat.name}</h3>
            <p className="text-xs text-amber-200/60 leading-relaxed mb-4">{cat.description}</p>
            <div className="space-y-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase">Sample Properties:</span>
              <ul className="text-xs text-amber-200/80 space-y-1">
                {cat.lodges.map((l, i) => (
                  <li key={i}>• {l.name}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => navigate(`/accommodation/${cat.slug}`)}
            className="w-full bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider py-2.5 rounded-lg hover:bg-amber-400 transition-all mt-4"
          >
            Explore Lodges
          </button>
        </div>
      ))}
    </div>
  </div>
);

const AccommodationDetailPage = ({ slug, navigate }) => {
  const cat = ACCOMMODATION_CATEGORIES.find((c) => c.slug === slug) || ACCOMMODATION_CATEGORIES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <button onClick={() => navigate('/accommodation')} className="text-amber-400 hover:underline text-xs font-semibold uppercase tracking-wider">
        ← Back to Categories
      </button>

      <div className="border-b border-[#2a2218] pb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-1">Accommodation Directory</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">{cat.name}</h1>
        <p className="text-sm text-amber-200/70 mt-2">{cat.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cat.lodges.map((lodge, idx) => (
          <div key={idx} className="bg-[#0e0c0a] border border-[#261f15] p-6 rounded-2xl space-y-3">
            <h3 className="font-serif text-xl font-bold text-amber-100">{lodge.name}</h3>
            <p className="text-xs text-amber-200/70 leading-relaxed">{lodge.description}</p>
            <button
              onClick={() => navigate('/booking')}
              className="text-amber-400 hover:text-amber-200 text-xs font-semibold uppercase tracking-wider block pt-2"
            >
              Inquire Booking For This Lodge →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// PAGE 7: GALLERY PAGE (/gallery)
const GalleryPage = () => {
  const [selectedPark, setSelectedPark] = useState("All");
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const parks = ["All", "Masai Mara", "Amboseli", "Tsavo", "Samburu", "Lake Naivasha", "Diani Beach"];

  const filteredPhotos = selectedPark === "All" ? GALLERY_PHOTOS : GALLERY_PHOTOS.filter((p) => p.park === selectedPark);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="border-b border-[#2a2218] pb-6 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-1">Visual Anthology</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">Safari Moments Gallery</h1>
      </div>

      {/* Park Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {parks.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPark(p)}
            className={`text-xs px-4 py-2 rounded-full border transition-all ${
              selectedPark === p
                ? 'bg-amber-500 text-black border-amber-500 font-bold'
                : 'bg-[#101010] text-amber-200/70 border-[#2a2218] hover:border-amber-500/40'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredPhotos.map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setLightboxPhoto(photo)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#2a2218] cursor-pointer"
          >
            <img src={photo.url} alt={photo.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <span className="text-[10px] text-amber-400 font-bold uppercase">{photo.park}</span>
              <p className="text-sm font-serif text-amber-100">{photo.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Client Moments Section */}
      <div className="bg-[#0c0c0c] border border-[#2a2218] rounded-3xl p-8 text-center space-y-6">
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <Instagram className="w-6 h-6" />
          <span className="font-serif text-xl font-bold text-amber-100">Clients Moments & Memories</span>
        </div>
        <p className="text-xs text-amber-200/60 max-w-lg mx-auto">
          Tag @CatsClawsExpedition in your safari photos on Instagram to be featured in our official guest hall of fame!
        </p>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 transition-all"
        >
          Follow Us On Instagram
        </a>
      </div>

      <LightboxModal photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  );
};

// PAGE 8: ABOUT PAGE (/about)
const AboutPage = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
    <div className="border-b border-[#2a2218] pb-6 text-center max-w-3xl mx-auto space-y-3">
      <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block">Our Heritage</span>
      <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">About Cats Claws Expedition</h1>
      <p className="text-sm text-amber-200/70 leading-relaxed">
        Founded on deep respect for Kenyan wildlife, indigenous Maasai wisdom, and seamless safari craftsmanship.
      </p>
    </div>

    {/* Story */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-4">
        <h2 className="font-serif text-2xl sm:text-3xl text-amber-100 font-bold">Pride of the Jungles</h2>
        <p className="text-xs sm:text-sm text-amber-200/70 leading-relaxed">
          Cats Claws Expedition was established to redefine how international travellers experience the raw beauty of Kenya. Derived from our deep love for wild big cats—the lion, leopard, and cheetah—our name symbolizes acute wilderness precision, stealth, and supreme elegance.
        </p>
        <p className="text-xs sm:text-sm text-amber-200/70 leading-relaxed">
          Headquartered in Kwale Diani Beach with operational bases in Nairobi, we curate private overlands, high-flying airstrip transfers, and coastal marine adventures with absolute attention to detail.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[#2a2218] aspect-[4/3]">
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80"
          alt="Kenyan Savanna Lion"
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    {/* Team Cards */}
    <div className="space-y-8">
      <div className="text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-1">Expedition Leaders</span>
        <h2 className="font-serif text-3xl font-bold text-amber-100">Meet Our Key Leadership</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {TEAM_MEMBERS.map((member, idx) => (
          <div key={idx} className="bg-[#0e0c0a] border border-[#261f15] rounded-2xl overflow-hidden text-center p-6 space-y-4">
            <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-amber-500/50" />
            <div>
              <h3 className="font-serif text-xl font-bold text-amber-100">{member.name}</h3>
              <span className="text-xs text-amber-500 font-semibold uppercase">{member.title}</span>
            </div>
            <p className="text-xs text-amber-200/60 leading-relaxed">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// PAGE 9: CONTACT PAGE (/contact)
const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="border-b border-[#2a2218] pb-6 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-1">Get In Touch</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">Contact Expedition Team</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="bg-[#0e0c0a] border border-[#261f15] p-8 rounded-3xl space-y-6">
          <h2 className="font-serif text-2xl text-amber-100 font-bold">Official Headquarters</h2>
          <div className="space-y-4 text-xs text-amber-200/80">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-100 block text-sm">Physical Address</span>
                <p>Diani Baazaar Shopping Center, Diani Beach, Kwale County, Kenya</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-100 block text-sm">Direct Phone Line</span>
                <p>+254 102 013 200</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-100 block text-sm">WhatsApp Safari Line</span>
                <p>+254 727 694 559</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-100 block text-sm">Official Email</span>
                <p>info.catsclawsexpedition@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#20180f]">
            <a
              href="https://wa.me/254727694559"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" /> Open WhatsApp Live Chat
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#0e0c0a] border border-[#261f15] p-8 rounded-3xl space-y-6">
          <h2 className="font-serif text-2xl text-amber-100 font-bold">Send An Inquiry</h2>
          {submitted ? (
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-emerald-200">Message Received!</h3>
              <p className="text-xs text-emerald-300/80">Our safari specialist will reply within 2 hours.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4 text-xs">
              <div>
                <label className="text-amber-300 font-semibold mb-1 block">Your Name</label>
                <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-[#101010] border border-[#2a2218] rounded-xl text-amber-100 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-amber-300 font-semibold mb-1 block">Email Address</label>
                <input required type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-[#101010] border border-[#2a2218] rounded-xl text-amber-100 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-amber-300 font-semibold mb-1 block">Message / Inquiry Details</label>
                <textarea required rows={4} placeholder="Tell us about your dates, group size, and favorite wildlife..." className="w-full px-4 py-3 bg-[#101010] border border-[#2a2218] rounded-xl text-amber-100 focus:outline-none focus:border-amber-500" />
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold uppercase tracking-wider py-3 rounded-xl transition-all">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// PAGE 10: BOOKING PAGE (/booking)
const BookingPage = () => {
  const [params, setParams] = useState({ safari: "" });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || window.location.hash.split('?')[1] || '';
      const urlParams = new URLSearchParams(search);
      setParams({ safari: urlParams.get('safari') || "" });
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    people: 2,
    packageId: params.safari || SAFARI_PACKAGES[0].id,
    travelDate: "",
    pricePerPerson: 450
  });

  const [step, setStep] = useState(1);
  const paymentPanelRef = useRef(null);

  useEffect(() => {
    if (params.safari) {
      setFormData((prev) => ({ ...prev, packageId: params.safari }));
    }
  }, [params.safari]);

  const totalAmount = useMemo(() => {
    return (formData.people || 1) * (formData.pricePerPerson || 0);
  }, [formData.people, formData.pricePerPerson]);

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    if (totalAmount <= 0) {
      alert("Please enter a valid guest count and price per person.");
      return;
    }
    setStep(2);
    setTimeout(() => {
      paymentPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const selectedPkg = SAFARI_PACKAGES.find((s) => s.id === formData.packageId) || SAFARI_PACKAGES[0];

  const whatsappConfirmationText = encodeURIComponent(
    `Hello Cats Claws Expedition,\nI have submitted a booking confirmation.\n\nName: ${formData.name}\nPackage: ${selectedPkg.title}\nGuests: ${formData.people}\nDate: ${formData.travelDate}\nTotal Amount: $${totalAmount} USD`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="border-b border-[#2a2218] pb-6 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block mb-1">Reservation Portal</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">Safari Booking & Checkout</h1>
      </div>

      {/* STEP 1 FORM */}
      <div className="bg-[#0e0c0a] border border-[#261f15] p-6 sm:p-10 rounded-3xl space-y-6">
        <h2 className="font-serif text-2xl text-amber-100 font-bold border-b border-[#20180f] pb-3">
          Step 1 — Traveler & Package Selection
        </h2>

        <form onSubmit={handleSubmitStep1} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-amber-300 font-semibold mb-1 block">Full Name</label>
              <input
                required
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#101010] border border-[#2a2218] rounded-xl text-amber-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-amber-300 font-semibold mb-1 block">Email Address</label>
              <input
                required
                type="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#101010] border border-[#2a2218] rounded-xl text-amber-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-amber-300 font-semibold mb-1 block">Phone Number (With Country Code)</label>
              <input
                required
                type="tel"
                placeholder="+1 555 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[#101010] border border-[#2a2218] rounded-xl text-amber-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-amber-300 font-semibold mb-1 block">Target Travel Date</label>
              <input
                required
                type="date"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className="w-full px-4 py-3 bg-[#101010] border border-[#2a2218] rounded-xl text-amber-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-amber-300 font-semibold mb-1 block">Select Safari Package / Excursion</label>
            <select
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              className="w-full px-4 py-3 bg-[#101010] border border-[#2a2218] rounded-xl text-amber-100 focus:outline-none focus:border-amber-500 text-xs"
            >
              <optgroup label="Safari Expeditions">
                {SAFARI_PACKAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.title} ({s.duration})</option>
                ))}
              </optgroup>
              <optgroup label="Nairobi Excursions">
                {EXCURSIONS.nairobi.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.title}</option>
                ))}
              </optgroup>
              <optgroup label="Mombasa Excursions">
                {EXCURSIONS.mombasa.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.title}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-amber-300 font-semibold mb-1 block">Number of Guests</label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.people}
                onChange={(e) => setFormData({ ...formData, people: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-[#101010] border border-[#2a2218] rounded-xl text-amber-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-amber-300 font-semibold mb-1 block">Quoted Price Per Person (USD $)</label>
              <input
                type="number"
                min="50"
                value={formData.pricePerPerson}
                onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-[#101010] border border-[#2a2218] rounded-xl text-amber-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Auto Calculation Panel */}
          <div className="bg-[#18120b] border border-[#332819] p-4 rounded-xl flex items-center justify-between">
            <span className="text-amber-300 font-semibold">Total Estimated Amount:</span>
            <span className="text-2xl font-serif font-bold text-amber-400">${totalAmount} USD</span>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold uppercase tracking-wider py-3.5 rounded-xl transition-all text-xs"
          >
            Confirm Details & Proceed To Secure Payment
          </button>
        </form>
      </div>

      {/* STEP 2 PANEL */}
      {step === 2 && (
        <div ref={paymentPanelRef} className="bg-[#0e0c0a] border border-amber-500/50 p-6 sm:p-10 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 text-emerald-400 border-b border-[#20180f] pb-3">
            <CheckCircle className="w-6 h-6" />
            <h2 className="font-serif text-2xl font-bold text-amber-100">Step 2 — Secure Payment Portal</h2>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-[#2a2218] text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-amber-200/60">Booking Name:</span>
              <span className="text-amber-100 font-bold">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-200/60">Selected Package:</span>
              <span className="text-amber-100 font-bold">{selectedPkg.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-200/60">Total Payable:</span>
              <span className="text-amber-400 font-bold text-base">${totalAmount} USD</span>
            </div>
          </div>

          {/* Pesapal Embed Panel */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block">Pesapal Integrated Gateway</span>
            <div className="w-full overflow-hidden bg-white/5 border border-amber-500/30 rounded-xl p-4 flex justify-center items-center min-h-[80px]">
              <iframe
                width="200"
                height="40"
                src="https://store.pesapal.com/embed-code?pageUrl=https://store.pesapal.com/paymentstocatsclawsexpeditions"
                frameBorder="0"
                allowFullScreen
                title="Pesapal Checkout Embed"
                className="max-w-full"
              ></iframe>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href="https://store.pesapal.com/paymentstocatsclawsexpeditions"
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider py-3 rounded-xl text-center transition-all flex items-center justify-center gap-2"
            >
              Direct Pesapal Payment Link <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={`https://wa.me/254727694559?text=${whatsappConfirmationText}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider py-3 rounded-xl text-center transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" /> Send Payment Receipt On WhatsApp
            </a>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-amber-400/60 hover:text-amber-400 underline"
            >
              ← Edit Booking Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// PAGE 11: NOT FOUND 404
const NotFoundPage = ({ navigate }) => (
  <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
    <Compass className="w-16 h-16 text-amber-500 mx-auto animate-spin" />
    <h1 className="font-serif text-3xl font-bold text-amber-100">404 — Page Not Found</h1>
    <p className="text-xs text-amber-200/60">The wild path you are looking for has been overgrown.</p>
    <button onClick={() => navigate('/')} className="bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full">
      Return To Homepage
    </button>
  </div>
);

// ==========================================
// 6. MAIN APPLICATION COMPONENT WITH ROUTER
// ==========================================

export default function App() {
  const [currentPath, setCurrentPath] = useState("/");

  // Hash-based simple router sync
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  // SEO JSON-LD Injection
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "Cats Claws Expedition",
      "alternateName": "Cats Claws Kenya Safaris",
      "url": "https://catsclawsexpedition.com",
      "telephone": "+254102013200",
      "email": "info.catsclawsexpedition@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Diani Baazaar Shopping Center",
        "addressLocality": "Diani Beach",
        "addressRegion": "Kwale",
        "addressCountry": "KE"
      },
      "description": "Kenya safari tour operator offering custom luxury safari packages, flying safaris, and day excursions."
    };

    let scriptTag = document.getElementById('jsonld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'jsonld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schema);
  }, []);

  // Simple Pattern Route Matching
  const renderRoute = () => {
    const cleanPath = currentPath.split('?')[0];

    if (cleanPath === '/' || cleanPath === '') {
      return <HomePage navigate={navigate} />;
    }

    if (cleanPath.startsWith('/safaris/')) {
      const origin = cleanPath.replace('/safaris/', '');
      return <SafarisPage origin={origin} navigate={navigate} />;
    }

    if (cleanPath.startsWith('/safari/')) {
      const id = cleanPath.replace('/safari/', '');
      return <SafariDetailPage id={id} navigate={navigate} />;
    }

    if (cleanPath.startsWith('/excursions/')) {
      const loc = cleanPath.replace('/excursions/', '');
      return <ExcursionsPage location={loc} navigate={navigate} />;
    }

    if (cleanPath === '/destinations') {
      return <DestinationsPage navigate={navigate} />;
    }

    if (cleanPath.startsWith('/destination/')) {
      const slug = cleanPath.replace('/destination/', '');
      return <DestinationDetailPage slug={slug} navigate={navigate} />;
    }

    if (cleanPath.startsWith('/safaris-by-destination/')) {
      const slug = cleanPath.replace('/safaris-by-destination/', '');
      return <SafarisByDestinationPage slug={slug} navigate={navigate} />;
    }

    if (cleanPath === '/accommodation') {
      return <AccommodationIndexPage navigate={navigate} />;
    }

    if (cleanPath.startsWith('/accommodation/')) {
      const slug = cleanPath.replace('/accommodation/', '');
      return <AccommodationDetailPage slug={slug} navigate={navigate} />;
    }

    if (cleanPath === '/gallery') {
      return <GalleryPage />;
    }

    if (cleanPath === '/about') {
      return <AboutPage />;
    }

    if (cleanPath === '/contact') {
      return <ContactPage />;
    }

    if (cleanPath === '/booking') {
      return <BookingPage />;
    }

    return <NotFoundPage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-[#040404] text-amber-100 font-sans antialiased selection:bg-amber-500 selection:text-black">
      {/* CSS Animations & Custom Styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          background-color: #040404;
        }
        
        h1, h2, h3, h4, .font-serif {
          font-family: 'Playfair Display', serif;
        }

        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 35s linear infinite;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #080808;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2014;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #d4af37;
        }
      `}</style>

      <ScrollToTop currentPath={currentPath} />

      <Layout currentPath={currentPath} navigate={navigate}>
        {renderRoute()}
      </Layout>
    </div>
  );
}

// Layout Wrapper Component
const Layout = ({ children, currentPath, navigate }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar currentPath={currentPath} navigate={navigate} />
    <main className="flex-1 pt-20">
      {children}
    </main>
    <Footer navigate={navigate} />
    <FloatingWhatsApp />
  </div>
);