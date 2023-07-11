import {NamedObject} from "../model/common";

async function getAllNamedObjectValues(endpoint: string): Promise<string[]> {
    const url = `/api/v1/${endpoint}`;
    const response = await fetch(url, {
        method: 'get'
    });
    // TODO Check the response for errors
    const data = await response.json() as NamedObject[];
    return data.map(val => val.name);
}

export async function getAllPaymentMethods(): Promise<string[]> {
    return getAllNamedObjectValues('paymentmethod');
}

export async function getAllTags(): Promise<string[]> {
    return getAllNamedObjectValues('tag');
}

export async function getAllAuthors(): Promise<string[]> {
    return getAllNamedObjectValues('author');
}
