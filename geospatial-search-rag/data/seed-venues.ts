/**
 * 100 mock cafes for seed data.
 * Diverse descriptions (WiFi / no WiFi / neutral) to demonstrate semantic search differences.
 */

export interface SeedVenue {
  name: string;
  description: string;
  category: string;
  lng: number;
  lat: number;
}

// Bangkok area: ~5km from Siam (13.7467, 100.5349)
// lat 13.70-13.79, lng 100.49-100.58
function coord(index: number): { lat: number; lng: number } {
  const latMin = 13.7;
  const latMax = 13.79;
  const lngMin = 100.49;
  const lngMax = 100.58;
  const row = Math.floor(index / 10);
  const col = index % 10;
  return {
    lat: latMin + (latMax - latMin) * (row / 9),
    lng: lngMin + (lngMax - lngMin) * (col / 9),
  };
}

const NAMES = [
  "Rocket Coffeebar",
  "Casa Lapin",
  "Factory Coffee",
  "Roast Coffee",
  "Blue Dye Cafe",
  "Coffee House Siam",
  "ร้านกาแฟสันติ",
  "Cafe Noir",
  "Bean There",
  "Third Wave",
  "Brew & Co",
  "Daily Dose",
  "The Roastery",
  "Craft Coffee Lab",
  "Slow Bar",
  "ร้านกาแฟลุงแดง",
  "Hipster Brew",
  "Urban Cafe",
  "Corner Coffee",
  "Morning Glory",
  "Cafe Amour",
  "ร้านกาแฟบ้านสวน",
  "Espresso Bar",
  "Filter House",
  "Single Origin",
  "Cafe Mellow",
  "The Daily Grind",
  "Bean & Brew",
  "Pour Over",
  "ร้านกาแฟริมทาง",
  "Cafe Verde",
  "Coffee Collective",
  "The Grind",
  "Brew Lab",
  "Cafe Sol",
  "ร้านกาแฟน้องใหม่",
  "Flat White",
  "Cortado Corner",
  "Mocha House",
  "Cafe Luna",
  "ร้านกาแฟยามเช้า",
  "The Coffee Stand",
  "Brew Brothers",
  "Cafe Ritual",
  "Bean Counter",
  "ร้านกาแฟหลังมุม",
  "Cafe Nomad",
  "The Roast",
  "Pour House",
  "Cafe Zen",
  "ร้านกาแฟกลางสวน",
  "Coffee Culture",
  "Brew House",
  "Cafe Terra",
  "The Bean",
  "ร้านกาแฟริมน้ำ",
  "Cafe Soul",
  "Coffee Corner",
  "Brew & Bake",
  "Cafe Haven",
  "ร้านกาแฟมุมสงบ",
  "The Brewery",
  "Bean Bar",
  "Cafe Bliss",
  "Coffee Nook",
  "ร้านกาแฟสไตล์เก่า",
  "Cafe Echo",
  "The Daily Brew",
  "Brew Master",
  "Cafe Oasis",
  "ร้านกาแฟบ้านไม้",
  "Coffee Haven",
  "Bean House",
  "Cafe Serenity",
  "The Grind House",
  "ร้านกาแฟริมถนน",
  "Cafe Harmony",
  "Brew Corner",
  "Cafe Vista",
  "Coffee Spot",
  "ร้านกาแฟมุมโปรด",
  "The Roast House",
  "Bean Brew",
  "Cafe Tranquil",
  "Brew & Chill",
  "ร้านกาแฟสไตล์ญี่ปุ่น",
  "Cafe Moment",
  "Coffee Lab",
  "Bean & Co",
  "Cafe Peace",
  "ร้านกาแฟมุมดี",
  "The Brew Spot",
  "Cafe Nest",
  "Brew Haven",
  "Coffee Den",
  "ร้านกาแฟสไตล์มินิมอล",
  "Cafe Grove",
  "The Bean House",
  "Brew & Sip",
  "Cafe Haven",
  "ร้านกาแฟมุมรัก",
];

