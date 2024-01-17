import { SurveyMeasurements } from "./SurveyMeasurements";
import { SurveyStation } from "./SurveyStation";

export class SurveyLeg {
  private static upThreshold: number = 45;
  private static downThreshold: number = -45;

  // between up and down
  private static isCloseToSideways = (
    value: number | null | undefined
  ): boolean => {
    return !this.isCloseToUp(value) && !this.isCloseToDown(value);
  };

  private static isCloseToUp = (value: number | null | undefined): boolean => {
    if (!value) {
      return false;
    }
    return value > SurveyLeg.upThreshold;
  };

  private static isCloseToDown = (
    value: number | null | undefined
  ): boolean => {
    if (!value) {
      return false;
    }
    return value < SurveyLeg.downThreshold;
  };

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

  public extractLruds(): void {
    const splays = this.toStation.splays;

    for (let i = 0; i < splays.length - 1; i++) {
      const lefSplay = splays[i] ? splays[i] : null;
      const rightSplay = splays[i + 1] ? splays[i + 1] : null;
      const upSplay = splays[i + 2] ? splays[i + 2] : null;
      const downSplay = splays[i + 3] ? splays[i + 3] : null;

      if (
        SurveyLeg.isCloseToSideways(lefSplay?.inclination) &&
        SurveyLeg.isCloseToSideways(rightSplay?.inclination) &&
        SurveyLeg.isCloseToUp(upSplay?.inclination) &&
        SurveyLeg.isCloseToDown(downSplay?.inclination)
      ) {
        this.left = lefSplay ? lefSplay.distance : null;
        this.right = rightSplay ? rightSplay.distance : null;

        this.up = upSplay ? upSplay.distance : null;
        this.down = downSplay ? downSplay.distance : null;
        break;
      }
    }
  }

  public extractBacksight(): void {
    // Calculate backsight azimuth
    const expectedBacksightAzimuth = this.calculateExpectedBacksightAzimuth(
      this.frontSight.azimuth
    );

    // Calculate backsight inclination
    const exectedBacksightInclination =
      this.calculateExpectedBacksightInclination(this.frontSight.inclination);

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

  private calculateExpectedBacksightAzimuth(azimuth: number): number {
    let backsightAzimuth = azimuth + 180;
    if (backsightAzimuth >= 360) {
      backsightAzimuth -= 360;
    }
    return backsightAzimuth;
  }

  private calculateExpectedBacksightInclination(inclination: number): number {
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
