import React, { useState } from "react";
import { Upload } from "antd";
import { FileUploader } from "./modules/extraction/components/FileUploader";
import { SurveyTable } from "./modules/extraction/components/SurveyTable";
import { Survey } from "./modules/extraction/services/Survey";

const { Dragger } = Upload;

const App: React.FC = () => {
  const [survey, setSurvey] = useState<Survey | null>(null);

  const onParsed = async (survey: Survey): Promise<void> => {
    setSurvey(survey);
  };

  return (
    <div style={{ height: "100vh" }}>
      {!survey && <FileUploader onParsed={onParsed} />}
      {survey && <SurveyTable survey={survey} />}
    </div>
  );
};

export default App;
