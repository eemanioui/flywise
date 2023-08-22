export interface Airport {
  code: string;
  name: string;
  lat: number;
  long: number;
}

export interface Route {
  src: string;
  dest: string;
  airline: number;
}


export interface Airline {
  id: number;
  name: string;
}