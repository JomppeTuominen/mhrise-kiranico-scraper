export interface ResistanceMap {
  [key: number]: string;
}
export type Armor = {
  id?: string;
  name: string;
  defense?: number;
  resistances: { [key: string]: number };
  slots: { level_1: number; level_2: number; level_3: number };
  skills: Array<string>,
};

export default Armor;