import { constants } from "./types";

export interface User {
  name: string,
  id: string,
  roomId: string
}

export const createUser = function(name: string): User {
  return {
    name: name,
    id: "id-is-created-by-server",
    roomId: constants.LOBBY
  }
}