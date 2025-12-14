// IATA airline code to full name and booking URL mapping
export const airlineNames = {
  // Major US Carriers
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines',
  'UA': 'United Airlines',
  'WN': 'Southwest Airlines',
  'AS': 'Alaska Airlines',
  'B6': 'JetBlue Airways',
  'NK': 'Spirit Airlines',
  'F9': 'Frontier Airlines',
  'G4': 'Allegiant Air',
  'SY': 'Sun Country Airlines',
  '6X': '6th Sense Aviation',
  
  // European Carriers
  'BA': 'British Airways',
  'LH': 'Lufthansa',
  'AF': 'Air France',
  'KL': 'KLM Royal Dutch Airlines',
  'IB': 'Iberia',
  'AZ': 'ITA Airways',
  'SN': 'Brussels Airlines',
  'LX': 'Swiss International Air Lines',
  'OS': 'Austrian Airlines',
  'SK': 'Scandinavian Airlines',
  'AY': 'Finnair',
  'TP': 'TAP Air Portugal',
  'EI': 'Aer Lingus',
  'FR': 'Ryanair',
  'U2': 'easyJet',
  'VY': 'Vueling',
  
  // Middle Eastern Carriers
  'EK': 'Emirates',
  'EY': 'Etihad Airways',
  'QR': 'Qatar Airways',
  'TK': 'Turkish Airlines',
  'VF': 'AJet',
  'MS': 'EgyptAir',
  'RJ': 'Royal Jordanian',
  'GF': 'Gulf Air',
  'WY': 'Oman Air',
  'SV': 'Saudia',
  
  // Asian Carriers
  'SQ': 'Singapore Airlines',
  'CX': 'Cathay Pacific',
  'TG': 'Thai Airways',
  'NH': 'All Nippon Airways',
  'JL': 'Japan Airlines',
  'KE': 'Korean Air',
  'OZ': 'Asiana Airlines',
  'BR': 'EVA Air',
  'CI': 'China Airlines',
  'CZ': 'China Southern Airlines',
  'MU': 'China Eastern Airlines',
  'CA': 'Air China',
  'HU': 'Hainan Airlines',
  'AI': 'Air India',
  '6E': 'IndiGo',
  'SG': 'SpiceJet',
  'MH': 'Malaysia Airlines',
  'GA': 'Garuda Indonesia',
  'PR': 'Philippine Airlines',
  'VN': 'Vietnam Airlines',
  'OM': 'MIAT Mongolian Airlines',
  
  // Oceania Carriers
  'QF': 'Qantas',
  'VA': 'Virgin Australia',
  'NZ': 'Air New Zealand',
  'FJ': 'Fiji Airways',
  
  // Latin American Carriers
  'LA': 'LATAM Airlines',
  'AM': 'Aeroméxico',
  'AV': 'Avianca',
  'AR': 'Aerolíneas Argentinas',
  'CM': 'Copa Airlines',
  'G3': 'GOL Linhas Aéreas',
  'JJ': 'LATAM Brasil',
  
  // African Carriers
  'SA': 'South African Airways',
  'ET': 'Ethiopian Airlines',
  'KQ': 'Kenya Airways',
  'AT': 'Royal Air Maroc',
  
  // Canadian Carriers
  'AC': 'Air Canada',
  'WS': 'WestJet',
  'PD': 'Porter Airlines',
  'TS': 'Air Transat',
  
  // Low-Cost Carriers
  'W6': 'Wizz Air',
  'PC': 'Pegasus Airlines',
  'FZ': 'flydubai',
  'BI': 'Royal Brunei Airlines',
  'AK': 'AirAsia',
  'VJ': 'VietJet Air',
  'TR': 'Scoot',
  '5J': 'Cebu Pacific',
  
  // Alliance Members
  'LO': 'LOT Polish Airlines',
  'OK': 'Czech Airlines',
  'RO': 'Tarom',
  'JU': 'Air Serbia',
  'A3': 'Aegean Airlines',
  'OU': 'Croatia Airlines',
};

