import { crs001 } from "./crs001";
import { crs002 } from "./crs002";
import { crs003 } from "./crs003";
import { crs004 } from "./crs004";

export { crs001, crs002, crs003, crs004 };

export const allCourses = [crs001, crs002, crs003, crs004];

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
