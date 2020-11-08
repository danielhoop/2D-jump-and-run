import { constants } from "./types";

export interface User {
  name: string,
  id: string,
  roomId: string
  groupId: string
}

export const createUser = function(name: string): User {
  return {
    name: "unknown",
    id: undefined,
    roomId: constants.LOBBY,
    groupId: constants.GROUP_0
  }
}