export class ExtractionService {}

export class Survey {
  private legs: SurveyLeg[] = [];
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

export class SurveyStation {
  constructor(public name: string, public splays: SurveyMeasurements[] = []) {}
}

export class SurveyLeg {
  constructor(
    public fromStation: SurveyStation,
    public toStation: SurveyStation,
    public frontSight: SurveyMeasurements,
    public backSight: SurveyMeasurements | null = null,
    public left: number | null = null,
    public right: number | null = null,
    public up: number | null = null,
    public down: number | null = null
  ) {}

  public extractLruds(): void {}

  public extractBacksight(): void {
    if (!this.fromStation || !this.toStation || !this.frontSight) {
      return; // Invalid data, cannot calculate backsight
    }

    // Calculate backsight azimuth
    const expectedBacksightAzimuth = this.calculateBacksightAzimuth(
      this.frontSight.azimuth
    );

    // Calculate backsight inclination
    const exectedBacksightInclination = this.calculateBacksightInclination(
      this.frontSight.inclination
    );

    // Calculate backsight distance
    const exectedBacksightDistance = this.frontSight.distance;

    // Check if backsight measurements are within tolerance
    const azimuthTolerance = 5; // degrees
    const inclinationTolerance = 5; // degrees
    const distanceTolerance = 1; // foot

    this.toStation.splays.forEach((splay) => {
      if (
        this.isWithinTolerance(
          splay.azimuth,
          expectedBacksightAzimuth,
          azimuthTolerance
        ) &&
        this.isWithinTolerance(
          splay.inclination,
          exectedBacksightInclination,
          inclinationTolerance
        ) &&
        this.isWithinTolerance(
          splay.distance,
          exectedBacksightDistance,
          distanceTolerance
        )
      ) {
        if (this.backSight) {
          this.backSight.azimuth = expectedBacksightAzimuth;
          this.backSight.inclination = exectedBacksightInclination;
          this.backSight.distance = exectedBacksightDistance;
        } else {
          this.backSight = new SurveyMeasurements(
            exectedBacksightDistance,
            expectedBacksightAzimuth,
            exectedBacksightInclination
          );
        }
      }
    });
  }

  private calculateBacksightAzimuth(azimuth: number): number {
    let backsightAzimuth = azimuth + 180;
    if (backsightAzimuth >= 360) {
      backsightAzimuth -= 360;
    }
    return backsightAzimuth;
  }

  private calculateBacksightInclination(inclination: number): number {
    return -inclination;
  }

  private isWithinTolerance(
    value: number,
    target: number,
    tolerance: number
  ): boolean {
    return Math.abs(value - target) <= tolerance;
  }
}

export class SurveyMeasurements {
  constructor(
    public distance: number,
    public azimuth: number,
    public inclination: number
  ) {}
}