const DESCRIPTIONS_WITH_WIFI = [
  "คาเฟ่เงียบๆ มี WiFi เร็ว นั่งทำงานได้สบาย บรรยากาศมินิมอล",
  "ร้านกาแฟมีไวไฟฟรี ใกล้ BTS อโศก นั่งนานได้ เหมาะทำงาน",
  "คาเฟ่สไตล์เกาหลี มี WiFi เร็ว เงียบสงบ นั่งทำงานได้",
  "ร้านกาแฟสเปเชียลตี้ มีไวไฟ ใกล้ MRT บรรยากาศเหมาะทำงาน",
  "คาเฟ่ใหญ่ มีทั้งอาหารและกาแฟ มี WiFi นั่งนานได้",
  "คาเฟ่เงียบ มี WiFi เร็ว ใกล้ BTS ทองหล่อ นั่งทำงานสบาย",
  "ร้านกาแฟมีไวไฟ ใกล้ BTS เอกมัย บรรยากาศมินิมอล",
  "คาเฟ่สไตล์ยุโรป มี WiFi เร็ว เค้กอร่อย นั่งชิลล์ได้",
  "ร้านกาแฟมีไวไฟฟรี ใกล้ BTS พร้อมพงษ์ เหมาะทำงาน",
  "คาเฟ่เงียบๆ มีไวไฟ นั่งทำงานได้สบาย ดนตรีเบาๆ",
  "ร้านกาแฟสเปเชียลตี้ มี WiFi ใกล้ BTS อโศก บรรยากาศดี",
  "คาเฟ่มีไวไฟ ใกล้ MRT สุทธิสาร นั่งนานได้",
  "ร้านกาแฟมี WiFi เร็ว เงียบสงบ เหมาะทำงาน",
  "คาเฟ่สไตล์มินิมอล มีไวไฟ นั่งทำงานได้สบาย",
  "ร้านกาแฟมีไวไฟฟรี ใกล้ BTS ราชดำริ บรรยากาศดี",
  "คาเฟ่เงียบ มี WiFi ใกล้ BTS ชิดลม นั่งนานได้",
  "ร้านกาแฟมีไวไฟ ใกล้ MRT พระราม 9 เหมาะทำงาน",
  "คาเฟ่มี WiFi เร็ว ใกล้ BTS อนุสาวรีย์ บรรยากาศมินิมอล",
  "ร้านกาแฟมีไวไฟ นั่งทำงานได้สบาย ดนตรีเบาๆ",
  "คาเฟ่สไตล์เกาหลี มีไวไฟฟรี เงียบสงบ นั่งนานได้",
  "ร้านกาแฟมี WiFi ใกล้ BTS  Victory Monument เหมาะทำงาน",
  "คาเฟ่เงียบๆ มีไวไฟ ใกล้ BTS สนามกีฬา บรรยากาศดี",
  "ร้านกาแฟมีไวไฟฟรี นั่งทำงานได้สบาย เค้กอร่อย",
  "คาเฟ่มี WiFi เร็ว ใกล้ MRT ลาดพร้าว บรรยากาศมินิมอล",
  "ร้านกาแฟมีไวไฟ เงียบสงบ นั่งนานได้ เหมาะทำงาน",
  "คาเฟ่สไตล์ยุโรป มี WiFi ใกล้ BTS เอกมัย นั่งชิลล์ได้",
  "ร้านกาแฟมีไวไฟฟรี ใกล้ BTS พร้อมพงษ์ บรรยากาศดี",
  "คาเฟ่เงียบ มีไวไฟ นั่งทำงานได้สบาย ดนตรีเบาๆ",
  "ร้านกาแฟมี WiFi เร็ว ใกล้ BTS ทองหล่อ เหมาะทำงาน",
  "คาเฟ่มีไวไฟ ใกล้ MRT สุทธิสาร บรรยากาศมินิมอล",
  "ร้านกาแฟมีไวไฟฟรี นั่งนานได้ เค้กอร่อย บรรยากาศดี",
  "คาเฟ่สไตล์มินิมอล มี WiFi ใกล้ BTS อโศก นั่งทำงานสบาย",
  "ร้านกาแฟมีไวไฟ เงียบสงบ เหมาะทำงาน ดนตรีเบาๆ",
  "คาเฟ่เงียบๆ มีไวไฟฟรี ใกล้ BTS ราชดำริ นั่งนานได้",
  "ร้านกาแฟมี WiFi เร็ว บรรยากาศมินิมอล นั่งทำงานได้",
];

