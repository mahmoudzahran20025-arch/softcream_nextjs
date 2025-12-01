/**
 * Material Colors - ألوان المواد للخيارات
 * 
 * يحدد لون كل خيار بناءً على اسمه (نكهة، صوص، توبينج...)
 * يُستخدم في OptionCard لعرض لون مميز لكل خيار
 */

// Color mapping based on name keywords
const colorMappings: Array<{ keywords: string[]; color: string }> = [
  // Chocolate variants
  {
    keywords: ['شوكولاته', 'شيكولاته', 'chocolate', 'كاكاو', 'cocoa', 'براوني', 'brownie'],
    color: '#5D4037'
  },
  // Pistachio
  {
    keywords: ['فستق', 'pistachio'],
    color: '#7CB342'
  },
  // Strawberry/Berry
  {
    keywords: ['فراولة', 'strawberry', 'توت', 'berry'],
    color: '#E91E63'
  },
  // Vanilla
  {
    keywords: ['فانيليا', 'vanilla'],
    color: '#FFF8E1'
  },
  // Caramel/Toffee
  {
    keywords: ['كراميل', 'caramel', 'توفي', 'toffee'],
    color: '#FF8F00'
  },
  // Mango
  {
    keywords: ['مانجو', 'mango'],
    color: '#FFB300'
  },
  // Blueberry
  {
    keywords: ['بلوبيري', 'blueberry'],
    color: '#5C6BC0'
  },
  // Oreo/Cookies
  {
    keywords: ['اوريو', 'oreo', 'كوكيز', 'cookie'],
    color: '#37474F'
  },
  // Lotus/Biscoff
  {
    keywords: ['لوتس', 'lotus', 'بسكويت', 'biscoff'],
    color: '#D84315'
  },
  // Nutella/Hazelnut
  {
    keywords: ['نوتيلا', 'nutella', 'بندق', 'hazelnut'],
    color: '#6D4C41'
  },
  // Mint
  {
    keywords: ['نعناع', 'mint'],
    color: '#26A69A'
  },
  // Coffee/Mocha
  {
    keywords: ['قهوة', 'coffee', 'موكا', 'mocha'],
    color: '#4E342E'
  },
  // Lemon
  {
    keywords: ['ليمون', 'lemon'],
    color: '#FDD835'
  },
  // Coconut
  {
    keywords: ['جوز هند', 'coconut'],
    color: '#EFEBE9'
  },
  // Honey
  {
    keywords: ['عسل', 'honey'],
    color: '#FFA000'
  },
  // Sprinkles/Rainbow
  {
    keywords: ['سبرنكلز', 'sprinkles', 'ملون'],
    color: 'rainbow'
  }
]

/**
 * Get material color based on option name
 * @param name - Option name (Arabic or English)
 * @returns Color hex code, 'rainbow' for special case, or null if no match
 */
export function getMaterialColor(name: string): string | null {
  const lower = name.toLowerCase()
  
  for (const mapping of colorMappings) {
    if (mapping.keywords.some(keyword => lower.includes(keyword))) {
      return mapping.color
    }
  }
  
  return null
}

/**
 * Check if color is rainbow (special case for sprinkles)
 */
export function isRainbowColor(color: string | null): boolean {
  return color === 'rainbow'
}

/**
 * Rainbow gradient CSS constants
 */
export const RAINBOW_GRADIENT = 'linear-gradient(180deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #96CEB4, #DDA0DD)'
export const RAINBOW_GRADIENT_135 = 'linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #96CEB4, #DDA0DD)'

export default getMaterialColor
