import React, { useContext, useState } from "react";
import {
  Button,
  Form,
  FormInstance,
  Input,
  Table,
  TableColumnsType,
} from "antd";
import { Survey } from "../services/Survey";
import { SurveyLeg } from "../services/SurveyLeg";
import { SurveyMeasurements } from "../services/SurveyMeasurements";
import { ColumnGroupType, ColumnType } from "antd/es/table";
import { SurveyStation } from "../services/SurveyStation";
import Papa from "papaparse";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

const EditableRow = ({ index, ...props }: { index: number }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: any; // Ideally, define a more specific type instead of 'any'
  handleSave: (record: any) => void; // Again, use a more specific type if possible
}

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}: EditableCellProps) => {
  const [editing, setEditing] = useState(false);
  const form = useContext(EditableContext);

  const toggleEdit = () => {
    setEditing(!editing);
    form?.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form?.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

interface SurveyTableProps {
  survey: Survey;
}

const SurveyTable: React.FC<SurveyTableProps> = ({ survey }) => {
  const [dataSource, setDataSource] = useState(
    survey.legs.map(
      (leg: SurveyLeg, index: number) =>
      ({
        key: `${leg.fromStation.name}-${leg.toStation.name}}`,
        splays: leg.toStation.splays,
        fromStationName: leg.fromStation.name,
        toStationName: leg.toStation.name,
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
        passageHeight: leg.passageHeight,
      } as SurveyLegTableRecord)
    )
  );

  const handleSave = (row: SurveyLegTableRecord) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);
  };

  const columns: SurveyLegTableRecord[] = [
    {
      title: "From Station",
      dataIndex: "fromStationName",
      key: "fromStationName",
      editable: true,
    },
    {
      title: "To Station",
      dataIndex: "toStationName",
      key: "toStationName",
      editable: true,
    },
    {
      title: "Cave Survey",
      children: [
        {
          title: "Distance",
          editable: true,
          children: [
            {
              title: "Front Sight",
              dataIndex: "frontSightDistance",
              key: "frontSightDistance",
              editable: true,
            },
            {
              title: "Back Sight",
              dataIndex: "backSightDistance",
              key: "backSightDistance",
              editable: true,
            },
          ],
        },
        {
          title: "Azimuth",
          children: [
            {
              title: "Front Sight",
              dataIndex: "frontSightAzimuth",
              key: "frontSightAzimuth",
              editable: true,
            },
            {
              title: "Back Sight",
              dataIndex: "backSightAzimuth",
              key: "backSightAzimuth",
              editable: true,
            },
          ],
        },
        {
          title: "Vertical Angle",
          children: [
            {
              title: "Front Sight",
              dataIndex: "frontSightInclination",
              key: "frontSightInclination",
              editable: true,
            },
            {
              title: "Back Sight",
              dataIndex: "backSightInclination",
              key: "backSightInclination",
              editable: true,
            },
          ],
        },
      ],
    },

    {
      title: "Left",
      dataIndex: "left",
      key: "left",
      editable: true,
    },
    {
      title: "Right",
      dataIndex: "right",
      key: "right",
      editable: true,
    },
    {
      title: "Up",
      dataIndex: "up",
      key: "up",
      editable: true,
    },
    {
      title: "Down",
      dataIndex: "down",
      key: "down",
      editable: true,
    },
    {
      title: "Passage Height",
      dataIndex: "passageHeight",
      key: "passageHeight",
      editable: true,
    }
  ];

  const expandedRowRender = (record: SurveyLegTableRecord) => {
    const splayColumns = [
      { title: "Distance", dataIndex: "distance", key: "distance" },
      { title: "Azimuth", dataIndex: "azimuth", key: "azimuth" },
      { title: "Inclination", dataIndex: "inclination", key: "inclination" },
    ] as ColumnType<SurveySplayTableRecord>[];

    const splayData = record.splays?.map((splay, index) => ({
      key: index,
      distance: splay.distance,
      azimuth: splay.azimuth,
      inclination: splay.inclination,
    }));

    return (
      <Table columns={splayColumns} dataSource={splayData} pagination={false} />
    );
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const applyEditableCellProps = (cols: any[]): any[] => {
    return cols.map((col) => {
      if (col.children) {
        return {
          ...col,
          children: applyEditableCellProps(col.children),
        };
      }
      if (col.editable) {
        return {
          ...col,
          onCell: (record: any) => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave: (e: SurveyLegTableRecord) => {
              handleSave(e);
              //   if (
              //     e.fromStationName &&
              //     e.toStationName &&
              //     e.frontSightDistance &&
              //     e.frontSightAzimuth &&
              //     e.frontSightInclination
              //   ) {
              //     const fromStation = new SurveyStation(e.fromStationName);
              //     const toStation = new SurveyStation(e.toStationName);
              //     toStation.splays = e.splays ?? [];
              //     const fronSight = new SurveyMeasurements(
              //       e.frontSightDistance,
              //       e.frontSightAzimuth,
              //       e.frontSightInclination
              //     );
              //     const backSight = new SurveyMeasurements(
              //       e.backSightDistance,
              //       e.backSightAzimuth,
              //       e.backSightInclination
              //     );
              //     var leg = new SurveyLeg(
              //       fromStation,
              //       toStation,
              //       fronSight,
              //       backSight
              //     );
              //     leg.left = e.left;
              //     leg.right = e.right;
              //     leg.up = e.up;
              //     leg.down = e.down;
              //   }
            },
          }),
        };
      }
      return col;
    });
  };

  const mappedColumns = applyEditableCellProps(columns);

  const handleSubmit = (withSplays = true) => {
    // Here, you can add validation or processing before submission
    // For example, check if all required fields are filled
    const isValid = dataSource.every((row) => {
      var valid =
        row.fromStationName &&
        row.toStationName &&
        row.frontSightDistance !== undefined &&
        row.frontSightAzimuth !== undefined &&
        row.frontSightInclination !== undefined;
      if (!valid) {
        console.log(row);
      }
      return valid;
    });

    if (!isValid) {
      alert("Please fill in all required fields.");
      return;
    }

    // define the model
    let processedData = [] as {
      "From Station": string | undefined;

      "To Station": string | undefined;
      Distance: number | undefined;
      Azimuth: number | undefined;
      Inclination: number | undefined;
      "Back Sight Distance": number | undefined;
      "Back Sight Azimuth": number | undefined;
      "Back Sight Inclination": number | undefined;
      Left: number | undefined;
      Right: number | undefined;
      Up: number | undefined;
      Down: number | undefined;
    }[];

    dataSource.forEach((leg) => {
      // Add the main leg data
      const legData = {
        "From Station": leg.fromStationName,
        "To Station": leg.toStationName,
        Distance: leg.frontSightDistance,
        Azimuth: leg.frontSightAzimuth,
        Inclination: leg.frontSightInclination,
        "Back Sight Distance": leg.backSightDistance,
        "Back Sight Azimuth": leg.backSightAzimuth,
        "Back Sight Inclination": leg.backSightInclination,
        Left: leg.left,
        Right: leg.right,
        Up: leg.up,
        Down: leg.down,
      };
      processedData.push(legData);

      if (!withSplays) {
        return;
      }

      // Add splay data immediately after the corresponding leg
      if (leg.splays) {
        leg.splays.forEach((splay) => {
          const splayData = {
            "From Station": leg.toStationName,
            "To Station": undefined,

            Distance: splay.distance,
            Azimuth: splay.azimuth,
            Inclination: splay.inclination,
            "Back Sight Distance": undefined,
            "Back Sight Azimuth": undefined,
            "Back Sight Inclination": undefined,
            Left: undefined,
            Right: undefined,
            Up: undefined,
            Down: undefined,
          };
          processedData.push(splayData);
        });
      }
    });

    const csv = Papa.unparse(processedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "survey_data.csv";
    link.click();
  };

  return (
    <div>
      <Button
        onClick={() => {
          handleSubmit();
        }}
      >
        Download With Splays
      </Button>
      <Button
        onClick={() => {
          handleSubmit(false);
        }}
      >
        Download Without Splays
      </Button>

      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={mappedColumns}
        expandable={{ expandedRowRender }}
        pagination={false}
        scroll={{ y: "100%" }}
      />
    </div>
  );
};

export { SurveyTable };

export interface SurveyLegTableRecord {
  title?: string;
  key?: string;
  dataIndex?: keyof SurveyLegTableRecord;
  editable?: boolean;
  splays?: SurveyMeasurements[];
  fromStationName?: string;

  toStationName?: string;
  frontSightAzimuth?: number;
  frontSightInclination?: number;
  frontSightDistance?: number;
  backSightAzimuth?: number;
  backSightInclination?: number;
  backSightDistance?: number;
  left?: number;
  right?: number;
  up?: number;
  down?: number;
  passageHeight?: number;
  children?: SurveyLegTableRecord[];
}

export interface SurveySplayTableRecord {
  key: number;
  distance?: number;
  azimuth?: number;
  inclination?: number;
}