const DESCRIPTIONS_NO_WIFI = [
  "คาเฟ่สไตล์ยุโรป มีเค้กอร่อย นั่งชิลล์ ดนตรีเบาๆ ไม่มีไวไฟ",
  "ร้านกาแฟเน้นบรรยากาศ เงียบสงบ ไม่มี WiFi เหมาะนั่งพัก",
  "คาเฟ่สไตล์เกาหลี เงียบสงบ เค้กอร่อย ไม่มีไวไฟ",
  "ร้านกาแฟสไตล์วินเทจ มีเค้กและขนม ไม่มีไวไฟ บรรยากาศดี",
  "คาเฟ่เล็กๆ เน้นกาแฟ ไม่มี WiFi เหมาะนั่งชิลล์",
  "ร้านกาแฟสไตล์ญี่ปุ่น เงียบสงบ ไม่มีไวไฟ เค้กอร่อย",
  "คาเฟ่สไตล์โบฮีเมียน มีดนตรีสด ไม่มี WiFi",
  "ร้านกาแฟเน้นบรรยากาศธรรมชาติ ไม่มีไวไฟ นั่งพักผ่อน",
  "คาเฟ่สไตล์มินิมอล เงียบสงบ เค้กอร่อย ไม่มีไวไฟ",
  "ร้านกาแฟสไตล์อังกฤษ มีชาและเค้ก ไม่มี WiFi",
  "คาเฟ่เล็ก เน้นความเงียบ ไม่มีไวไฟ เหมาะอ่านหนังสือ",
  "ร้านกาแฟสไตล์สแกนดิเนเวีย  minimalist ไม่มีไวไฟ",
  "คาเฟ่สไตล์ฝรั่งเศส มีเค้ก croissant ไม่มีไวไฟ",
  "ร้านกาแฟเน้นกาแฟสเปเชียลตี้ ไม่มี WiFi บรรยากาศดี",
  "คาเฟ่สไตล์อเมริกัน มีเบเกิล ไม่มีไวไฟ นั่งชิลล์",
  "ร้านกาแฟสไตล์ออสเตรเลีย flat white ไม่มีไวไฟ",
  "คาเฟ่สไตล์อิตาเลียน มีเอสเพรสโซ ไม่มี WiFi",
  "คาเฟ่สไตล์เวียดนาม กาแฟนมข้น ไม่มีไวไฟ",
  "ร้านกาแฟเน้นความเงียบ ไม่มี WiFi เหมาะนั่งพัก",
  "คาเฟ่สไตล์อินโดนีเซีย กาแฟกอปี ไม่มีไวไฟ",
  "ร้านกาแฟสไตล์เอธิโอเปีย single origin ไม่มี WiFi",
  "คาเฟ่สไตล์เม็กซิกัน มีช็อกโกแลต ไม่มีไวไฟ",
  "ร้านกาแฟเน้นบรรยากาศร่มรื่น ไม่มีไวไฟ นั่งพักผ่อน",
  "คาเฟ่สไตล์สเปน มี churros ไม่มี WiFi",
  "ร้านกาแฟสไตล์กรีก มี baklava ไม่มีไวไฟ",
  "คาเฟ่สไตล์ตุรกี กาแฟตุรกี ไม่มีไวไฟ",
  "ร้านกาแฟเน้นความสงบ ไม่มี WiFi เค้กอร่อย",
  "คาเฟ่สไตล์โปรตุเกส มี pastel de nata ไม่มีไวไฟ",
  "คาเฟ่สไตล์ออสเตรีย มี Sachertorte ไม่มี WiFi",
  "ร้านกาแฟเน้นบรรยากาศอบอุ่น ไม่มีไวไฟ นั่งชิลล์",
  "คาเฟ่สไตล์เบลเยียม มีวาฟเฟิล ไม่มีไวไฟ",
  "ร้านกาแฟสไตล์สวิส มีช็อกโกแลต ไม่มี WiFi",
  "คาเฟ่สไตล์เดนมาร์ก hygge ไม่มีไวไฟ บรรยากาศดี",
  "ร้านกาแฟเน้นความเงียบสงบ ไม่มี WiFi เหมาะอ่านหนังสือ",
  "คาเฟ่สไตล์สวีเดน fika ไม่มีไวไฟ เค้กอร่อย",
];

