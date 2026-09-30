import { pinSlots } from './_pin-lib.mjs';

await pinSlots('entryway', [
  { rank: 1, label: 'Shoe Rack', queries: ['entryway shoe rack bench', 'shoe bench with storage entryway', 'narrow shoe rack for entryway'], maxPrice: 60, must: [/shoe/i], prefer: [/entryway|shoe.?rack|shoe.?bench/i], exclude: [/closet.?only.?tiny/i] },
  { rank: 2, label: 'Coat Rack', queries: ['wall mounted coat rack hooks entryway', 'freestanding coat rack hall tree', 'entryway coat hook rack wall'], maxPrice: 45, must: [/coat|hook|rack/i], prefer: [/coat.?rack|coat.?hook|hall.?tree|entryway/i], exclude: [/bike.?rack/i] },
  { rank: 3, label: 'Key Holder', queries: ['wall key holder with shelf mail', 'key holder hook rack entryway', 'magnetic key holder wall mount'], maxPrice: 25, must: [/key/i], prefer: [/key.?holder|key.?hook|key.?rack/i], exclude: [/keyboard/i] },
  { rank: 4, label: 'Mail Organizer', queries: ['wall mail organizer key holder', 'entryway mail holder wall mount', 'mail sorter wall organizer'], maxPrice: 30, must: [/mail/i], prefer: [/mail.?organizer|mail.?holder|mail.?sorter/i], exclude: [/mailbox.?outdoor/i] },
  { rank: 5, label: 'Umbrella Stand', queries: ['umbrella stand holder entryway', 'umbrella holder metal drip tray', 'entryway umbrella stand rack'], maxPrice: 35, must: [/umbrella/i], prefer: [/umbrella.?stand|umbrella.?holder/i], exclude: [/patio.?umbrella/i] },
  { rank: 6, label: 'Boot Tray', queries: ['boot tray entryway waterproof', 'shoe drip tray mudroom', 'boot mat tray entryway'], maxPrice: 25, must: [/tray|mat/i], prefer: [/boot.?tray|shoe.?tray|drip.?tray|mudroom/i], exclude: [/serving.?tray/i] },
  { rank: 7, label: 'Over Door Organizer', queries: ['over the door organizer pockets entryway', 'over door hanging organizer shoes', 'over door storage organizer hooks'], maxPrice: 25, must: [/over.?the.?door|over.?door/i], prefer: [/over.?door|door.?organizer/i], exclude: [/bathroom.?only/i] },
  { rank: 8, label: 'Storage Bench', queries: ['entryway storage bench with cushion', 'shoe storage bench entryway', 'hallway bench with storage compartment'], maxPrice: 80, must: [/bench/i], prefer: [/storage.?bench|entryway.?bench|shoe.?bench/i], exclude: [/workout.?bench/i] },
  { rank: 9, label: 'Basket / Bin', queries: ['woven storage basket entryway', 'entryway basket for scarves gloves', 'fabric storage bin with handles'], maxPrice: 30, must: [/basket|bin/i], prefer: [/basket|storage.?bin|woven/i], exclude: [/laundry.?hamper.?giant/i] },
  { rank: 10, label: 'Door Mat', queries: ['entryway door mat indoor outdoor', 'welcome mat absorbent entryway', 'heavy duty door mat scrape dirt'], maxPrice: 35, must: [/mat|doormat/i], prefer: [/door.?mat|entryway.?mat|welcome.?mat/i], exclude: [/yoga.?mat|bath.?mat/i] },
]);
