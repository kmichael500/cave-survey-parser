// FileUploader.js
import React from "react";
import { Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import { ExtractionService } from "../services/ExtractionService";
import { Survey } from "../services/Survey";

const { Dragger } = Upload;

interface FileUploaderProps {
  onParsed: (survey: Survey) => void;
}

const FileUploader = ({ onParsed }: FileUploaderProps) => {
  const handleFileUpload = async (file: RcFile) => {
    const survey = await ExtractionService.parseCSV(file);
    onParsed(survey);

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

export { FileUploader };
