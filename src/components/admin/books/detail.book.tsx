import { PlusOutlined } from "@ant-design/icons";
import { Badge, Descriptions, Divider, Drawer, GetProp, Image, Space, Upload, UploadFile } from "antd";
import { UploadProps } from "antd/lib";
import { log } from "console";
import dayjs from "dayjs";
import { url } from "inspector";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface IProps {
    isOpenModalDetail: boolean;
    setIsOpenModalDetail: (v: boolean) => void;
    dataBook: IBookTable | null;
    setDataBook: (v: IBookTable | null)=>void;
}
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const BookDetail = (props: IProps) => {
    const {isOpenModalDetail,setIsOpenModalDetail,dataBook,setDataBook} = props;
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState<UploadFile[]>([
    // {
    //   uid: "-1",
    //   name: "image.png",
    //   status: "done",
    //   url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    // },
  ]);
  const fetchSlider = () => {
    
    let imageArr: UploadFile[]=[];
    imageArr = [...imageArr,{
      uid:uuidv4(),
          name: dataBook?.thumbnail!,
          status: "done",
          url:`${import.meta.env.VITE_BACKEND_URL}/images/book/${dataBook?.thumbnail}`
    }]
    if(dataBook?.slider){
      dataBook.slider.map((v: any)=>{
        imageArr = [...imageArr,{
          uid:uuidv4(),
          name: v,
          status: "done",
          url:`${import.meta.env.VITE_BACKEND_URL}/images/book/${v}`
        }]
      })
    }
    
    setFileList(imageArr);
  };

  useEffect(()=>{
    fetchSlider();
  },[dataBook])

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

    const handleCancel= () => {
        setDataBook(null);
        setIsOpenModalDetail(false);
    }
    return (
        <>
            <Drawer
            width={"65%"}
        title="Chức năng xem chi tiết"
        closable={{ 'aria-label': 'Close Button' }}
        onClose={handleCancel}
        open={isOpenModalDetail}
      >

        <Descriptions title="Thông tin Book" bordered >
            <Descriptions.Item label="Id">{dataBook?._id}</Descriptions.Item>
            <Descriptions.Item span={2} label="Tên sách">{dataBook?.mainText}</Descriptions.Item>
            <Descriptions.Item label="Tác giả">{dataBook?.author}</Descriptions.Item>
            <Descriptions.Item span={2} label="Giá tiền">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(dataBook?.price)
  )}</Descriptions.Item>
            <Descriptions.Item span={3} label="Thể loại">
             <Badge status="processing"/> {dataBook?.category}
            </Descriptions.Item>
            <Descriptions.Item label="Create At">{dayjs(dataBook?.createdAt).format("YYYY-MM-DD")}</Descriptions.Item>
            <Descriptions.Item label="Update At">{dayjs(dataBook?.updatedAt).format("YYYY-MM-DD")}</Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Ảnh Books</Divider>

        <Upload
        // action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        showUploadList={
            {showRemoveIcon: false}
        }
        ></Upload>
        {previewImage && (
            <Image
            wrapperStyle={{ display: "none" }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(""),
            }}
            src={previewImage}
            />
        )}
        
      </Drawer>
        </>
    )
}

export default BookDetail;