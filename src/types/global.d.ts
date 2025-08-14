import { DatabaseSync } from "node:sqlite";

export {};

declare global {
    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
    }

    interface IModelPaginate<T> {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        },
        result: T[]
    }

    interface ILogin {
        access_token: string;
        user: {
            email: string;
            phone: string;
            fullName: string;
            role: string;
            avatar: string;
            id: string;
        }
    }
    interface IRegister {
        email: string
        fullName: string
        _id: string
    }

    interface IUser {
            email: string;
            phone: string;
            fullName: string;
            role: string;
            avatar: string;
            id: string;
    }

    interface IFetchAccount {
        user: IUser;
    }

    interface IUserTable {
        _id: string,
        fullName: string,
        email: string,
        phone: string,
        role: string,
        avatar: string,
        isActive: boolean,
        createdAt: Date,
        updatedAt: Date,
        _v: string
    }
    interface ICreateUser {
        fullName: string,
        password: string,
        email: string,
        phone: string,
    }

    interface IBulkCreate {
        countSuccess: number
        countError: number
        detail: string | object[]
    }
    interface IUpdateUser{
        _id: string
        fullName: string,
        email: string,
        phone: string,
    }

    // Book
    interface IBookTable {
        _id: string,
        thumbnail:any,
        slider: any,
        mainText: string,
        author: string,
        price: string,
        sold: string,
        quantity: string,
        category: string,
        createdAt: Date,
        updatedAt: Date,
        __v: string
    }

}
