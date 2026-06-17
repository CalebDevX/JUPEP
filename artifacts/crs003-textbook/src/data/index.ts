import { crs001 } from "./crs001";
import { crs002 } from "./crs002";
import { crs003 } from "./crs003";
import { crs004 } from "./crs004";
import { gov001 } from "./gov001";
import { gov002 } from "./gov002";
import { gov003 } from "./gov003";
import { gov004 } from "./gov004";
import { lit001 } from "./lit001";
import { lit002 } from "./lit002";
import { lit003 } from "./lit003";
import { lit004 } from "./lit004";

export { crs001, crs002, crs003, crs004, gov001, gov002, gov003, gov004, lit001, lit002, lit003, lit004 };

export const allCourses = [crs001, crs002, crs003, crs004, gov001, gov002, gov003, gov004, lit001, lit002, lit003, lit004];

export type Chapter = {
  id: string;
  number: number;
  title: string;
  sections: { heading: string; content: string }[];
  summary: string;
  keyTerms: { term: string; definition: string }[];
  practiceQuestions: string[];
};

export type Course = {
  code: string;
  title: string;
  units: number;
  semester: string;
  color: string;
  colorClass: string;
  lightClass: string;
  borderClass: string;
  textClass: string;
  description: string;
  objectives: string[];
  chapters: Chapter[];
};
