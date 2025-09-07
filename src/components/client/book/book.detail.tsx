import { Button, Col, Input, message, Rate, Row } from "antd";
import "react-image-gallery/styles/css/image-gallery.css";
import ReactImageGallery from "react-image-gallery";
import { useEffect, useRef, useState, useMemo } from "react";
import { ShoppingCartOutlined } from "@ant-design/icons";
import "@/styles/book.scss";
import ModalGallery from "./modal.gallery";
import { useCurrentApp } from "@/components/context/app.context";
import { useNavigate } from "react-router-dom";
interface IProps{
  dataBook: IBookTable;
}


const BookDetail = ({ dataBook }: IProps) => {
  const [isOpenModalGallery, setIsOpenModalGallery] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const {carts,setCarts,user} = useCurrentApp();
  const nav = useNavigate();
  const [images, setImages] = useState<
    { original: string; thumbnail: string; originalClass: string; thumbnailClass: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const refGallery = useRef<ReactImageGallery>(null);

  // Build images whenever dataBook changes
  useEffect(() => {
    if (!dataBook) {
      setImages([]);
      return;
    }

    const base = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
    const next: {
      original: string; thumbnail: string; originalClass: string; thumbnailClass: string
    }[] = [];

    
    const thumbnails = Array.isArray(dataBook.thumbnail) ? dataBook.thumbnail : (dataBook.thumbnail ? [dataBook.thumbnail] : []);
    const sliders    = Array.isArray(dataBook.slider)    ? dataBook.slider    : (dataBook.slider ? [dataBook.slider] : []);

    const pushOne = (file: string) => {
      const url = `${base}/images/book/${file}`;
      next.push({
        original: url,
        thumbnail: url,
        originalClass: "original-image",
        thumbnailClass: "thumbnail-image",
      });
    };

    thumbnails.forEach(pushOne);
    sliders.forEach(pushOne);

    setImages(next);
  }, [dataBook]);

  const handleOnClickImage = () => {
    setIsOpenModalGallery(true);
    setCurrentIndex(refGallery.current?.getCurrentIndex() ?? 0);
  };

  
  const increase = () => (quantity + 1 <= +dataBook?.quantity!) ? setQuantity((prev) => prev + 1) : quantity;
  const decrease = () => setQuantity((prev) => Math.max(1, prev - 1));
  const onChangeQuantity = (value : any) => {
    if(value.target.value <= +dataBook?.quantity!){
      setQuantity(+value.target.value);
    }
    
    
  }

  const handleAddCart = (isBuyNow = false) => {
    if(!user){
      message.error("Bạn cần đăng nhập để thực hiện tính năng này!");
      return;
    }
    let check = false;
    let dataCart = [];
    const data = [{_id: dataBook._id, quantity: quantity , detail: dataBook}];
    
    const cart = localStorage.getItem("cart");
    if(!cart){
      localStorage.setItem("cart",JSON.stringify(data));
      setCarts(data);
      message.success("Thêm thành công sách vào rỏ hàng!");
    }
    else{
      const dataCartString = localStorage.getItem("cart");
      if(dataCartString){
        dataCart = JSON.parse(dataCartString);
      }
      dataCart.forEach((v: ICart)=>{
        if(v._id === dataBook?._id){
          v.quantity = (+v.quantity + quantity);
          check=true;
        }

      })
      if(!check){
        dataCart.push(data[0]);
      }
      localStorage.setItem("cart",JSON.stringify(dataCart));
       
      setCarts(dataCart);


    }
    if(isBuyNow){
      nav("/order");
    }
    else{
      message.success("Thêm thành công sách vào rỏ hàng!");
    }
  }

  return (
    <div style={{ background: "#efefef", padding: "20px 0 60px" }}>
      <div className="bookPage-container" style={{ background: "#fff", padding: "15px 20px", maxWidth: 1440, margin: "0 auto", borderRadius: 10 }}>
        <Row gutter={20}>
          <Col md={8} sm={24}>
            <ReactImageGallery
              ref={refGallery}
              items={images}
              showPlayButton={false}
              showFullscreenButton={false}
              onClick={handleOnClickImage}
              renderLeftNav={() => <></>}
              renderRightNav={() => <></>}
              slideOnThumbnailOver
            />
          </Col>

          <Col md={16} sm={24}>
            <div className="content-book">
              <span className="author">Tác giả: <a>{dataBook?.author}</a></span>
              <p className="mainText" style={{ fontSize: 20, margin: "10px 0" }}>{dataBook?.mainText}</p>
              <Row>
                <Rate value={5} disabled style={{ color: "#ffce3d", fontSize: 12 }} />
                <span>Đã bán {dataBook?.sold}</span>
              </Row>
              <div className="price-wrap" style={{ padding: 15, fontSize: 20, color: "red", background: "#f9f9f9", margin: "10px 0" }}>
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(+dataBook?.price!)}
              </div>
              <Row style={{ marginBottom: 10 }}>
                <span style={{ color: "#6e6d6d", marginRight: 20 }}>Vận Chuyển</span>
                <span style={{ fontSize: 14 }}>Miễn phí vận chuyển</span>
              </Row>
              <Row>
                <span style={{ color: "#6e6d6d", marginRight: 20 }}>Số lượng</span>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button onClick={decrease}>-</Button>
                  <Input style={{ width: 60, textAlign: "center" }} value={quantity} onChange={onChangeQuantity} />
                  <Button onClick={increase}>+</Button>
                </div>
              </Row>
              <Row style={{ marginTop: 20 }}>
                <Button danger style={{ marginRight: 10 }} onClick={()=>handleAddCart()}>
                  <ShoppingCartOutlined /> Thêm vào rổ hàng
                </Button>
                <Button onClick={()=>handleAddCart(true)} type="primary" danger>
                  Mua ngay
                </Button>
              </Row>
            </div>
          </Col>
        </Row>
      </div>

      <ModalGallery
        isOpen={isOpenModalGallery}
        setIsOpen={setIsOpenModalGallery}
        currentIndex={currentIndex}
        items={images}
        title={"hardcode"}
      />
    </div>
  );
};

export default BookDetail;
