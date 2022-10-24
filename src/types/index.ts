export type MatterDataValue = string | number | boolean | string[] | number[] | null;
export type MatterData = Record<string, MatterDataValue>;

export type DbItemPhoto = {
  href: string;
  w: number;
  h: number;
};

export interface DbItem {
  content: string | null;
  data: MatterData;
  dateCreated: string;
  dateModified: string;
  filepath: string;
  locales: string[];
  photo?: DbItemPhoto;
  slug: string;
}
