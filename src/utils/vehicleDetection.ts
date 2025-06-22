
export const getVehicleFromProductName = (productName: string): string => {
  const vehicleKeywords = {
    'Toyota Hilux': ['hilux', 'toyota hilux'],
    'Toyota Land Cruiser': ['land cruiser', 'toyota land cruiser', 'fj80', 'fzj80'],
    'Nissan Patrol': ['patrol', 'nissan patrol', 'y62', 'armada'],
    'Mitsubishi L200': ['l200', 'mitsubishi l200']
  };

  const lowercaseName = productName.toLowerCase();
  
  for (const [vehicle, keywords] of Object.entries(vehicleKeywords)) {
    if (keywords.some(keyword => lowercaseName.includes(keyword.toLowerCase()))) {
      return vehicle;
    }
  }
  
  return '';
};

export const getVehicleFromBrand = (brandId: number | null, brands: Array<{id: number; name: string}>): string => {
  if (!brandId) return '';
  
  const brand = brands.find(b => b.id === brandId);
  if (!brand) return '';
  
  const brandVehicleMapping: Record<string, string> = {
    'Toyota': 'Toyota Hilux',
    'Nissan': 'Nissan Patrol',
    'Mitsubishi': 'Mitsubishi L200'
  };
  
  const brandName = brand.name.toLowerCase();
  if (brandName.includes('hilux')) return 'Toyota Hilux';
  if (brandName.includes('land cruiser')) return 'Toyota Land Cruiser';
  if (brandName.includes('patrol')) return 'Nissan Patrol';
  if (brandName.includes('l200')) return 'Mitsubishi L200';
  
  return brandVehicleMapping[brand.name] || '';
};

export const getSpecificPartForVehicle = (vehicle: string): string => {
  const partMap: Record<string, string> = {
    'Toyota Hilux': 'Toyota Hilux Gearbox 5-Speed Manual',
    'Toyota Land Cruiser': 'Tie Rod End Kit for Toyota Land Cruiser FJ80 FzJ80 91-97 Lexus LX450',
    'Nissan Patrol': 'Fit Nissan Patrol Y62 & Armada 5.6L 8 Cyl AT 2010 - 2023 aluminum radiator',
    'Mitsubishi L200': 'Exhaust Pipe Kit Full System for MITSUBISHI L200 2.5L Diesel'
  };
  
  return partMap[vehicle] || '';
};
