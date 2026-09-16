// KSP-inspired service data for e-Challan, e-Lost reporting, Traffic Advisories, and Fine Chart

export const MOCK_CHALLANS = [
  {
    challanNo: "CH-2026-8891",
    vehicleNo: "CG 04 AB 1234",
    ownerName: "Rahul Sharma",
    violation: "No Parking Zone (अवैध पार्किंग)",
    violationEn: "Illegal Parking in No-Parking Zone",
    location: "Jaistambh Chowk, Raipur",
    date: "2026-08-20 14:30",
    amount: 500,
    status: "PENDING",
    nearestStation: "Gol Bazar Police Station",
  },
  {
    challanNo: "CH-2026-9042",
    vehicleNo: "CG 04 AB 1234",
    ownerName: "Rahul Sharma",
    violation: "Riding without Helmet (बिना हेलमेट दुपहिया)",
    violationEn: "Riding Two-Wheeler without Helmet",
    location: "Telibandha Expressway",
    date: "2026-08-15 09:15",
    amount: 1000,
    status: "PENDING",
    nearestStation: "Telibandha Police Station",
  },
  {
    challanNo: "CH-2026-7120",
    vehicleNo: "CG 04 XY 9876",
    ownerName: "Priya Verma",
    violation: "Red Light Jumping (सिग्नल जंप)",
    violationEn: "Jumping Traffic Red Light",
    location: "Tatibandh Chowk",
    date: "2026-08-10 18:45",
    amount: 1000,
    status: "PAID",
    paidOn: "2026-08-11 11:20",
    nearestStation: "Amanaka Police Station",
  },
];

export const TRAFFIC_FINE_RATES = [
  { violation: "बिना हेलमेट वाहन चलाना", violationEn: "Riding without Helmet", fine: "₹ 1,000", section: "Sec 177 / 194D MVA" },
  { violation: "नो-पार्किंग ज़ोन में अवैध पार्किंग", violationEn: "Illegal Parking in No-Parking Zone", fine: "₹ 500 - ₹ 1,500", section: "Sec 177 MVA" },
  { violation: "रेड लाइट / सिग्नल उल्लंघन", violationEn: "Red Light Jumping / Signal Violation", fine: "₹ 1,000 - ₹ 5,000", section: "Sec 184 MVA" },
  { violation: "सीट बेल्ट न लगाना", violationEn: "Driving without Seat Belt", fine: "₹ 1,000", section: "Sec 194B MVA" },
  { violation: "दुपहिया पर ट्रिपल सवारी", violationEn: "Triple Riding on Two-Wheeler", fine: "₹ 1,000", section: "Sec 194C MVA" },
  { violation: "ड्राइविंग के दौरान मोबाइल फोन का उपयोग", violationEn: "Using Mobile Phone while Driving", fine: "₹ 1,000 - ₹ 5,000", section: "Sec 184 MVA" },
  { violation: "बिना वैध ड्राइविंग लाइसेंस (DL)", violationEn: "Driving without Valid Driving License", fine: "₹ 5,000", section: "Sec 181 MVA" },
  { violation: "तेज गति से वाहन चलाना (Over-speeding)", violationEn: "Over-speeding", fine: "₹ 2,000 - ₹ 4,000", section: "Sec 183 MVA" },
];

export const LIVE_TRAFFIC_ADVISORIES = [
  {
    id: "adv-1",
    titleHi: " जयस्तंभ चौक - नया ट्रैफिक मार्ग डायवर्जन",
    titleEn: " Jaistambh Chowk - Traffic Diversion Advisory",
    date: "2026-08-24",
    detailHi: "स्मार्ट सिटी ड्रेनेज कार्य के कारण जयस्तंभ चौक से मालवीय रोड की ओर 24 से 26 अगस्त तक केवल एकतरफा (One-Way) यातायात रहेगा। वैकल्पिक मार्ग हेतु फाफाडीह होकर जाएँ।",
    detailEn: "Due to Smart City drainage work, traffic from Jaistambh Chowk to Malviya Road will be one-way from Aug 24 to 26. Use Fafadih route as alternative.",
    severity: "HIGH",
  },
  {
    id: "adv-2",
    titleHi: " तेलीबांधा अंडरपास जलभराव अलर्ट",
    titleEn: " Telibandha Underpass Waterlogging Advisory",
    date: "2026-08-24",
    detailHi: "भारी बारिश के कारण तेलीबांधा अंडरपास पर जलभराव की संभावना है। भारी वाहन रिंग रोड 1 का उपयोग करें।",
    detailEn: "Waterlogging likely at Telibandha underpass due to heavy rains. Heavy commercial vehicles advised to use Ring Road 1.",
    severity: "MODERATE",
  },
  {
    id: "adv-3",
    titleHi: " भारी वाहनों का नो-एंट्री समय (शहर सीमा)",
    titleEn: " Heavy Vehicle No-Entry Timings in City Limits",
    date: "2026-08-24",
    detailHi: "सुबह 07:00 बजे से 11:00 बजे तक तथा शाम 05:00 बजे से रात 10:00 बजे तक रायपुर नगर निगम सीमा में भारी मालवाहकों का प्रवेश प्रतिबंधित है।",
    detailEn: "Entry of heavy trucks restricted in Raipur Municipal Corporation limits from 07:00 AM - 11:00 AM & 05:00 PM - 10:00 PM.",
    severity: "INFO",
  },
];

export const LOST_ARTICLE_TYPES = [
  { id: "dl", hi: "ड्राइविंग लाइसेंस (DL)", en: "Driving License (DL)" },
  { id: "rc", hi: "वाहन पंजीयन (RC Book)", en: "Vehicle RC Book" },
  { id: "mobile", hi: "मोबाइल फोन", en: "Mobile Phone" },
  { id: "wallet", hi: "वॉलेट / दस्तावेज", en: "Wallet / Documents" },
  { id: "helmet", hi: "हेलमेट / एक्सेसरीज", en: "Helmet / Vehicle Accessories" },
];
