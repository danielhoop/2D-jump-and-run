/* class User {
  name: string;
  id: string;

  constructor(name: string) {
    this.name = name;
    this.id = "1" + Math.floor(Math.random() * 1000000000);
  }

}

export default User; */

export interface User {
  name: string,
  id: string
}

export const createUser = function(name: string): User {
  return {
    name: name,
    id: "1" + Math.floor(Math.random() * 1000000000000)
  }
}