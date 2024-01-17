import React from "react";
import { Table } from "antd";
import { Survey } from "../services/Survey";
import { SurveyLeg } from "../services/SurveyLeg";

interface SurveyTableProps {
  survey: Survey;
}

const SurveyTable: React.FC<SurveyTableProps> = ({ survey }) => {
  const columns = [
    {
      title: "From Station",
      dataIndex: "fromStation",
      key: "fromStation",
    },
    {
      title: "To Station",
      dataIndex: "toStation",
      key: "toStation",
    },
    {
      title: "Front Sight Azimuth",
      dataIndex: "frontSightAzimuth",
      key: "frontSightAzimuth",
    },
    {
      title: "Front Sight Inclination",
      dataIndex: "frontSightInclination",
      key: "frontSightInclination",
    },
    {
      title: "Front Sight Distance",
      dataIndex: "frontSightDistance",
      key: "frontSightDistance",
    },
    {
      title: "Back Sight Azimuth",
      dataIndex: "backSightAzimuth",
      key: "backSightAzimuth",
    },
    {
      title: "Back Sight Inclination",
      dataIndex: "backSightInclination",
      key: "backSightInclination",
    },
    {
      title: "Back Sight Distance",
      dataIndex: "backSightDistance",
      key: "backSightDistance",
    },
    {
      title: "Left",
      dataIndex: "left",
      key: "left",
    },
    {
      title: "Right",
      dataIndex: "right",
      key: "right",
    },
    {
      title: "Up",
      dataIndex: "up",
      key: "up",
    },
    {
      title: "Down",
      dataIndex: "down",
      key: "down",
    },
    // Add any additional columns as needed
  ];

  const dataSource = survey.legs.map((leg: SurveyLeg, index: number) => ({
    key: index,
    fromStation: leg.fromStation.name,
    toStation: leg.toStation.name,
    frontSightAzimuth: leg.frontSight.azimuth,
    frontSightInclination: leg.frontSight.inclination,
    frontSightDistance: leg.frontSight.distance,
    backSightAzimuth: leg.backSight?.azimuth,
    backSightInclination: leg.backSight?.inclination,
    backSightDistance: leg.backSight?.distance,
    left: leg.left,
    right: leg.right,
    up: leg.up,
    down: leg.down,
    // Map any additional data fields here
  }));

  return <Table dataSource={dataSource} columns={columns} />;
};

export default SurveyTable;
