export type Room = "blue" | "red";

export const isRoom = (room: string): room is Room => {
  return room === "blue" || room === "red";
};
