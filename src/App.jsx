import {useState,useEffect} from 'react';

import axios from "axios";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App(){

    // 表單資料狀態(儲存登入表單輸入)
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    // 登入狀態管理(控制顯示登入或產品頁）
    const [isAuth, setIsAuth] = useState(false);
    // 產品資料狀態
    const [products, setProducts] = useState([]);
    // 目前選中的產品
    const [tempProduct, setTempProduct] = useState(null);

    //設定輸入資料儲存庫
    const handleInputChange=(e)=>{
        const {name,value}=e.target;
        // console.log(name,value);
        
        setFormData((preData)=>({
            ...preData,
            [name] : value,
        }))
    };
    // 這個函式會幫你從 Cookie 中找出名稱為 'hexToken' 的值
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    useEffect(() => {
        // 1. 從 Cookie 中取出 Token
        const token = getCookie("hexToken");

        // 2. 如果有 Token，就設定到 Axios 並檢查是否有效
        if (token) {
            // 先把 Token 塞回 Axios Header
            axios.defaults.headers.common['Authorization'] = token;

            // 呼叫「檢查登入」的 API
            // 注意：這裡路徑通常是 /api/user/check (依照老師提供的 API 文件為主)
            axios.post(`${API_BASE}/api/user/check`)
                .then((res) => {
                    console.log("驗證成功", res);
                    setIsAuth(true); // 驗證成功，維持登入狀態
                })
                .catch((err) => {
                    console.error("驗證失敗", err);
                    setIsAuth(false); // Token 可能過期或被竄改
                });
        }
    }, []); // 空陣列表示只在「元件掛載時」執行一次

    const checkLogin= async()=>{
        try{
            const res= await axios.post(`${API_BASE}/api/user/check`);
            console.log("目前為登入狀態",res);
            alert(`成功登入! uid為:${res.data.uid}`);
        }catch(err){
            console.error("目前為未登入狀態",err);
            alert(`${err.response?.data?.message}`)
        }
    }
    const onSubmit=async(e)=>{
        try{
            e.preventDefault();
            const res= await axios.post(`${API_BASE}/admin/signin`,formData);
            console.log(res);
            alert(res.data.message);
            const {token,expired}= res.data;

            // 3. 存入 Cookie
            // 加上 path=/ 確保全站可存取
            document.cookie = `hexToken=${token}; expires=${new Date(expired)}; path=/;`;


            // 4. 設定 Axios 預設 Header (注意這裡要帶入 token 變數)
            // 之後發送 axios 請求時，都會自動帶上這個 Authorization
            axios.defaults.headers.common['Authorization'] = token;
            setIsAuth(true);    
            getDatas();
        }catch(err){
            alert(err.message);
            setIsAuth(false);    
        }
    };

    const getDatas= async()=>{
        try{
            const res= await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
            console.log(res);
            setProducts(res.data.products);
        }catch(err){
            console.error("取得產品失敗",err.response?.data?.message);

        }
    };

    // const config = {
    //     headers: { Authorization: token },
    // };

    return (
        <>
            {!isAuth?(
                <div className="container login"> 
                    <h1 className="mt-5">請先登入</h1>
                    <form className="form-floating form-signin"
                        onSubmit={(e)=>onSubmit(e)}>
                            <div className="mb-3">
                                <label htmlFor="Email1" className="form-label">電子信箱</label>
                                <input 
                                    type="email"
                                    name="username" 
                                    value={formData.username} 
                                    onChange={(e)=>handleInputChange(e)}    
                                    placeholder="Email" 
                                    className="form-control" 
                                    id="Email1" 
                                    aria-describedby="emailHelp" />

                                <div id="emailHelp" className="form-text">此Email為非公開,我們不會將該email分享給其他人</div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="Password" className="form-label">密碼</label>
                                <input 
                                    type="password"
                                    name="password"
                                    value={formData.password} 
                                    onChange={(e)=>handleInputChange(e)}
                                    placeholder="password" 
                                    className="form-control" 
                                    id="Password" />
                            </div>
                            <div className="mb-3 form-check">
                                <input type="checkbox" className="form-check-input" id="CheckBox"/>
                                <label className="form-check-label" htmlFor="CheckBox">記住我</label>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 mt-2">提交</button>
                    </form>
                </div> 
            ):(
                <div className="container signin">
                    <button
                        className="btn btn-danger mb-5"
                        type="button"
                        onClick={checkLogin}
                        >
                        確認是否登入
                    </button>
                    
                    <div className="container">
                    <div className="row mt-5">
                        <div className="col-md-6">
                            <h2>產品列表</h2>
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>產品名稱</th>
                                    <th>原價</th>
                                    <th>售價</th>
                                    <th>是否啟用</th>
                                    <th>查看細節</th>
                                </tr>
                                </thead>
                                <tbody>
                                {products && products.length > 0 ? (
                                    products.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.title}</td>
                                        <td>{item.origin_price}</td>
                                        <td>{item.price}</td>
                                        <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                                        <td>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setTempProduct(item)}
                                        >
                                            查看細節
                                        </button>
                                        </td>
                                    </tr>
                                    ))
                                ) : (
                                    <tr>
                                    <td colSpan="5">尚無產品資料</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <h2>單一產品細節</h2>
                            {tempProduct ? (
                                <div className="card mb-3">
                                <img
                                    src={tempProduct.imageUrl}
                                    className="card-img-top primary-image"
                                    alt="主圖"
                                />
                                <div className="card-body">
                                    <h5 className="card-title">
                                    {tempProduct.title}
                                    <span className="badge bg-primary ms-2">
                                        {tempProduct.category}
                                    </span>
                                    </h5>
                                    <p className="card-text">
                                    商品描述：{tempProduct.description}
                                    </p>
                                    <p className="card-text">商品內容：{tempProduct.content}</p>
                                    <div className="d-flex">
                                    <p className="card-text text-secondary">
                                        <del>{tempProduct.origin_price}</del>
                                    </p>
                                    元 / {tempProduct.price} 元
                                    </div>
                                    <h5 className="mt-3">更多圖片：</h5>
                                    <div className="d-flex flex-wrap">
                                    {tempProduct.imagesUrl?.map((url, index) => (
                                        <img
                                        key={index}
                                        src={url}
                                        className="images"
                                        alt="副圖"
                                        />
                                    ))}
                                    </div>
                                </div>
                                </div>
                            ) : (
                                <p className="text-secondary">請選擇一個商品查看</p>
                            )}
                            </div>
                    </div>
                    </div>
                    
                    
                </div>
            )}
        </>
    )
}

export default App;