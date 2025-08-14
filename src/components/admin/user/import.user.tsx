import { InboxOutlined } from "@ant-design/icons";
import { App, message, Modal, Table, Upload } from "antd";
import type { UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { useState } from "react";
import ExcelJS from "exceljs";
import { bulkCreateUserAPI } from "@/services/api";
import templateFile from "assets/template/user.xlsx"

type TProps = {
  isOpenModalImport: boolean;
  setIsOpenModalImport: (v: boolean) => void;
  reloadData: () => void;
};

interface DataImport {
  fullName: string;
  email: string;
  phone: string;
}

const ImportUser = (props: TProps) => {
  const { isOpenModalImport, setIsOpenModalImport,reloadData } = props;
  const { message, notification } = App.useApp();

  const [data, setData] = useState<DataImport[]>([]); // ✅ lưu dữ liệu từ file
  const [isSubmit,setIsSubmit] = useState<boolean>(false);

  const columns = [
    { title: "Tên đầy đủ", dataIndex: "fullName" },
    { title: "Email", dataIndex: "email" },
    { title: "Số điện thoại", dataIndex: "phone" },
  ];

  const handleReadExcel = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const sheet = workbook.worksheets[0]; // dùng sheet đầu tiên
    const rows: DataImport[] = [];

    const firstRow = sheet.getRow(1).values as string[];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const values = row.values as string[];
      const record: any = {};
      for (let i = 1; i < firstRow.length; i++) {
        const key = firstRow[i];
        record[key] = values[i] ?? "";
        record.id = i;
      }
      rows.push(record as DataImport);
      
      
    });

    setData(rows);
  };

  const dataUpload: UploadProps = {
    maxCount: 1,
    name: "file",
    accept:
      ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
    customRequest({ file, onSuccess }) {
      setTimeout(() => {
        if (onSuccess) onSuccess("ok");
      }, 300); // giả lập upload thành công
      handleReadExcel(file as File); // ✅ đọc file ngay sau khi upload
    },
    onChange(info) {
      const { status } = info.file;

      
      if (status === "done") {
        message.success(`${info.file.name} upload thành công.`);
      } else if (status === "error") {
        message.error(`${info.file.name} upload thất bại.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const resetModal = () => {
    setIsOpenModalImport(false);
    setData([]);
  }
  const handleSubmit = async () => {
    setIsSubmit(true);
    const dataImportToBase = data.map(item =>({
      fullName:item.fullName,
      email: item.email,
      phone: item.phone as string,
      password: import.meta.env.VITE_USER_DEFAULT_PASSWORD as string
    }))
    const res = await bulkCreateUserAPI(dataImportToBase);
    if(res && res.data){
      notification.info({
        message: "Thông tin import!",
        description: `Count Success: ${res.data.countSuccess} \n
        Count Error: ${res.data.countError}`
      })
    }
    setIsSubmit(false);
    resetModal();
    reloadData();
  }

  return (
    <Modal
      width={"700px"}
      title="Import data user"
      open={isOpenModalImport}
      onCancel={resetModal}
      okButtonProps={{ disabled: data.length > 0 ? false : true ,loading: isSubmit}}
      destroyOnClose={true}
      maskClosable={false}
      onOk={()=>handleSubmit()}
      okText={"Import Data"}
    >
      <Dragger {...dataUpload}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single upload. Only accept .csv, .xls, .xlsx. Or <a onClick={(e)=>e.stopPropagation()} href="templateFile" download >Download Sample File</a>
        </p>
      </Dragger>

      <p style={{ margin: "20px 0 15px 0" }}>Dữ liệu upload:</p>
      <Table<DataImport> columns={columns} dataSource={data} rowKey="id" />
    </Modal>
  );
};

export default ImportUser;
