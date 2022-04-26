const pathToId = (path: string): string => (
  `${path.substr(0, 8)}-${path.substr(8, 4)}-${path.substr(12, 4)}-${path.substr(16, 4)}-${path.substr(20)}`);


export default (id: string): string => (id.includes('-') ? id : pathToId(id));
