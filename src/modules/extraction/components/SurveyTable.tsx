import React from "react";
import { Table } from "antd";
import { Survey } from "../services/Survey";
import { SurveyLeg } from "../services/SurveyLeg";
import { SurveyStation } from "../services/SurveyStation";
import { SurveyMeasurements } from "../services/SurveyMeasurements";
import { ColumnType } from "antd/es/table";

interface SurveyTableProps {
  survey: Survey;
}

const SurveyTable: React.FC<SurveyTableProps> = ({ survey }) => {
  const columns = [
    {
      title: "From Station",
      dataIndex: "fromStationName",
      key: "fromStationName",
    },
    {
      title: "To Station",
      dataIndex: "toStationName",
      key: "toStatoStationNametion",
    },
    {
      title: "Front Sight Distance",
      dataIndex: "frontSightDistance",
      key: "frontSightDistance",
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
      title: "Back Sight Azimuth",
      dataIndex: "backSightAzimuth",
      key: "backSightAzimuth",
    },
    {
      title: "Back Sight Distance",
      dataIndex: "backSightDistance",
      key: "backSightDistance",
    },
    {
      title: "Back Sight Inclination",
      dataIndex: "backSightInclination",
      key: "backSightInclination",
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
  ] as ColumnType<SurveyLegTableRecord>[];

  const expandedRowRender = (record: SurveyLegTableRecord) => {
    const splayColumns = [
      { title: "Distance", dataIndex: "distance", key: "distance" },
      { title: "Azimuth", dataIndex: "azimuth", key: "azimuth" },
      { title: "Inclination", dataIndex: "inclination", key: "inclination" },
    ] as ColumnType<SurveySplayTableRecord>[];

    const splayData = record.splays.map((splay, index) => ({
      key: index,
      distance: splay.distance,
      azimuth: splay.azimuth,
      inclination: splay.inclination,
    }));

    return (
      <Table columns={splayColumns} dataSource={splayData} pagination={false} />
    );
  };

  const dataSource = survey.legs.map(
    (leg: SurveyLeg, index: number) =>
      ({
        key: index,
        splays: leg.toStation.splays,
        fromStationName: leg.fromStation.getDisplayName(),
        toStationName: leg.toStation.getDisplayName(),
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
      } as SurveyLegTableRecord)
  );

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      expandable={{ expandedRowRender }}
    />
  );
};

export { SurveyTable };

export interface SurveyLegTableRecord {
  key: number;
  splays: SurveyMeasurements[];
  fromStationName: string;
  toStationName: string;
  frontSightAzimuth: number;
  frontSightInclination: number;
  frontSightDistance: number;
  backSightAzimuth?: number;
  backSightInclination?: number;
  backSightDistance?: number;
  left?: number;
  right?: number;
  up?: number;
  down?: number;
}

export interface SurveySplayTableRecord {
  key: number;
  distance: number;
  azimuth: number;
  inclination: number;
}
