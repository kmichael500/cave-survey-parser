import { SurveyLeg } from "./SurveyLeg";
import { SurveyMeasurements } from "./SurveyMeasurements";
import { SurveyStation } from "./SurveyStation";

export class Survey {
  public legs: SurveyLeg[] = [];

  private stationMap: Map<string, SurveyStation> = new Map();

  constructor() {}

  addLeg(
    fromStationName: string,
    toStationName: string,
    measurements: SurveyMeasurements
  ): void {
    if (
      this.legs.some(
        (l) =>
          (l.fromStation.name === fromStationName &&
            l.toStation.name === toStationName) ||
          (l.fromStation.name === toStationName &&
            l.toStation.name === fromStationName)
      )
    ) {
      throw new Error("Leg between these two stations already exists");
    }

    this.tryAddStation(fromStationName);
    this.tryAddStation(toStationName);

    var leg = new SurveyLeg(
      this.findStation(fromStationName)!,
      this.findStation(toStationName)!,
      measurements
    );

    this.legs.push(leg);
  }

  addSplay(fromStationName: string, measurements: SurveyMeasurements): void {
    this.tryAddStation(fromStationName);
    var station = this.findStation(fromStationName);
    if (station) {
      station.splays.push(measurements);
    }
  }

  tryAddStation(name: string): boolean {
    name = this.normalizeStationName(name);
    if (this.stationMap.has(name)) {
      return false;
    }
    this.stationMap.set(name, new SurveyStation(name));
    return true;
  }

  findStation(name: string): SurveyStation | undefined {
    name = this.normalizeStationName(name);
    return this.stationMap.get(name);
  }

  public extractLrudsAndBacksights(): void {
    this.legs.forEach((l) => {
      l.extractLruds();
      l.extractBacksight();
    });
  }

  private normalizeStationName(name: string): string {
    return name.trim().toLocaleLowerCase();
  }
}
