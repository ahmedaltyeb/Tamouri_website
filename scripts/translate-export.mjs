// Run: node scripts/translate-export.mjs
// Reads the exported products Excel, fills Arabic fields, writes a new file ready for import.

import XLSX from "xlsx";
import { fileURLToPath } from "url";
import path from "path";

const INPUT  = "C:/Users/HP 840 G5/Downloads/products-export-2026-06-26.xlsx";
const OUTPUT = "C:/Users/HP 840 G5/Downloads/products-translated-2026-06-26.xlsx";

// ─── Translation map by product ID ──────────────────────────────────────────
// nameAr: corrected Arabic product name
// descAr: short Arabic description (leave undefined to auto-generate)
const T = {
  // Dates
  "cmqpmmjws0000v0icasjyyazq": { nameEn: "Premium Medjool Dates",                                           nameAr: "تمر مجدول فاخر" },
  "cmqqjw4sv000nv0j04ucpqsvy": { nameEn: "First-Grade Ajwa Dates from Madinah",                             nameAr: "تمر عجوة المدينة الدرجة الأولى" },
  "cmqqjw6fw000pv0j0pgpdmj0k": { nameEn: "Dates with Cardamom and Saffron – Small Tin Box 1 kg",           nameAr: "تمر بالهيل والزعفران - علبة صغيرة ١ كيلو" },
  "cmqqjw6wt000rv0j0srzi3w2g": { nameEn: "Dates with Cardamom and Saffron – Large 2 kg Tin",               nameAr: "تمر بالهيل والزعفران - علبة كبيرة ٢ كيلو" },
  "cmqqjw75b000tv0j0nvhnebho": { nameEn: "Dates of Happiness",                                               nameAr: "تمر السعادة" },
  "cmqqjw7cn000vv0j051qhz9uh": { nameEn: "Dates of Happiness with Nuts Saffron and Tahini – Golden Box",   nameAr: "تمر السعادة بالمكسرات والزعفران والطحينة - صندوق ذهبي" },
  "cmqqjw8ez000xv0j0r42cf548": { nameEn: "Dates of Happiness Mix – Authenticity and Unique Taste",          nameAr: "مزيج تمر السعادة - تمر يجمع الأصالة والمذاق الفريد" },
  "cmqqjw95a000zv0j06zvl77fx": { nameEn: "Al-Kharj Khalas Dates – Luxurious Royal Treat",                  nameAr: "تمر خلاص الخرج - متعة ملكية فاخرة" },
  "cmqqjw9d00011v0j09p0yotuo": { nameEn: "Qassim Gold VIP Dates",                                           nameAr: "تمر القصيم الذهبي VIP" },
  "cmqqjw9my0013v0j0256x0uzo": { nameEn: "Individually Wrapped Al-Qassim Khalas Dates – Premium",          nameAr: "تمر خلاص القصيم مغلف منفرداً - فاخر للضيافة" },
  "cmqqjw9wy0015v0j0ho2sd1c5": { nameEn: "Qassim Dates – Loose",                                            nameAr: "تمر القصيم - مفرد" },
  "cmqqjwab40017v0j0zplbfpdj": { nameEn: "Golden Khalas Dates VIP – A Dose of Happiness",                  nameAr: "تمر خلاص ذهبي VIP - جرعة من السعادة" },
  "cmqqjwas90019v0j0mvgmsctn": { nameEn: "Sukkari Dates (Twisted)",                                         nameAr: "تمر سكري (ملتوي)" },
  "cmqqjwb3j001bv0j0g86rl9o0": { nameEn: "Premium Ajwa Dates from Madinah – Elegant 2kg Gift Box",         nameAr: "تمر عجوة المدينة المنورة الفاخر - صندوق هدايا أنيق ٢ كيلو" },
  "cmqqjwbc3001dv0j03rucuiw2": { nameEn: "Premium Date Box – Variety of Selections for Gifts",             nameAr: "صندوق تمر فاخر - تشكيلة متنوعة للهدايا والضيافة" },
  "cmqqjwbkn001fv0j0ifql06xw": { nameEn: "3 kg Carton of Al-Faisaliah Saqai Dates",                        nameAr: "كرتون تمر سقعي الفيصلية ٣ كيلو" },
  "cmqqjwbt5001hv0j05h1tmte8": { nameEn: "Khalas Ashiqar Jumbo – 8 kg",                                    nameAr: "تمر خلاص عشيقر جامبو - ٨ كيلو" },
  "cmqqjwc1p001jv0j03qyndeay": { nameEn: "VIP Al Faisaliah Sagai Dates in a Luxury Gift Box",              nameAr: "تمر سقعي الفيصلية VIP في صندوق هدايا فاخر" },
  "cmqqjwciw001lv0j0sp3mbkfd": { nameEn: "Premium Sukkari Dates in an Elegant Gift Box",                   nameAr: "تمر سكري فاخر في صندوق هدايا أنيق" },
  "cmqqjwcr3001nv0j0pafto2lb": { nameEn: "A Luxurious Date in a Distinctive Gift Box",                     nameAr: "تمر فاخر مُقدَّم في صندوق هدايا مميز" },
  "cmqqjwcyx001pv0j0inlf5xlk": { nameEn: "Ajwa Dates from Madinah – Jumbo",                                nameAr: "تمر عجوة المدينة المنورة - جامبو" },
  "cmqqjwd8c001rv0j04a31xhow": { nameEn: "Date Paste",                                                      nameAr: "معجون التمر (دبس)" },

  // Arabic Coffee
  "cmqpmmkbz0001v0icqrtyv4zr": { nameEn: "Arabic Coffee with Cardamom",                                    nameAr: "قهوة عربية بالهيل" },
  "cmqpmmmuq000av0icz28gkui1": { nameEn: "Dark Roasted Black Coffee",                                      nameAr: "قهوة سوداء محمصة دارك" },
  "cmqqjwdgw001tv0j00s4wvlpe": { nameEn: "Qassim Mix with Cardamom 125g",                                  nameAr: "مزيج القصيم بالهيل ١٢٥ جرام" },
  "cmqqjwe2c001vv0j0tk7qtm9s": { nameEn: "Al-Qassim Coffee Blend 125g",                                    nameAr: "خلطة قهوة القصيم ١٢٥ جرام" },
  "cmqqjwe9f001xv0j0pyepc19v": { nameEn: "Original Ghamdi Coffee Blend with Cardamom and Saffron",         nameAr: "خلطة قهوة الغامدي الأصلية بالهيل والزعفران" },
  "cmqqjweha001zv0j0hj52lfou": { nameEn: "VIP Emirati Coffee with Cardamom and Saffron",                   nameAr: "قهوة إماراتية VIP بالهيل والزعفران" },
  "cmqqjwf4k0021v0j0tlcv2rqq": { nameEn: "Emirati Red Ceylon Coffee",                                      nameAr: "قهوة سيلاني إماراتية حمراء" },
  "cmqqjwfiu0023v0j0xt9q56it": { nameEn: "Special Emirati Coffee – The Secret to the Luxurious Flavor",   nameAr: "قهوة إماراتية خاصة - سر النكهة الفاخرة" },
  "cmqqjwfzv0025v0j0oyxvkxxm": { nameEn: "Emirati Sheikh Coffee with Cardamom Only",                       nameAr: "قهوة الشيخ الإماراتية بالهيل فقط" },
  "cmqqjwg8g0027v0j0fb7l5f85": { nameEn: "Dark Emirati Coffee with Cardamom and Saffron",                 nameAr: "قهوة إماراتية داكنة بالهيل والزعفران" },
  "cmqqjwhqi0029v0j0y87zm1cd": { nameEn: "Dark Emirati Ceylon Coffee",                                     nameAr: "قهوة سيلاني إماراتية داكنة" },
  "cmqqjwhz2002bv0j0fjkvj7d2": { nameEn: "Nescafé Extra Fort Original Coffee 100% 200g",                   nameAr: "نسكافيه اكسترا فورت قهوة أصلية ١٠٠٪ ٢٠٠ جرام" },
  "cmqqjwid8002dv0j0z8tj3r55": { nameEn: "Al Buraimi Coffee",                                              nameAr: "قهوة البريمي" },
  "cmqqjwiom002fv0j0ppjbw0m4": { nameEn: "Khawlani Coffee",                                                nameAr: "قهوة خولاني" },
  "cmqqjwjms002hv0j00max2c4a": { nameEn: "Royal Emirati Coffee",                                           nameAr: "القهوة الإماراتية الملكية" },
  "cmqqjwjv9002jv0j0eu15rhp9": { nameEn: "Qassim Saffron Mix 125g",                                        nameAr: "مزيج القصيم بالزعفران ١٢٥ جرام" },
  "cmqqjwkqk002lv0j0km0acex2": { nameEn: "Home Coffee",                                                    nameAr: "قهوة البيت" },
  "cmqqjwl1x002nv0j0lfoc25gj": { nameEn: "Mexican Arabic Coffee",                                          nameAr: "قهوة عربية مكسيكية" },
  "cmqqjwl9v002pv0j0uhkw81bn": { nameEn: "Coffee for My Bite (Luqmaty)",                                   nameAr: "قهوة لقمتي" },
  "cmqqjwlhn002rv0j0h3ik8li1": { nameEn: "Zakher Ceylon Coffee",                                           nameAr: "قهوة ظاهر السيلاني" },
  "cmqqjwm31002tv0j0n1i7z9x3": { nameEn: "Riyadh Coffee – Blonde Saudi Coffee with Cardamom and Saffron", nameAr: "قهوة الرياض - قهوة سعودية شقراء بالهيل والزعفران" },
  "cmqqjwm9t002vv0j00k7azpab": { nameEn: "Eye Coffee (Al Ain)",                                            nameAr: "قهوة العين" },
  "cmqqjwmh7002xv0j0rtxo3c24": { nameEn: "Saudi Arabian Coffee – Blue Sachet 400g",                       nameAr: "قهوة سعودية - كيس أزرق ٤٠٠ جرام" },

  // Specialty Coffee
  "cmqqjwmuv002zv0j0be3ifp7f": { nameEn: "Specialty Coffee Dabaye Guji Hambela",                           nameAr: "قهوة مختصة دباي غوجي هامبيلا" },
  "cmqqjwng10031v0j073im2in6": { nameEn: "Specialty Coffee from Ethiopia – Yergachef Adado",               nameAr: "قهوة مختصة من إثيوبيا - يرغاشيف أدادو" },
  "cmqqjwnmu0033v0j05i26itpr": { nameEn: "Bourbon Coffee from El Salvador",                                nameAr: "قهوة بوربون من السلفادور" },
  "cmqqjwnwd0035v0j0ycy3r27p": { nameEn: "Specialty Coffee from Brazil",                                   nameAr: "قهوة مختصة من البرازيل" },
  "cmqqjwo4w0037v0j0wk695xdw": { nameEn: "Specialty Coffee from Colombia",                                 nameAr: "قهوة مختصة من كولومبيا" },
  "cmqqjwocv0039v0j0dwp0aahu": { nameEn: "Hezem V60 Specialty Coffee – Melon Flavor 125g",                nameAr: "قهوة مختصة هيزم V60 - نكهة الشمام ١٢٥ جرام" },
  "cmqqjwoor003bv0j059k8dbzv": { nameEn: "Exclusive Offer – Specialty Coffee 3 Bags Get 4th Free",        nameAr: "عرض حصري - قهوة مختصة ٣ أكياس والرابع مجاناً" },
  "cmqqjwovp003dv0j07hds55sv": { nameEn: "Dripo Drip Coffee Sachets – Mocha (10 Envelopes)",               nameAr: "أكياس قهوة دريبو دريب - موكا (١٠ أكياس)" },
  "cmqqjwp2l003fv0j0x1bbfnzx": { nameEn: "Specialty Coffee – 4x250g Sachets (Buy 3 Get 4th Free)",        nameAr: "قهوة مختصة - ٤ أكياس ٢٥٠ جرام (اشترِ ٣ واحصل على الرابع مجاناً)" },
  "cmqqjwp9r003hv0j0kffvu5nx": { nameEn: "Single-Origin Kaffa Coffee from Kaffa East Ethiopia",            nameAr: "قهوة كافا أحادية المصدر من كافا شرق إثيوبيا" },
  "cmqqjwpk1003jv0j022knxqba": { nameEn: "Hezem V60 Colombian Grape Soda Specialty Coffee 125g",          nameAr: "قهوة مختصة هيزم V60 كولومبية صودا العنب ١٢٥ جرام" },
  "cmqqjwpsm003lv0j0pgber6lx": { nameEn: "Specialty Coffee from Ethiopia – Goji Hambela",                  nameAr: "قهوة مختصة من إثيوبيا - غوجي هامبيلا" },
  "cmqqjwqc6003nv0j0g4n296my": { nameEn: "Specialty Coffee from Uganda",                                   nameAr: "قهوة مختصة من أوغندا" },
  "cmqqjwqlm003pv0j0bdu3vuz0": { nameEn: "EXCELSO Colombia",                                               nameAr: "إكسيلسو كولومبيا" },

  // Tea
  "cmqpmmkzg0003v0ic2dm7ywgt": { nameEn: "Emirati Karak Tea",                                              nameAr: "شاي كرك إماراتي" },
  "cmqpmmm640007v0icmj5tio4i": { nameEn: "Emirati Herbal Tea",                                             nameAr: "شاي الأعشاب الإماراتي" },
  "cmqqjwrjw003rv0j0egem12c2": { nameEn: "Al-Budair Tea – 350g Iron Can",                                  nameAr: "شاي البدير - علبة حديد ٣٥٠ جرام" },
  "cmqqjwrzx003tv0j0qgn79lmt": { nameEn: "Moringa Tea for Slimming",                                       nameAr: "شاي المورينجا للتخسيس" },
  "cmqqjws8y003vv0j0isner497": { nameEn: "Luxury Ceylon Black Tea – 250g",                                 nameAr: "شاي سيلاني أسود فاخر - ٢٥٠ جرام" },
  "cmqqjwshc003xv0j06bw0c4hz": { nameEn: "Premium Ceylon Black Leaf Thick Tea – Large Leaf",              nameAr: "شاي سيلاني أسود ورق سميك ممتاز - ورقة كبيرة" },
  "cmqqjwsrk003zv0j0rykram0d": { nameEn: "BOP Hajim Tea – Pure Ceylon Tea 250g Box",                      nameAr: "شاي هاجيم BOP - شاي سيلاني نقي، علبة ٢٥٠ جرام" },
  "cmqqjwt170041v0j0a09s5rfl": { nameEn: "Qurnas Tea",                                                     nameAr: "شاي القرناس" },
  "cmqqjwt9g0043v0j0mnip6kx0": { nameEn: "Charcoal Tea – 100 Bags",                                       nameAr: "شاي الفحم - ١٠٠ كيس" },
  "cmqqjwthn0045v0j0c8ida5yo": { nameEn: "Al Ghazaleen Tea – Red Carton 100 Tea Bags",                    nameAr: "شاي الغزالين - كرتون أحمر، ١٠٠ كيس شاي" },
  "cmqqjwttt0047v0j0hl5a2kiz": { nameEn: "Thick Tea 200g",                                                 nameAr: "شاي ثقيل ٢٠٠ جرام" },
  "cmqqjwu0q0049v0j0decq601g": { nameEn: "Safari Pure Kenyan Tea 100 Bags",                                nameAr: "شاي سفاري نقي كيني ١٠٠ كيس" },
  "cmqqjwugj004bv0j08s8hrjeo": { nameEn: "Sultan Green Tea 9371",                                          nameAr: "شاي سلطان الأخضر ٩٣٧١" },
  "cmqqjwurv004dv0j0cfq4b3fy": { nameEn: "Al Ghazaleen Tea – Black Carton 100 Bags",                      nameAr: "شاي الغزالين - كرتون أسود ١٠٠ كيس" },
  "cmqqjwuym004fv0j0zhuxa2i9": { nameEn: "100% Quality Natural Green Tea",                                 nameAr: "شاي أخضر طبيعي نقي ١٠٠٪" },
  "cmqqjwv5b004hv0j0nrnsv4n5": { nameEn: "505 Tea 500g",                                                   nameAr: "شاي ٥٠٥ بوزن ٥٠٠ جرام" },
  "cmqqjwvej004jv0j0h3tg2ulv": { nameEn: "Azerbaijani Black Tea 250g",                                    nameAr: "شاي أسود أذربيجاني ٢٥٠ جرام" },
  "cmqqjwvn3004lv0j06io2ee8w": { nameEn: "Good Day Cappuccino – Rich Blend with Luxurious Creamy Foam",  nameAr: "كابتشينو جود داي - مزيج غني برغوة كريمية فاخرة" },

  // Coffee and Tea Tools
  "cmqpmml8s0004v0icptansrf0": { nameEn: "Golden Dallah and Finjan Coffee Set",                            nameAr: "طقم دلة وفناجين ذهبي" },
  "cmqpmmly90006v0icyimtcccg": { nameEn: "Luxury Manual Coffee Grinder",                                   nameAr: "مطحنة قهوة يدوية فاخرة" },
  "cmqpmmmfo0008v0icrm6xrcxj": { nameEn: "Turkish Tea Glass Set",                                          nameAr: "طقم أكواب شاي تركي" },
  "cmqqjwvyi004nv0j0pp7wmy4j": { nameEn: "6-Piece Tea Cup Set",                                            nameAr: "طقم فناجين شاي ٦ قطع" },
  "cmqqjwwfu004pv0j04q8147rs": { nameEn: "Royalx Picardy French Glass Set – 12 Pieces",                   nameAr: "طقم كأس فرنسي رويالكس بيكاردي - ١٢ قطعة" },
  "cmqqjwwwn004rv0j0bvijb2gy": { nameEn: "Decorative Coffee Cup Set – 6 Pieces with a Luxury Box",        nameAr: "طقم فناجين قهوة زخرفية - ٦ قطع مع صندوق فاخر" },
  "cmqqjwx81004tv0j0cxbjnfoy": { nameEn: "Omega 5 Gas Canister 500g",                                     nameAr: "إسطوانة غاز أوميجا ٥ - ٥٠٠ جرام" },
  "cmqqjwxqj004vv0j0hc2x7y3q": { nameEn: "Tea Scoops – Wooden Coffee Measuring Scoop",                    nameAr: "ملاعق شاي - ملعقة قياس قهوة خشبية" },
  "cmqqjwy3c004xv0j0qyfg61x8": { nameEn: "Luxurious Glass Container for Storing and Serving Dates",       nameAr: "حاوية زجاجية فاخرة لتخزين وتقديم التمر" },
  "cmqqjwz49004zv0j0ed3m8hnd": { nameEn: "Electric Coffee and Tea Pot (Afco)",                             nameAr: "غلاية قهوة وشاي كهربائية (أفكو)" },
  "cmqqjwzcs0051v0j0ejb8wc2u": { nameEn: "Turkish Coffee Kettle",                                          nameAr: "دلة القهوة التركية" },
  "cmqqjwzlc0053v0j07vg2l714": { nameEn: "Large Tea Hospitality Set",                                      nameAr: "طقم ضيافة شاي كبير" },
  "cmqqjx02f0055v0j074v4kmix": { nameEn: "Distillation Funnels with Wooden Base – Multiple Colors",        nameAr: "قمع تقطير مع قاعدة خشبية - ألوان متعددة" },
  "cmqqjx0aa0057v0j0ian3nng9": { nameEn: "Coffee and Tea Cup and Saucer Set – Green and Yellow – 12 Pcs", nameAr: "طقم فناجين قهوة وشاي مع صحون - تصميم أخضر وأصفر - ١٢ قطعة" },
  "cmqqjx0mc0059v0j0k9ihqrsh": { nameEn: "Teapot for Water Heater on the Stove",                          nameAr: "إبريق ماء للتسخين على الموقد" },
  "cmqqjx0xm005bv0j0tl27tb0o": { nameEn: "Timer Black Precision Scale with Large LCD Display – for Coffee", nameAr: "ميزان دقيق تايمر أسود مع شاشة LCD كبيرة - للقهوة" },
  "cmqqjx1by005dv0j04d7f7jig": { nameEn: "Japanese-Style Siphon Coffee Maker",                             nameAr: "مصنعة قهوة يابانية الطراز بالسيفون" },
  "cmqqjx1nc005fv0j08w2zkfho": { nameEn: "Espresso Tamper (Pressure Mold)",                                nameAr: "تامبر الإسبريسو (قالب الضغط)" },
  "cmqqjx1yo005hv0j0ovgkjjaj": { nameEn: "Coffee Clump Breaker",                                           nameAr: "كاسر تكتلات القهوة" },
  "cmqqjx27a005jv0j08jrckc4y": { nameEn: "Time More C3 – Manual Coffee Grinder",                          nameAr: "مطحنة تايم مور C3 - مطحنة قهوة يدوية" },
  "cmqqjx2ed005lv0j0suzbpl7v": { nameEn: "350ml Coffee Filter Pot",                                        nameAr: "إبريق تصفية قهوة ٣٥٠ مل" },
  "cmqqjx2r6005nv0j03t2rizxv": { nameEn: "Drip Coffee Filter Paper",                                       nameAr: "فلتر ورق قهوة دريب" },
  "cmqqjx32i005pv0j03t5wlcc9": { nameEn: "V60 Dripper Size 02",                                            nameAr: "حلقة دريبر V60 المقاس ٠٢" },
  "cmqqjx3yl005rv0j0jocl4nhe": { nameEn: "Complete and Portable Drip Coffee Kit",                          nameAr: "حقيبة قهوة دريب كاملة وقابلة للحمل" },

  // Travel Tools
  "cmqqjx46b005tv0j0monn2bmc": { nameEn: "BRS Portable 7000W Outdoor Stove (BRS-75)",                     nameAr: "موقد خارجي محمول BRS بقدرة ٧٠٠٠ واط (BRS-75)" },
  "cmqqjx4et005vv0j0b6xao92q": { nameEn: "Grill and Charcoal Base for Picnics and Gardens",               nameAr: "شواية وقاعدة فحم للرحلات والحدائق" },
  "cmqqjx4q9005xv0j0ro7uexjp": { nameEn: "Korean Double Burner Camping Stove with Barbecue Grill",        nameAr: "موقد تخييم كوري بشعلتين مع شواية باربيكيو" },
  "cmqqjx579005zv0j04l9hzmmc": { nameEn: "Electric Air Blower",                                            nameAr: "منفاخ هواء كهربائي" },
  "cmqqjx5fs0061v0j0xl7tqw3n": { nameEn: "Two Gas-Powered Shula Burger Burners with Bag",                 nameAr: "شعلتا شولا بيرجر تعملان بالغاز مع حقيبة" },

  // Gift Boxes (already Arabic names — add EN)
  "cmqpmmlgw0005v0icxdxkua4s": { nameEn: "Premium Hospitality Gift Box",                                   nameAr: "بوكس هدايا الضيافة الفاخر" },
  "cmqpmmmn80009v0icn15k07gc": { nameEn: "Eid Gift Box",                                                   nameAr: "بوكس هدايا العيد" },

  // Saffron
  "cmqpmmkr30002v0ic13xqbxff": { nameEn: "Authentic Iranian Saffron",                                      nameAr: "زعفران إيراني أصيل" },

  // Sweets
  "cmqqjx5oc0063v0j0lk2x3xhk": { nameEn: "Butter Cookies – A Luxury Treat",                               nameAr: "بسكويت الزبدة - متعة فاخرة" },
  "cmqqjx5zs0065v0j0c3y4tfqr": { nameEn: "Nabil Nankhatai – Saffron & Cashew Luxury Biscuits",            nameAr: "نبيل نانختاي - بسكويت فاخر بالزعفران والكاجو - بنكهات شرقية" },
};

