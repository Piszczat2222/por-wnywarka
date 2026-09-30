import { pinSlots } from './_pin-lib.mjs';

await pinSlots('hometool', [
  { rank: 1, label: 'Screwdriver Set', queries: ['screwdriver set magnetic 10 piece', 'precision screwdriver set household', 'screwdriver bit set home repair'], maxPrice: 25, must: [/screwdriver/i], prefer: [/screwdriver.?set|magnetic|bit/i], exclude: [/electric.?screwdriver.?only/i] },
  { rank: 2, label: 'Hammer', queries: ['claw hammer 16 oz fiberglass', 'small hammer household tool', 'stubby claw hammer home'], maxPrice: 25, must: [/hammer/i], prefer: [/claw.?hammer|fiberglass|stubby/i], exclude: [/meat.?hammer|curling/i] },
  { rank: 3, label: 'Tape Measure', queries: ['tape measure 25 foot magnetic', 'Stanley tape measure 25 ft', 'self locking tape measure'], maxPrice: 20, must: [/tape.?measure/i], prefer: [/tape.?measure|25.?ft|magnetic/i], exclude: [/measuring.?cup/i] },
  { rank: 4, label: 'Pliers Set', queries: ['pliers set 3 piece needle nose', 'combination pliers set home', 'slip joint pliers set'], maxPrice: 30, must: [/pliers/i], prefer: [/pliers.?set|needle.?nose|combination/i], exclude: [/hair.?pliers/i] },
  { rank: 5, label: 'Utility Knife', queries: ['utility knife retractable blade pack', 'box cutter utility knife set', 'retractable utility knife blades'], maxPrice: 15, must: [/utility.?knife|box.?cutter/i], prefer: [/utility.?knife|box.?cutter|retractable/i], exclude: [/kitchen.?knife/i] },
  { rank: 6, label: 'Level', queries: ['torpedo level magnetic 9 inch', 'small bubble level tool', 'laser level line tool home'], maxPrice: 25, must: [/level/i], prefer: [/level|torpedo|bubble|laser/i], exclude: [/water.?level.?game/i] },
  { rank: 7, label: 'Adjustable Wrench', queries: ['adjustable wrench 8 inch crescent', 'adjustable wrench set 2 pack', 'small adjustable wrench home'], maxPrice: 25, must: [/wrench|adjustable/i], prefer: [/adjustable.?wrench|crescent/i], exclude: [/socket.?wrench.?set.?only/i] },
  { rank: 8, label: 'Tool Box', queries: ['tool box portable with tray', 'small tool box organizer plastic', 'household tool box with handle'], maxPrice: 35, must: [/tool.?box|toolbox/i], prefer: [/tool.?box|toolbox|organizer/i], exclude: [/tool.?belt.?only/i] },
  { rank: 9, label: 'Flashlight', queries: ['LED flashlight rechargeable home tool', 'magnetic LED work light handheld', 'tactical flashlight rechargeable'], maxPrice: 25, must: [/flashlight|torch/i], prefer: [/LED|flashlight|rechargeable|magnetic/i], exclude: [/keychain.?mini.?only/i] },
  { rank: 10, label: 'Duct Tape / Repair', queries: ['Gorilla tape duct tape pack', 'heavy duty duct tape multi pack', 'electrical tape duct tape set'], maxPrice: 20, must: [/tape|Gorilla/i], prefer: [/duct.?tape|Gorilla|electrical.?tape/i], exclude: [/washi.?tape|masking.?tape.?only/i] },
]);
