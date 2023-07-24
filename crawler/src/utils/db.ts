import {DocumentClient, PutItemInput} from 'aws-sdk/clients/dynamodb';
import { Property } from '../adapters/abstract-adapter';
import QueryInput = DocumentClient.QueryInput;

export class Database {
    private static instance: Database;
    private constructor() { }
    private client: DocumentClient;

    public static getInstance(): Database {
        if (!this.instance) {
            this.instance = new Database();
        }
        return this.instance;
    }

    public async connect(): Promise<any> {
        if (process.env.IS_OFFLINE) {
            this.client = new DocumentClient({
                region: 'localhost',
                endpoint: 'http://localhost:8000',
                accessKeyId: 'DEFAULT_ACCESS_KEY',  // needed if you don't have aws credentials at all in env
                secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
            })
        } else {
            this.client = new DocumentClient({
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                region: process.env.AWS_REGION
            });
        }
    }

    async putProperty(property: Property): Promise<any> {
        let existing = await this.getItemByURL(property.propertyUrl);
        if (!existing) {
           existing = property;
        }
        existing = this.prepareItem(existing);
        const params = {
            TableName: process.env.PROPERTY_TABLE,
            Item: existing as any,
        };

        return this.client.put(params).promise();
    }

    private prepareItem(item: any): any {
        for (const prop in item) {
            if (Object.prototype.hasOwnProperty.call(item, prop)) {
                if (item[prop] === '') {
                    item[prop] = '---empty---';
                } else if (typeof item[prop] === 'object') {
                    this.prepareItem(item[prop]);
                }
            }
        }
        return item;
    }

    private cleanItem(item: any): any {
        for (const prop in item) {
            if (Object.prototype.hasOwnProperty.call(item, prop)) {
                if (item[prop] === '---empty---') {
                    item[prop] = '';
                } else if (typeof item[prop] === 'object') {
                    this.cleanItem(item[prop]);
                }
            }
        }
        return item;
    }



    async getItemById(id: string): Promise<Property> {
        const params: any = {
            TableName: process.env.PROPERTY_TABLE,
            Key: id
        };

        const dbResponse = await this.client.get(params).promise();
        if (!dbResponse.Item) {
            return null;
        }
        return this.cleanItem(dbResponse.Item) as Property;
    }

    async getItemByURL(url: string): Promise<Property> {
        const params: QueryInput = {
            TableName: process.env.PROPERTY_TABLE,
            IndexName: 'urlGSI',
            KeyConditionExpression: 'propertyUrl= :url',
            ExpressionAttributeValues: {
                ':url': url,
            },
        };

        const dbResponse = await this.client.query(params).promise();
        if (dbResponse.Items.length === 0) {
            return null;
        }
        return this.cleanItem(dbResponse.Items[0]) as Property;
    }
}
