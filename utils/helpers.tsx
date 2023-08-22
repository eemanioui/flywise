export const distance = (lat1: number, long1: number, lat2: number, long2: number): number => {
  if ((lat1 === lat2) && (long1 === long2)) return 0;

  let radLat1 = Math.PI * lat1/180;
  let radLat2 = Math.PI * lat2/180;
  let theta = long1 - long2;
  let radtheta = Math.PI * theta/180;
  let dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radtheta);

  if (dist > 1) {
    dist = 1;
  }

  dist = Math.acos(dist);
  dist = dist * 180/Math.PI;
  dist = dist * 60 * 1.1515;

  return dist;
};

export const removeClassName = (className: string): void => {
  Array.from(document.getElementsByClassName(className)).forEach(element => 
    element.classList.remove(className)
  );
}