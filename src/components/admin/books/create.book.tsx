import { createBookAPI, fetchOptionCategoryAPI, uploadFileAPI } from "@/services/api";
import { PlusOutlined } from "@ant-design/icons";
import { App, Divider, Form, FormProps, GetProp, Image, Input, InputNumber, Modal, notification, Select, Upload, UploadProps } from "antd"
import { UploadFile } from "antd/lib";
import { useEffect, useState } from "react";
import { Col, Row } from 'antd';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';



interface IProps{
    setIsOpenModalAddBook: (v: boolean) => void;
    isOpenModalAddBook: boolean;
    reloadTable: () => void;
}

type UserUploadType = "thumbnail" | "slider";



const CreateBook = (props: IProps) => {
    const {isOpenModalAddBook,setIsOpenModalAddBook,reloadTable} = props;
    const [form] = Form.useForm();
    const {message} = App.useApp();
    const [arrOption,setArrOption] = useState<{ value: string; label: string }[]>([]);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const [fileListSlider, setFileListSlider] = useState<UploadFile[]>([]);
    const [fileListThumbnail,setFileListThumbnail] = useState<UploadFile[]>([]);

    const [isSubmit,setIsSubmit] = useState(false);


    type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

    const fetchOptionCategory = async () => {
      const res = await fetchOptionCategoryAPI();
      let arr: { value: string; label: string }[] = [];
      res.data?.map((v)=>{
        arr.push({
          value: v, label: v
        })
      })
      setArrOption(arr);   
    }
    
    useEffect(()=>{
      fetchOptionCategory();
    },[])
    
    



    const handleCancel = () => {
        form.resetFields(); // Reset tất cả field trong form
        setFileListSlider([]); // Clear slider
        setPreviewImage(""); // Clear preview ảnh
        setPreviewOpen(false);
        setIsOpenModalAddBook(false);
        setFileListThumbnail([]);
    }

    const onFinish: FormProps<FileType>['onFinish'] = async (values: any) => {
      setIsSubmit(true);
      const {mainText,author,price,quantity,category} = values;

      
      const slider = fileListSlider.map((e)=>e.name);
      console.log("check name",fileListThumbnail[0].name,slider);
      
      const res = await createBookAPI(fileListThumbnail[0].name,slider,mainText,author,price,quantity,category);
      if(res && res.data){
        message.success("Create Book Success!");
      }
      else{
        notification.error({
          message: "Create Book Error!",
          description: res.message
        })
      }
      setIsSubmit(false);
      handleCancel();
      reloadTable();


  };

  const handleRemove = async (file: UploadFile, type: UserUploadType) => {
    if(type === "thumbnail"){
      setFileListThumbnail([]);
    }
    else if(type === "slider"){
      const newSlider = fileListSlider.filter(x => x.uid !== file.uid);
      setFileListSlider(newSlider);
    }
  }

  const handleUploadFile = async (options: RcCustomRequestOptions, type: UserUploadType) => {
    
    const file = options.file as UploadFile;
    const res = await uploadFileAPI(file, "book");
    console.log("check res", res);
    
    
    const {onSuccess} = options;
      setTimeout(() => {
        if (onSuccess) onSuccess("ok");
      }, 300);

    if(res && res.data){
      const uploadedFile: any = {
        uid: file.uid,
        name: res.data.fileUploaded,
        status: 'done',
        url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${res.data.fileUploaded}`
      }
      if(type === "thumbnail"){
        
        setFileListThumbnail([{...uploadedFile}])
      }
      else{
        setFileListSlider((prevState)=>[...prevState,{...uploadedFile}])
      }
    }

  }



    const beforeUpload = (file: FileType) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
          message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M || Upload.LIST_IGNORE;
    };

    const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

    const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

    const handlePreviewSlider = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  

  
    
    

    return (
        <Modal
        width={"50%"}
        title="Thêm mới Book"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isOpenModalAddBook}
        onOk={form.submit}
        onCancel={handleCancel}
        loading={isSubmit}
      >
        <Divider></Divider>
        
        <Form
            form={form}
            name="basic"
            labelCol={{ span: 16 }}
            wrapperCol={{ span: 24 }}
            // style={{ maxWidth: "100%" }}
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
                  rules={[{ required: true, message: 'Please input your mainText!' }]}
                  
                  
                >
                  <Input style={{width: "100%"}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<IBookTable>
                  label="Tác giả"
                  name="author"
                  rules={[{ required: true, message: 'Please input your Author!' }]}
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
                  rules={[{ required: true, message: 'Please input your price!' }]}
                >
                  <InputNumber
                    style={{width: "100%"}}
                    addonAfter="đ" 
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')} 
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item<IBookTable>
                  label="Thể loại"
                  name="category"
                  rules={[{ required: true, message: 'Please input your category!' }]}
                >
                  <Select
                    style={{width: "100%"}}
                    // onChange={handleChange}
                    options={arrOption}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item<IBookTable>
                  label="Số lượng"
                  name="quantity"
                  rules={[{ required: true, message: 'Please input your quantity!' }]}
                >
                  <InputNumber style={{width: "100%"}}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item<IBookTable>
                  label="Ảnh Thumbnail"     
                  rules={[{ required: true, message: 'Please input your quantity!' }]}
                >
                  
                  
                    <Form.Item name="thumbnail" noStyle valuePropName="fileList"
                    getValueFromEvent={(e) => e.fileList}>
                      <Upload
                        // action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                        onRemove={(file) => handleRemove(file, "thumbnail")}
                        listType="picture-card"
                        fileList={fileListThumbnail}
                        onPreview={handlePreview}
                        // onChange={handleChangeThumbnail}
                        beforeUpload={beforeUpload}
                        customRequest={(options)=> handleUploadFile(options,'thumbnail')}
                        maxCount={1}
                      >
                        <button style={{ border: 0, background: 'none' }} type="button">
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </button>
                      </Upload>
                    </Form.Item>
                    
                    
                  
    
                </Form.Item>
              </Col>
  
  
              <Col span={12}>
                <Form.Item<IBookTable>
                  label="Ảnh Slider"
                  rules={[{ required: true, message: 'Please input your quantity!' }]}
                >
                  

                    <Form.Item name="slider" noStyle valuePropName="fileList"
                    getValueFromEvent={(e) => e.fileList}>
                      <Upload
                        // action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                        customRequest={(options)=> handleUploadFile(options,'slider')}
                        
                        listType="picture-card"
                        fileList={fileListSlider}
                        onPreview={handlePreviewSlider}
                        beforeUpload={beforeUpload}
                        onRemove={(file) => handleRemove(file, "slider")}
                      >
                        <button style={{ border: 0, background: 'none' }} type="button">
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </button>
                      </Upload>
                    </Form.Item>
                    
                    {previewImage && (
                    <Image
                       wrapperStyle={{ display: 'none' }}
                        preview={{
                          visible: previewOpen,
                          onVisibleChange: (visible) => setPreviewOpen(visible),
                          afterOpenChange: (visible) => !visible && setPreviewImage(''),
                        }}
                        src={previewImage}
                    />
                    )}
    
                </Form.Item>
              </Col>
            </Row>
            

            

            
        </Form>

      </Modal>
    )
}

export default CreateBook