// Airline booking URLs
export const airlineBookingUrls = {
  // Major US Carriers
  'AA': 'https://www.aa.com',
  'DL': 'https://www.delta.com',
  'UA': 'https://www.united.com',
  'WN': 'https://www.southwest.com',
  'AS': 'https://www.alaskaair.com',
  'B6': 'https://www.jetblue.com',
  'NK': 'https://www.spirit.com',
  'F9': 'https://www.flyfrontier.com',
  'G4': 'https://www.allegiantair.com',
  'SY': 'https://www.suncountry.com',
  '6X': 'https://www.6xaviation.com',
  
  // European Carriers
  'BA': 'https://www.britishairways.com',
  'LH': 'https://www.lufthansa.com',
  'AF': 'https://www.airfrance.com',
  'KL': 'https://www.klm.com',
  'IB': 'https://www.iberia.com',
  'AZ': 'https://www.ita-airways.com',
  'SN': 'https://www.brusselsairlines.com',
  'LX': 'https://www.swiss.com',
  'OS': 'https://www.austrian.com',
  'SK': 'https://www.flysas.com',
  'AY': 'https://www.finnair.com',
  'TP': 'https://www.flytap.com',
  'EI': 'https://www.aerlingus.com',
  'FR': 'https://www.ryanair.com',
  'U2': 'https://www.easyjet.com',
  'VY': 'https://www.vueling.com',
  
  // Middle Eastern Carriers
  'EK': 'https://www.emirates.com',
  'EY': 'https://www.etihad.com',
  'QR': 'https://www.qatarairways.com',
  'TK': 'https://www.turkishairlines.com',
  'MS': 'https://www.egyptair.com',
  'RJ': 'https://www.rj.com',
  'GF': 'https://www.gulfair.com',
  'WY': 'https://www.omanair.com',
  'SV': 'https://www.saudia.com',
  
  // Asian Carriers
  'SQ': 'https://www.singaporeair.com',
  'CX': 'https://www.cathaypacific.com',
  'TG': 'https://www.thaiairways.com',
  'NH': 'https://www.ana.co.jp',
  'JL': 'https://www.jal.co.jp',
  'KE': 'https://www.koreanair.com',
  'OZ': 'https://flyasiana.com',
  'BR': 'https://www.evaair.com',
  'CI': 'https://www.china-airlines.com',
  'CZ': 'https://www.csair.com',
  'MU': 'https://www.ceair.com',
  'CA': 'https://www.airchina.com',
  'HU': 'https://www.hainanairlines.com',
  'AI': 'https://www.airindia.com',
  '6E': 'https://www.goindigo.in',
  'SG': 'https://www.spicejet.com',
  'MH': 'https://www.malaysiaairlines.com',
  'GA': 'https://www.garuda-indonesia.com',
  'PR': 'https://www.philippineairlines.com',
  'VN': 'https://www.vietnamairlines.com',
  
  // Oceania Carriers
  'QF': 'https://www.qantas.com',
  'VA': 'https://www.virginaustralia.com',
  'NZ': 'https://www.airnewzealand.com',
  'FJ': 'https://www.fijiairways.com',
  
  // Latin American Carriers
  'LA': 'https://www.latamairlines.com',
  'AM': 'https://www.aeromexico.com',
  'AV': 'https://www.avianca.com',
  'AR': 'https://www.aerolineas.com.ar',
  'CM': 'https://www.copaair.com',
  'G3': 'https://www.voegol.com.br',
  'JJ': 'https://www.latamairlines.com',
  
  // African Carriers
  'SA': 'https://www.flysaa.com',
  'ET': 'https://www.ethiopianairlines.com',
  'KQ': 'https://www.kenya-airways.com',
  'AT': 'https://www.royalairmaroc.com',
  
  // Canadian Carriers
  'AC': 'https://www.aircanada.com',
  'WS': 'https://www.westjet.com',
  'PD': 'https://www.flyporter.com',
  'TS': 'https://www.airtransat.com',
  
  // Low-Cost Carriers
  'W6': 'https://wizzair.com',
  'PC': 'https://www.flypgs.com',
  'FZ': 'https://www.flydubai.com',
  'BI': 'https://www.bruneiair.com',
  'AK': 'https://www.airasia.com',
  'VJ': 'https://www.vietjetair.com',
  'TR': 'https://www.flyscoot.com',
  '5J': 'https://www.cebupacificair.com',
  
  // Alliance Members
  'LO': 'https://www.lot.com',
  'OK': 'https://www.czechairlines.com',
  'RO': 'https://www.tarom.ro',
  'JU': 'https://www.airserbia.com',
  'A3': 'https://www.aegeanair.com',
  'OU': 'https://www.croatiaairlines.com',
};

export const getAirlineName = (code) => {
  return airlineNames[code] || code;
};

export const getAirlineBookingUrl = (code) => {
  return airlineBookingUrls[code] || null;
};

export const getAirlineLogoUrl = (code) => {
  // Use a free airline logo API
  return `https://images.kiwi.com/airlines/64/${code}.png`;
};

export const formatDuration = (isoDuration) => {
  if (!isoDuration) return 'N/A';
  
  // Parse ISO 8601 duration format (e.g., "PT5H30M")
  const hoursMatch = isoDuration.match(/(\d+)H/);
  const minutesMatch = isoDuration.match(/(\d+)M/);
  
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  
  if (hours && minutes) {
    return `${hours}h ${minutes}m`;
  } else if (hours) {
    return `${hours}h`;
  } else if (minutes) {
    return `${minutes}m`;
  }
  
  return 'N/A';
};
