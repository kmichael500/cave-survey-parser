import React from "react";
import { Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import {
  Survey,
  SurveyLeg,
  SurveyMeasurements,
  SurveyStation,
} from "./modules/extraction/services/ExtractionService";

const { Dragger } = Upload;

const App: React.FC = () => {
  const handleFileUpload = (file: any) => {
    Papa.parse<string[]>(file, {
      complete: function (results) {
        const data = results.data;
        // Process the CSV data here
        const processedData = data
          .filter(
            (row: string[] | unknown) => Array.isArray(row) && row[0][0] !== "#"
          )
          .map((row: string[]) => {
            return {
              from: row[0],
              to: row[1],
              tape: row[2],
              compass: row[3],
              inclination: row[4],
              // 'extend' field is ignored
            };
          });

        var survey = new Survey();
        // loop over processedData and add to database
        processedData.forEach((row) => {
          var toStation = row.to !== "-" ? row.to : null;
          var isLeg = toStation !== null;

          var distance = parseFloat(row.tape);
          var azimuth = parseFloat(row.compass);
          var inclination = parseFloat(row.inclination);
          var surveyMeasurements = new SurveyMeasurements(
            distance,
            azimuth,
            inclination
          );

          if (isLeg) {
            survey.addLeg(row.from, toStation as string, surveyMeasurements);
          } else {
            survey.addSplay(row.from, surveyMeasurements);
          }
        });

        console.log(processedData);
        survey.extractLrudsAndBacksights();
        console.log(survey);
      },
      skipEmptyLines: true,
      header: false,
      dynamicTyping: true,
    });

    return false;
  };

  return (
    <Dragger
      beforeUpload={handleFileUpload}
      accept=".csv"
      multiple={false}
      showUploadList={false}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        Click or drag file to this area to upload
      </p>
    </Dragger>
  );
};

export default App;
