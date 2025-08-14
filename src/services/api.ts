import axios from "services/axios.customize";

export const loginAPI = (username: string,password: string) =>{
    const urlBackend = "/api/v1/auth/login";
    return axios.post<IBackendRes<ILogin>>(urlBackend,{username,password},{headers:{delay: 3000}})
}

export const registerAPI = (fullName: string,email: string,password: string,phone: string) =>{
    const urlBackend = "/api/v1/user/register";
    return axios.post<IBackendRes<IRegister>>(urlBackend,{fullName,email,password,phone})
}

export const fetchAccountAPI = () =>{
    const urlBackend = "/api/v1/auth/account";
    return axios.get<IBackendRes<IFetchAccount>>(urlBackend,{
        headers: {
            delay:1000
        }
    })
}

export const logoutAPI = () => {
    const urlBackend = "/api/v1/auth/logout";
    return axios.post<IBackendRes<IRegister>>(urlBackend)
}
export const getUserAPI = (query: string) => {
    const urlBackend = `/api/v1/user?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(urlBackend);
}

export const createUserAPI = (fullName: string,email: string,password: string,phone: string) =>{
    const urlBackend = "/api/v1/user";
    return axios.post<IBackendRes<IUserTable>>(urlBackend,{fullName,email,password,phone})
}

export const bulkCreateUserAPI = (data: {
    fullName: string;
    password: string,
    email: string,
    phone: string
}[]) =>{
    const urlBackend = "/api/v1/user/bulk-create";
    return axios.post<IBackendRes<IBulkCreate>>(urlBackend,data)
}

export const updateUserAPI = (fullName: string,_id: string,phone: string) =>{
    const urlBackend = "/api/v1/user";
    return axios.put<IBackendRes<IUserTable>>(urlBackend,{fullName,_id,phone})
}
export const deleteUserAPI = (id: string) =>{
    const urlBackend = `/api/v1/user/${id}`;
    return axios.delete<IBackendRes<IUserTable>>(urlBackend)
}

export const getBookAPI = (query: string) => {
    const urlBackend = `/api/v1/book?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IBookTable>>>(urlBackend);
}

export const fetchOptionCategoryAPI = () => {
    const urlBackend = `/api/v1/database/category`;
    return axios.get<IBackendRes<string[]>>(urlBackend);
}

export const uploadFileAPI = (fileImg: any, folder: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('fileImg', fileImg);
    return axios<IBackendRes<{fileUploaded: string}>>({
        method: 'post',
        url: '/api/v1/file/upload',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
            "upload-type": folder
        },
    });
}

export const createBookAPI = (thumbnail: string,slider: string[],mainText: string,author: string,price: number,quantity: number,category: string) =>{
    const urlBackend = "/api/v1/book";
    return axios.post<IBackendRes<IBookTable>>(urlBackend,{thumbnail,slider,mainText,author,price,quantity,category})
}

export const updateBookAPI = (id: string,thumbnail: string,slider: string[],mainText: string,author: string,price: number,quantity: number,category: string) =>{
    const urlBackend = `/api/v1/book/${id}`;
    return axios.put<IBackendRes<IBookTable>>(urlBackend,{thumbnail,slider,mainText,author,price,quantity,category})
}

export const deleteBookAPI = (id: string) =>{
    const urlBackend = `/api/v1/book/${id}`;
    return axios.delete<IBackendRes<IUserTable>>(urlBackend)
}