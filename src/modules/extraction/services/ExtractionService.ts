import Papa from "papaparse";
import { Survey } from "./Survey";
import { SurveyMeasurements } from "./SurveyMeasurements";

class ExtractionService {
  static parseCSV(file: File): Promise<Survey> {
    return new Promise((resolve, reject) => {
      Papa.parse<string[]>(file, {
        complete: (results) => {
          const processedData = ExtractionService.processData(results.data);
          const survey = ExtractionService.createSurvey(processedData);
          resolve(survey);
        },
        skipEmptyLines: true,
        header: false,
        dynamicTyping: true,
        error: (error) => reject(error),
      });
    });
  }

  private static processData(data: string[][]): CsvRow[] {
    return data
      .filter((row) => Array.isArray(row) && row[0][0] !== "#") // filter out comments
      .map(
        (row) =>
          ({
            from: this.getDisplayName(row[0]),
            to: this.getDisplayName(row[1]),
            tape: row[2],
            compass: row[3],
            inclination: row[4],
          } as CsvRow)
      );
  }

  private static createSurvey(data: CsvRow[]): Survey {
    const survey = new Survey();
    data.forEach((row) => {
      const toStation = row.to !== "-" ? row.to : null;
      const isLeg = toStation !== null;
      const surveyMeasurements = new SurveyMeasurements(
        parseFloat(row.tape),
        parseFloat(row.compass),
        parseFloat(row.inclination)
      );

      if (isLeg) {
        survey.addLeg(row.from, toStation, surveyMeasurements);
      } else {
        survey.addSplay(row.from, surveyMeasurements);
      }
    });

    survey.extractLrudsAndBacksights();
    return survey;
  }

  private static getDisplayName(name: string): string {
    console.log(name);
    name = name.trim().split("@")[0].toUpperCase();

    return name;
  }
}

export { ExtractionService };

interface CsvRow {
  from: string;
  to: string;
  tape: string;
  compass: string;
  inclination: string;
}