// Arabic category label for auto-generated descriptions
const CAT_AR = {
  "Dates":                "التمر",
  "Arabic Coffee":        "القهوة العربية",
  "Specialty Coffee":     "القهوة المختصة",
  "Tea":                  "الشاي",
  "Coffee And Tea Tools": "أدوات القهوة والشاي",
  "Travel Tools":         "أدوات السفر والرحلات",
  "Gift Boxes":           "صناديق الهدايا",
  "Saffron":              "الزعفران",
  "Hospitality":          "مستلزمات الضيافة",
  "Candies / Sweets":     "الحلويات",
};

// ─── Process ─────────────────────────────────────────────────────────────────
const wb = XLSX.readFile(INPUT);
const wsName = wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

let updated = 0;
let alreadyAR = 0;

const out = rows.map((row) => {
  const r = { ...row };
  const id  = String(r["ID"] ?? "");
  const t   = T[id];

  const nameEN = String(r["Name (EN)"] ?? "");
  const nameAR = String(r["Name (AR)"] ?? "");
  const descEN = String(r["Description (EN)"] ?? "");
  const descAR = String(r["Description (AR)"] ?? "");
  const cat    = String(r["Category"] ?? "");

  // Determine if Arabic name is already real Arabic (starts with Arabic char)
  const isRealArabic = (s) => /[؀-ۿ]/.test(s.charAt(0));

  if (t) {
    // Apply translation from map
    r["Name (EN)"] = t.nameEn;
    r["Name (AR)"] = t.nameAr;
    // Generate Arabic description if current one is English
    if (!isRealArabic(descAR)) {
      const catAr = CAT_AR[cat] ?? cat;
      r["Description (AR)"] = `${t.nameAr} - منتج فاخر من ${catAr} من مريبة الغربية للتمور.`;
    }
    updated++;
  } else if (!isRealArabic(nameAR) && isRealArabic(nameEN)) {
    // Name (EN) is actually Arabic (old products stored AR-only) — fix columns
    r["Name (AR)"] = nameEN;
    // Leave Name (EN) as-is (admin can update separately)
    alreadyAR++;
  } else if (isRealArabic(nameAR)) {
    // Already has correct Arabic
    if (!isRealArabic(descAR)) {
      const catAr = CAT_AR[cat] ?? cat;
      r["Description (AR)"] = `${nameAR} - منتج فاخر من ${catAr} من مريبة الغربية للتمور.`;
    }
    alreadyAR++;
  }

  return r;
});

// Write output
const newWs = XLSX.utils.json_to_sheet(out);
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, newWs, "Products");
XLSX.writeFile(newWb, OUTPUT);

console.log(`Done.`);
console.log(`  Translated via map:  ${updated}`);
console.log(`  Already Arabic:      ${alreadyAR}`);
console.log(`  Total rows:          ${out.length}`);
console.log(`\nOutput saved to: ${OUTPUT}`);
