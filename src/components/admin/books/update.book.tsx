import { createBookAPI, fetchOptionCategoryAPI, updateBookAPI, uploadFileAPI } from "@/services/api";
import { PlusOutlined } from "@ant-design/icons";
import {
  App,
  Divider,
  Form,
  GetProp,
  Image,
  Input,
  InputNumber,
  Modal,
  notification,
  Select,
  Upload,
  type UploadProps
} from "antd";
import type { UploadFile } from "antd";
import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { v4 as uuidv4 } from "uuid";

interface IProps {
  setIsOpenModalUpdate: (v: boolean) => void;
  isOpenModalUpdate: boolean;
  reloadTable: () => void;
  dataBook: IBookTable | null;
  setDataBook: (v: IBookTable | null) => void;
}

type UserUploadType = "thumbnail" | "slider";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const UpdateBook = (props: IProps) => {
  const { isOpenModalUpdate, setIsOpenModalUpdate, reloadTable, dataBook, setDataBook } = props;
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const [arrOption, setArrOption] = useState<{ value: string; label: string }[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [fileListSlider, setFileListSlider] = useState<UploadFile[]>([]);
  const [fileListThumbnail, setFileListThumbnail] = useState<UploadFile[]>([]);
  const [isSubmit, setIsSubmit] = useState(false);

  // --- Prefill form fields
  useEffect(() => {
    if (dataBook) {
      form.setFieldsValue({
        mainText: dataBook.mainText,
        author: dataBook.author,
        price: dataBook.price,
        category: dataBook.category,
        quantity: dataBook.quantity,
      });
    }
  }, [dataBook, form]);

  // --- Build Upload file lists from server data
  useEffect(() => {
    // slider
    if (dataBook?.slider?.length) {
      const arr: UploadFile[] = dataBook.slider.map((v: string) => ({
        uid: uuidv4(),
        name: v,
        status: "done",
        url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${v}`,
      }));
      setFileListSlider(arr);
    } else {
      setFileListSlider([]);
    }

    // thumbnail
    if (dataBook?.thumbnail) {
      setFileListThumbnail([
        {
          uid: uuidv4(),
          name: dataBook.thumbnail,
          status: "done",
          url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${dataBook.thumbnail}`,
        },
      ]);
    } else {
      setFileListThumbnail([]);
    }
  }, [dataBook]);

  // --- Select options
  useEffect(() => {
    (async () => {
      const res = await fetchOptionCategoryAPI();
      const arr = (res?.data ?? []).map((v: string) => ({ value: v, label: v }));
      setArrOption(arr);
    })();
  }, []);

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) message.error("You can only upload JPG/PNG file!");
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error("Image must smaller than 2MB!");
    return (isJpgOrPng && isLt2M) || Upload.LIST_IGNORE;
  };

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // --- One preview controller for both Uploads
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage((file.url as string) || (file.preview as string) || "");
    setPreviewOpen(true);
  };

  const handleRemove = (file: UploadFile, type: UserUploadType) => {
    if (type === "thumbnail") {
      setFileListThumbnail([]);
    } else {
      setFileListSlider((prev) => prev.filter((x) => x.uid !== file.uid));
    }
  };

  const handleUploadFile = async (options: RcCustomRequestOptions, type: UserUploadType) => {
    const raw = options.file as File; // RcFile extends File
    const res = await uploadFileAPI(raw, "book");

    const { onSuccess, onError } = options;
    if (!res || !res.data) {
      onError?.(new Error("Upload failed"));
      return;
    }

    const uploadedFile: UploadFile = {
      uid: (raw as any).uid ?? uuidv4(),
      name: res.data.fileUploaded,
      status: "done",
      url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${res.data.fileUploaded}`,
    };

    if (type === "thumbnail") {
      setFileListThumbnail([uploadedFile]);
    } else {
      setFileListSlider((prev) => [...prev, uploadedFile]);
    }

    setTimeout(() => onSuccess?.("ok" as any), 200);
  };

  const handleCancel = () => {
    form.resetFields();
    setFileListSlider([]);
    setFileListThumbnail([]);
    setPreviewImage("");
    setPreviewOpen(false);
    setDataBook(null);
    setIsOpenModalUpdate(false);
  };

  const onFinish = async (values: any) => {
    setIsSubmit(true);
    const { mainText, author, price, quantity, category } = values;

    const arrSlider = fileListSlider.map((f) => f.name);
    const thumbName = fileListThumbnail[0]?.name;

    const res = await updateBookAPI(dataBook?._id!,thumbName, arrSlider, mainText, author, price, quantity, category);

    if (res && res.data) {
      message.success("Update Book Success!");
      handleCancel();
      reloadTable();
    } else {
      notification.error({
        message: "Update Book Error!",
        description: res?.message || "Unknown error",
      });
    }
    setIsSubmit(false);
  };

  

  return (
    <Modal
      width="50%"
      title="Thêm mới Book"
      open={isOpenModalUpdate}
      onOk={form.submit}
      onCancel={handleCancel}
      confirmLoading={isSubmit}
    >
      <Divider />

      <Form
        form={form}
        name="basic"
        labelCol={{ span: 16 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item<IBookTable>
              label="Tên sách"
              name="mainText"
              rules={[{ required: true, message: "Please input your mainText!" }]}
            >
              <Input style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<IBookTable>
              label="Tác giả"
              name="author"
              rules={[{ required: true, message: "Please input your Author!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={20}>
          <Col span={6}>
            <Form.Item<IBookTable>
              label="Giá tiền"
              name="price"
              rules={[{ required: true, message: "Please input your price!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                addonAfter="đ"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, "") : "")}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item<IBookTable>
              label="Thể loại"
              name="category"
              rules={[{ required: true, message: "Please input your category!" }]}
            >
              <Select style={{ width: "100%" }} options={arrOption} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item<IBookTable>
              label="Số lượng"
              name="quantity"
              rules={[{ required: true, message: "Please input your quantity!" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={20}>
          <Col span={12}>
            <Form.Item label="Ảnh Thumbnail" required>
              <Upload
                listType="picture-card"
                fileList={fileListThumbnail}
                onPreview={handlePreview}
                beforeUpload={beforeUpload}
                customRequest={(options) => handleUploadFile(options, "thumbnail")}
                onRemove={(file) => handleRemove(file, "thumbnail")}
                maxCount={1}
              >
                
                  <button style={{ border: 0, background: "none" }} type="button">
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </button>
                
              </Upload>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Ảnh Slider" required>
              <Upload
                listType="picture-card"
                fileList={fileListSlider}
                onPreview={handlePreview}
                beforeUpload={beforeUpload}
                customRequest={(options) => handleUploadFile(options, "slider")}
                onRemove={(file) => handleRemove(file, "slider")}
              >
                <button style={{ border: 0, background: "none" }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        {/* ONE hidden Image controls preview for both Uploads */}
        <Image
          style={{ display: "none" }}
          src={previewImage}
          preview={{
            visible: previewOpen,
            onVisibleChange: (v) => setPreviewOpen(v),
            afterOpenChange: (v) => !v && setPreviewImage(""),
          }}
        />
      </Form>
    </Modal>
  );
};

export default UpdateBook;
