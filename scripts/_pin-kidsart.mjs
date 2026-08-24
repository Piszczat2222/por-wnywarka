import { pinSlots } from './_pin-lib.mjs';

await pinSlots('kidsart', [
  { rank: 1, label: 'Washable Markers', queries: ['Crayola washable markers 40 count', 'washable markers kids broad tip', 'washable marker set kids'], maxPrice: 25, must: [/marker/i], prefer: [/washable|Crayola|kids/i], exclude: [/permanent.?marker/i] },
  { rank: 2, label: 'Construction Paper', queries: ['construction paper assorted colors 500 sheets', 'kids construction paper pack', 'colored craft paper bulk kids'], maxPrice: 20, must: [/paper|construction/i], prefer: [/construction.?paper|craft.?paper|colored/i], exclude: [/printer.?paper/i] },
  { rank: 3, label: 'Crayons', queries: ['Crayola crayons 64 count box', 'jumbo crayons toddlers 8 pack', 'crayons bulk pack kids'], maxPrice: 15, must: [/crayon/i], prefer: [/Crayola|crayon/i], exclude: [/crayon.?melter.?machine/i] },
  { rank: 4, label: 'Glue Sticks', queries: ['Elmer glue sticks pack 30', 'washable glue sticks kids school', 'glue sticks bulk classroom'], maxPrice: 20, must: [/glue/i], prefer: [/glue.?stick|Elmer|washable/i], exclude: [/hot.?glue.?gun.?only/i] },
  { rank: 5, label: 'Safety Scissors', queries: ['kids safety scissors 5 pack', 'blunt tip scissors kids preschool', 'left handed kids scissors'], maxPrice: 15, must: [/scissor/i], prefer: [/kids|safety|blunt|scissor/i], exclude: [/fabric.?scissor.?adult/i] },
  { rank: 6, label: 'Art Smock', queries: ['kids art smock waterproof long sleeve', 'children painting apron smock', 'toddler art smock waterproof'], maxPrice: 20, must: [/smock|apron/i], prefer: [/art.?smock|painting.?apron|kids/i], exclude: [/kitchen.?apron/i] },
  { rank: 7, label: 'Paint Set', queries: ['washable kids paint set 10 colors', 'Crayola washable paint set bottles', 'tempera paint kids non toxic'], maxPrice: 25, must: [/paint/i], prefer: [/washable|kids.?paint|tempera|Crayola/i], exclude: [/spray.?paint|wall.?paint/i] },
  { rank: 8, label: 'Craft Storage', queries: ['art supply storage caddy kids', 'craft organizer caddy handle portable', 'kids art supply storage box'], maxPrice: 30, must: [/storage|caddy|organizer/i], prefer: [/art.?supply|craft.?organizer|caddy/i], exclude: [/tool.?box/i] },
  { rank: 9, label: 'Stickers', queries: ['kids sticker book bulk pack', 'reward stickers for kids 1000 pack', 'sticker assortment kids craft'], maxPrice: 15, must: [/sticker/i], prefer: [/sticker|kids|reward/i], exclude: [/wall.?decal.?giant/i] },
  { rank: 10, label: 'Play Dough / Clay', queries: ['Play-Doh 10 pack assorted colors', 'modeling clay kids non toxic', 'play dough set with tools'], maxPrice: 25, must: [/play.?doh|playdough|clay|modeling/i], prefer: [/Play.?Doh|play.?dough|modeling.?clay/i], exclude: [/polymer.?clay.?adult.?only/i] },
]);
