import { SurveyMeasurements } from "./SurveyMeasurements";

export class SurveyStation {
  constructor(public name: string, public splays: SurveyMeasurements[] = []) {}
}
