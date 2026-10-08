interface AgencyLike {
  code?: string | null;
  name?: string | null;
}

const agencyColors: Record<string, string> = {
  SF: '#CD3545', // SF Muni
  SM: '#00529B', // SamTrans
  GF: '#426C3E', // Golden Gate Ferry
  GG: '#426C3E', // Golden Gate Transit
  CT: '#DB1734', // Caltrain
  BA: '#0099D8', // BART
  AC: '#006B54', // AC Transit
  SB: '#0A4E86', // SF Bay Ferry
  CC: '#FFB944', // County Connection
  WH: '#02354C', // Wheels (LAVTA)
  DE: '#007AFF', // Dumbarton Express
  SC: '#4CB4E7', // VTA
  ST: '#2C8736', // SolTrans
  VN: '#E77342', // Vine Transit
  SO: '#193888', // Sonoma County Transit
  SR: '#035B91', // Santa Rosa CityBus
  SA: '#104432', // SMART
  '3D': '#004B8F', // Tri Delta Transit
  FS: '#064F8F', // FAST
  EM: '#FFA801', // Emery Go-Round
  EE: '#FFA801', // Emery Express
  PG: '#1F4D25', // Presidio Go
  MA: '#3DAE2B', // Marin Transit
  PE: '#3C5D9E', // Petaluma Transit
  WC: '#0057A5', // WestCAT
  SI: '#009ADE', // SFO
  MV: '#7CC144', // MVgo
  AM: '#00537E', // Capitol Corridor
  CE: '#78217D', // ACE
  VC: '#19A1DB', // Vacaville City Coach
  UC: '#141972', // Union City Transit
  SL: '#58B7DD', // San Leandro LINKS
  CM: '#4AB1E5', // commute.org
  GP: '#698C38', // sf parks and rec
  AF: '#0A4A72', // angel island tiburon ferry
  SE: '#D14629', // solano ta
  SS: '#67CDD9', // south city
  TF: '#FD8E21', // treasure island ferry
  MB: '#2558A7', // mission bay shuttle
  RV: '#80A4E0', // rio vista
  SU: '#8C1515', // stanford
  // Beyond 511, merged by the API (predict/gtfs/extra.go)
  UF: '#052049', // UCSF shuttles (UCSF navy)
  GN: '#005596', // Genentech gRide
  SZ: '#FFCD00', // Santa Cruz METRO
  MS: '#0272BC', // Monterey-Salinas Transit
  UT: '#BE3634', // Unitrans
  MT: '#1E1A4C', // Mendocino Transit
  MX: '#234672', // StaRT (Modesto)
  SJ: '#97002E', // San Joaquin RTD
  RT: '#002469', // SacRT
  EG: '#F6AE1B', // SacRT Elk Grove (e-tran)
  GR: '#FFE100', // Gold Runner
  TR: '#FFE100', // Tracy TRACER
  // Seattle consolidated agency (the backend's OBA region, currently disabled)
  '40': '#2B376E' // Sound Transit
};

/** Agency code → route short name → the colour that route owns. Wins over the agency fallback. */
const routeColors: Record<string, Record<string, string>> = {
  SF: {
    J: '#DF8719',
    K: '#579BBE',
    KBUS: '#579BBE',
    L: '#942593',
    LBUS: '#942593',
    LOWL: '#942593',
    M: '#03814E',
    N: '#084E75',
    NBUS: '#084E75',
    NOWL: '#084E75',
    T: '#D01245',
    TBUS: '#D01245',
    F: '#6D4300',
    FBUS: '#6D4300',
    PM: '#911515',
    PH: '#911515',
    CA: '#911515'
  },
  AC: {
    '1T': '#6B1984'
  },
  BA: {
    'Red-N': '#ED1C24',
    'Red-S': '#ED1C24',
    'Orange-N': '#FAA61A',
    'Orange-S': '#FAA61A',
    'Yellow-N': '#FFE600',
    'Yellow-S': '#FFE600',
    'Green-N': '#359A35',
    'Green-S': '#339933',
    'Blue-N': '#00A6E9',
    'Blue-S': '#00A6E9',
    'Grey-N': '#B0BEC7',
    'Grey-S': '#B0BEC7'
  },
  SC: {
    'Blue Line': '#2CB6E7',
    BlueS: '#2CB6E7',
    'Green Line': '#A1CF67',
    GreenS: '#A1CF67',
    'Orange Line': '#F89923',
    OrangeW: '#F89923',
    OrangeE: '#F89923'
  },
  ST: {
    R: '#D63029',
    Y: '#FDB415',
    G: '#50A140',
    B: '#004D91'
  },
  MC: {
    RED: '#FF2B0A',
    GRAY: '#8C8C88'
  },
  RT: {
    Blue: '#243386',
    Gold: '#FFB728',
    Green: '#02A14E'
  },
  UF: {
    BL: '#286EBB',
    BZ: '#C64C2A',
    CH: '#811B54',
    GD: '#BC9130',
    GN: '#017142',
    GY: '#8A8C90',
    LI: '#945AA9',
    LM: '#85BE32',
    NV: '#0F398A',
    OR: '#FC6E1E',
    PK: '#E70088',
    RD: '#DA1047',
    VA: '#2C2528'
  },
  '40': {
    '1 Line': '#3DAE2B',
    '2 Line': '#00A0DF',
    'T Line': '#F38B00',
    'ST Express': '#2B376E'
  }
};

const legacyAgencyColors: Record<string, string> = {
  'san diego mts': '#DE2B26',
  'north county transit district': '#088C99',
  'la metro': '#262626',
  ladot: '#0D47A1',
  'long beach transit': '#D62028',
  'foothill transit': '#1A87BC',
  'pasadena transit': '#1BA6BC'
};

const legacyRouteColors: Record<string, Record<string, string>> = {
  'san diego mts': {
    'Blue Line': '#0070BF',
    'Green Line': '#32BB6A',
    'Orange Line': '#FFA532',
    Copper: '#C0835B'
  },
  'la metro': {
    'A Line': '#0073BD',
    'B Line': '#E40B14',
    'C Line': '#57A935',
    'D Line': '#A25DA7',
    'E Line': '#F7B710',
    'G Line': '#FC4B00',
    'J Line': '#AEB9C0',
    'K Line': '#EA6BB2'
  }
};

export const UNKNOWN_COLOR = '#424242';

export function getVehicleColorForAgency(
  routeShortName: string | null | undefined,
  agency: AgencyLike | null | undefined
): string {
  const code = agency?.code;
  if (code) {
    const routeMap = routeColors[code];
    if (routeMap && routeShortName && routeMap[routeShortName]) {
      return routeMap[routeShortName];
    }
    if (code === 'SC' && routeShortName?.includes('Rapid')) return '#E4002B';
    if (agencyColors[code]) return agencyColors[code];
  }

  const nameKey = agency?.name?.toLowerCase();
  if (nameKey) {
    const routeMap = legacyRouteColors[nameKey];
    if (routeMap && routeShortName && routeMap[routeShortName]) {
      return routeMap[routeShortName];
    }
    if (legacyAgencyColors[nameKey]) return legacyAgencyColors[nameKey];
  }

  return UNKNOWN_COLOR;
}

export function needsDarkInk(hex: string): boolean {
  const value = parseInt(hex.replace('#', ''), 16);
  const r = ((value >> 16) & 0xff) / 255;
  const g = ((value >> 8) & 0xff) / 255;
  const b = (value & 0xff) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.62;
}
