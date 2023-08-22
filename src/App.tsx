import { useState, ChangeEvent, FormEvent } from 'react';
import './App.css';
import { routes, airports, findAirport } from './data';
import { distance, removeClassName } from '../utils/helpers';
import { Airport, Route } from './types'; 

const App = (): JSX.Element => {
  const [start, setStart] = useState<string>("");
  const [destination, setDestination] = useState<string>("");

  const handleSubmit = (event: FormEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    const sourceAirport = (document.getElementById("sourceAirport") as HTMLInputElement).value;
    const destinationAirport = (document.getElementById("destinationAirport") as HTMLInputElement).value;

    dijkstra(sourceAirport, destinationAirport);
  };

  const handleChange = (event: ChangeEvent<HTMLSelectElement>, className: string): void => {
    resetPath();
    removeClassName(className);

    const airport = event.target.value;

    if (airport) {
      (document.getElementById(airport) as HTMLElement).classList.add(className);
    }

    if (className === 'sourceAirport') {
      setStart(airport);
    }

    if (className === 'destinationAirport') {
      setDestination(airport);
    }
  };

  const filtered = (): string[] => {
    let paths: Record<string, boolean> = {};

    routes.forEach((route: Route) => {
      let sortedRoute = [route.src, route.dest].sort((a, b) => a.localeCompare(b)).join('-');

      if (!paths[sortedRoute]) {
        paths[sortedRoute] = true;
      }
    });

    return Object.keys(paths);
  };

  const dijkstra = (source: string, destination: string): void => {
    removeClassName('temp');

    let start = findAirport(source) as Airport;

    let shortest: Record<string, number> = {};
    let previous: Record<string, string> = {};

    let unvisited: Airport[] = [];
    let visited: Record<string, boolean> = {};

    shortest[start.code] = 0;

    let current = start;

    while (current) {
      visited[current.code] = true;
      unvisited = unvisited.filter(airport => airport.code !== current.code);

      routes.filter((route: Route) => route.src === current.code || route.dest === current.code).forEach(route => {
        let adjAirport = findAirport(route.dest) as Airport;

        if (!visited[route.dest]) {
          unvisited.push(adjAirport);
        }

        let distToAdj = shortest[current.code] + dist(current, adjAirport);
        if (!shortest[adjAirport.code] || distToAdj < shortest[adjAirport.code]) {
          shortest[adjAirport.code] = distToAdj;
          previous[adjAirport.code] = current.code;
        }
      });

      current = unvisited.sort((a, b) => shortest[a.code] - shortest[b.code])[0];
    }

    let shortestPath: string[] = [];
    let currentCode = destination;

    while (currentCode !== source) {
      shortestPath.unshift(currentCode);
      currentCode = previous[currentCode];
    }

    shortestPath.unshift(source);

    showPath(shortestPath);
  };

  const showPath = (path: string[]): void => {
    resetPath();
    
    for (let i = 1; i < path.length; i++) {
      let p = [path[i - 1], path[i]].sort((a, b) => a.localeCompare(b)).join('-');
      
      setTimeout(() => (document.getElementById(p) as HTMLElement).classList.add("shortPath"), 500 * (i - 1));
    }
  };

  const resetPath = (): void => removeClassName('shortPath');

  const reacheableAirports = (): string[] => {
    let reachableAirports: Record<string, boolean> = {};
    let queue = [start];

    while (queue.length > 0) {
      let current = queue.pop() as string;

      if (!reachableAirports[current] && current !== start) {
        reachableAirports[current] = true;
      }

      routes.filter((route: Route) => route.src === current || route.dest === current)
        .forEach(route => {
          if (!reachableAirports[route.dest] && route.dest !== start && queue.indexOf(route.dest) === -1) {
            queue.push(route.dest);
          }
        });
    }

    let reachable = Object.keys(reachableAirports);

    if (reachable.length === 0) {
      removeClassName('destinationAirport');
    }

    return reachable;
  };

  const dist = (source: Airport, destination: Airport): number => {
    return distance(source.lat, source.long, destination.lat, destination.long);
  };

  const resetFilters = (): void => {
    setStart('');
    setDestination('');
  };

  return (
    <>
      <header className="header">
        <h1 className="title">FlyWise</h1>
      </header>
      <form>
        <p>
          <label>Choose Starting Airport:
            <select id="sourceAirport" name="sourceAirport" onChange={e => handleChange(e, "sourceAirport")}>
              <option value="">Select Airport</option>
              {airports.sort((a, b) => a.name.localeCompare(b.name))
                .map(airport => 
                  <option key={airport.code} value={airport.code}>{airport.name + " (" + airport.code + ")"}</option>
                )}
            </select>
          </label>
        </p>
        <p>
          <label>Choose Destination Airport:
            <select disabled={!start} id='destinationAirport' name='destinationAirport' onChange={e => handleChange(e, 'destinationAirport')}>
              <option value="">Select Airport</option>
              {reacheableAirports().map(code => airports.find(airport => airport.code === code))
                .sort((a, b) => a!.name.localeCompare(b!.name))
                .map(airport => 
                  <option key={airport!.code} value={airport!.code}>{airport!.name + " (" + airport!.code + ")"}</option>
                )}
            </select>
          </label>
        </p>
        <button disabled={!destination} type="submit" onClick={handleSubmit}>Run Dijkstra's Algorithm</button>
        <button onClick={resetFilters}>Reset</button>
      </form>
      <br />
      <br />
      <svg className='map' preserveAspectRatio="none" viewBox='-180 -90 360 180'>
        <g transform='scale(1 -1)'>
          <image xlinkHref='equirectangular_world.jpg' href='equirectangular_world.jpg' x='-180' y='-90' height='100%' width='100%' transform='scale(1 -1)' />
          {
            filtered().map(path => {
              const airportsInPath = path.split('-');
              const airportA = findAirport(airportsInPath[0]) as Airport;
              const airportB = findAirport(airportsInPath[1]) as Airport;

              const x1 = airportA.long;
              const y1 = airportA.lat;
              const x2 = airportB.long;
              const y2 = airportB.lat;

              return (
                  <g key={path}>
                    <path d={`M${x1} ${y1} L ${x2} ${y2}`} id={path} />
                  </g>
                );
            })}

            {
              airports.map(airport => {
              return (
                <g key={airport.code}>
                  <circle className='airport' id={airport.code} cx={airport.long} cy={airport.lat}>
                    <title>{airport.name}</title>
                  </circle>
                </g>
              )
            })}
        </g>
      </svg>
    </>
  );
}

export default App;