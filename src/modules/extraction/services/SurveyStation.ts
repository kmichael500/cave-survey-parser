import { SurveyMeasurements } from "./SurveyMeasurements";

export class SurveyStation {
  constructor(public name: string, public splays: SurveyMeasurements[] = []) {}

  public getDisplayName(): string {
    return this.name.split("@")[0].toUpperCase();
  }
}
