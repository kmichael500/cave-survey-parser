import { SurveyLeg } from "./SurveyLeg";
import { SurveyMeasurements } from "./SurveyMeasurements";
import { SurveyStation } from "./SurveyStation";

export class Survey {
  public legs: SurveyLeg[] = [];

  private stationMap: Map<string, SurveyStation> = new Map();

  constructor() {}

  replaceLeg(
    oldFromStationName: string,
    oldToStationName: string,
    newLeg: SurveyLeg
  ): void {
    oldFromStationName = this.normalizeStationName(oldFromStationName);
    oldToStationName = this.normalizeStationName(oldToStationName);
    // Find the index of the leg to replace
    const legIndex = this.legs.findIndex(
      (leg) =>
        this.normalizeStationName(leg.fromStation.name) ===
          oldFromStationName &&
        this.normalizeStationName(leg.toStation.name) === oldToStationName
    );

    if (legIndex === -1) {
      throw new Error("Leg does not exist between the specified stations");
    }

    // Replace the leg
    this.legs[legIndex] = newLeg;

    // Update the station map with new stations from the new leg
    this.updateStation(oldFromStationName, newLeg.fromStation);
    this.updateStation(oldToStationName, newLeg.toStation);
  }

  updateStation(oldStationName: string, station: SurveyStation): void {
    oldStationName = this.normalizeStationName(oldStationName);

    if (!this.stationMap.has(oldStationName)) {
      throw new Error("Station does not exist");
    }

    // Replace the station in the station map
    this.stationMap.set(oldStationName, station);

    // Update any legs that reference the old station
    this.legs.forEach((leg) => {
      if (
        this.normalizeStationName(leg.fromStation.name) ===
        this.normalizeStationName(oldStationName)
      ) {
        leg.fromStation = station;
      }
      if (leg.toStation.name === oldStationName) {
        leg.toStation = station;
      }
    });
  }

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
    return name.trim().toUpperCase();
  }
}