const DESCRIPTIONS_NEUTRAL = [
  "ร้านกาแฟสเปเชียลตี้ ใกล้ BTS บรรยากาศเหมาะกับการนั่งชิลล์",
  "คาเฟ่เงียบๆ ใกล้ MRT เหมาะนั่งพักผ่อน",
  "ร้านกาแฟใกล้ BTS อโศก บรรยากาศดี นั่งนานได้",
  "คาเฟ่สไตล์มินิมอล ใกล้ BTS ทองหล่อ",
  "ร้านกาแฟใกล้ MRT สุทธิสาร บรรยากาศเหมาะทำงาน",
  "คาเฟ่เงียบสงบ ใกล้ BTS เอกมัย นั่งชิลล์ได้",
  "ร้านกาแฟสเปเชียลตี้ ใกล้ BTS พร้อมพงษ์ บรรยากาศดี",
  "คาเฟ่ใกล้ MRT พระราม 9 เหมาะนั่งพัก",
  "ร้านกาแฟเงียบๆ ใกล้ BTS ราชดำริ นั่งนานได้",
  "คาเฟ่ใกล้ BTS ชิดลม บรรยากาศมินิมอล",
  "ร้านกาแฟสเปเชียลตี้ ใกล้ MRT ลาดพร้าว",
  "คาเฟ่เงียบ ใกล้ BTS อนุสาวรีย์ เหมาะนั่งชิลล์",
  "ร้านกาแฟใกล้ BTS Victory Monument บรรยากาศดี",
  "คาเฟ่สไตล์เกาหลี ใกล้ BTS สนามกีฬา",
  "ร้านกาแฟเงียบๆ ใกล้ MRT รัชดา นั่งนานได้",
  "คาเฟ่ใกล้ BTS ห้วยขวาง บรรยากาศเหมาะทำงาน",
  "ร้านกาแฟสเปเชียลตี้ ใกล้ BTS พญาไท",
  "คาเฟ่เงียบสงบ ใกล้ MRT สถานีกลาง บรรยากาศดี",
  "ร้านกาแฟใกล้ BTS หมอชิต เหมาะนั่งพัก",
  "คาเฟ่สไตล์มินิมอล ใกล้ BTS สะพานตากสิน",
  "ร้านกาแฟเงียบๆ ใกล้ MRT สีลม นั่งชิลล์ได้",
  "คาเฟ่ใกล้ BTS สุรศักดิ์ บรรยากาศดี",
  "ร้านกาแฟสเปเชียลตี้ ใกล้ BTS เตาปูน",
  "คาเฟ่เงียบ ใกล้ MRT บางซื่อ เหมาะนั่งพัก",
  "ร้านกาแฟใกล้ BTS หมอชิต บรรยากาศมินิมอล",
  "คาเฟ่สไตล์ยุโรป ใกล้ BTS อโศก นั่งนานได้",
  "ร้านกาแฟเงียบๆ ใกล้ MRT สุทธิสาร บรรยากาศดี",
  "คาเฟ่ใกล้ BTS ทองหล่อ เหมาะนั่งชิลล์",
  "ร้านกาแฟสเปเชียลตี้ ใกล้ BTS เอกมัย นั่งนานได้",
  "คาเฟ่เงียบสงบ ใกล้ MRT พระราม 9 บรรยากาศดี",
];

function buildSeedVenues(): SeedVenue[] {
  const venues: SeedVenue[] = [];
  let idx = 0;

  for (let i = 0; i < 35 && idx < 100; i++, idx++) {
    const c = coord(idx);
    venues.push({
      name: NAMES[idx],
      description: DESCRIPTIONS_WITH_WIFI[i % DESCRIPTIONS_WITH_WIFI.length],
      category: "cafe",
      lng: c.lng,
      lat: c.lat,
    });
  }

  for (let i = 0; i < 35 && idx < 100; i++, idx++) {
    const c = coord(idx);
    venues.push({
      name: NAMES[idx],
      description: DESCRIPTIONS_NO_WIFI[i % DESCRIPTIONS_NO_WIFI.length],
      category: "cafe",
      lng: c.lng,
      lat: c.lat,
    });
  }

  for (let i = 0; i < 30 && idx < 100; i++, idx++) {
    const c = coord(idx);
    venues.push({
      name: NAMES[idx],
      description: DESCRIPTIONS_NEUTRAL[i % DESCRIPTIONS_NEUTRAL.length],
      category: "cafe",
      lng: c.lng,
      lat: c.lat,
    });
  }

  return venues;
}

export const SEED_VENUES: SeedVenue[] = buildSeedVenues();
