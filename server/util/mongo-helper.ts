import { Request } from 'express';
import { config } from '../config/config';
import {
  Filter,
  MongoClient,
  Document,
  FindOptions,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateOptions,
  InsertOneOptions,
  DeleteOptions,
  BulkWriteOptions
} from 'mongodb';
import { IDocumentName } from './mongo.interface';
import { ErrorState } from './error-state';
import * as moment from 'moment';

class MongoHelper {
  private readonly uri: string = config.mongo.connectionString!;
  private readonly RED_TEXT = '\x1b[31m%s\x1b[0m';
  private readonly GREEN_TEXT = '\x1b[32m%s\x1b[0m';
  private readonly YELLOW_TEXT = '\x1b[33m%s\x1b[0m';
  private readonly BLUE_TEXT = '\x1b[34m%s\x1b[0m';
  public readonly DATE_FORMAT = 'YYYY-MM-DD';

  constructor() {}

  async findOne<T extends Document>(collectionName: IDocumentName, query: Filter<T>, findOptions?: FindOptions) {
    const client: MongoClient = await new MongoClient(this.uri).connect();

    try {
      const database = client.db(config.mongo.db);
      const collection = database.collection<T>(collectionName);

      return await collection.findOne(query, findOptions);
    } finally {
      await client.close();
    }
  }

  async find<T extends Document>(collectionName: IDocumentName, query: Filter<T>, findOptions?: FindOptions<T>) {
    const client: MongoClient = await new MongoClient(this.uri).connect();
    
    try {
      const database = client.db(config.mongo.db);
      const collection = database.collection<T>(collectionName);

      return await collection.find(query, findOptions).toArray();
    } finally {
      await client.close();
    }
  }

  async insertOne<T extends Document>(collectionName: IDocumentName, newDocument: OptionalUnlessRequiredId<T>, options?: InsertOneOptions) {
    const client: MongoClient = await new MongoClient(this.uri).connect();

    try {
      const database = client.db(config.mongo.db);
      const collection = database.collection<T>(collectionName);

      return await collection.insertOne(newDocument, options);
    } finally {
      await client.close();
    }
  }

  async insertMany<T extends Document>(collectionName: IDocumentName, newDocument: OptionalUnlessRequiredId<T>[], options?: BulkWriteOptions) {
    const client: MongoClient = await new MongoClient(this.uri).connect();

    try {
      const database = client.db(config.mongo.db);
      const collection = database.collection<T>(collectionName);

      return await collection.insertMany(newDocument, options);
    } finally {
      await client.close();
    }
  }
  
  async updateOne<T extends Document>(collectionName: IDocumentName, query: Filter<T>, update: UpdateFilter<T> | Partial<T>, options?: UpdateOptions) {
    const client: MongoClient = await new MongoClient(this.uri).connect();

    try {
      const database = client.db(config.mongo.db);
      const collection = database.collection<T>(collectionName);

      return await collection.updateOne(query, update, options);
    } finally {
      await client.close();
    }
  }
  
  async updateMany<T extends Document>(collectionName: IDocumentName, query: Filter<T>, update: UpdateFilter<T> | Partial<T>, options?: UpdateOptions) {
    const client: MongoClient = await new MongoClient(this.uri).connect();

    try {
      const database = client.db(config.mongo.db);
      const collection = database.collection<T>(collectionName);

      return await collection.updateMany(query, update, options);
    } finally {
      await client.close();
    }
  }
  
  async deleteOne<T extends Document>(collectionName: IDocumentName, query: Filter<T>, options?: DeleteOptions) {
    const client: MongoClient = await new MongoClient(this.uri).connect();

    try {
      const database = client.db(config.mongo.db);
      const collection = database.collection<T>(collectionName);

      return await collection.deleteOne(query, options);
    } finally {
      await client.close();
    }
  }

  async deleteMany<T extends Document>(collectionName: IDocumentName, query: Filter<T>, options?: DeleteOptions) {
    const client: MongoClient = await new MongoClient(this.uri).connect();

    try {
      const database = client.db(config.mongo.db);
      const collection = database.collection<T>(collectionName);

      return await collection.deleteMany(query, options);
    } finally {
      await client.close();
    }
  }

  /**
   * Logs a message to the console.
   */
  private logMessage(message: string, color: string = this.BLUE_TEXT): void {
    // disable in prod to improve performance
    if(!config.isProd) {
      console.log(color, `${message}`);
    }
  }

  /**
   * Checks if the given property if of T type.
   * @param req The http request
   * @param prop The property from the request to check
   * @returns the value of the parameter
   */
  private checkParam(req: Request, prop: string): any {
    let param;

    if(prop in req.body) {
      param = req.body[prop];
    } else if(prop in req.query) {
      param = req.query[prop];
    } else {
      this.logMessage(`The ${prop} parameter was not supplied`);
      throw { message: `Invalid request.`, state: ErrorState.InvalidParameter };
    }

    return param;
  }

  /**
   * Check if a number is valid.
   */
  checkNumber(req: Request, prop: string, isRequired: boolean = true): void {
    if(isRequired) {
      const param = this.checkParam(req, prop);

      if(isNaN(+param)) {
        this.logMessage(`The ${prop} parameter must be a number.`);
        throw { message: `Invalid request.`, state: ErrorState.InvalidParameter };
      }
    }
  }

  /**
   * Check if a date is valid.
   */
  checkDate(req: Request, prop: string, isRequired: boolean = true): void {
    if(isRequired) {
      const param = this.checkParam(req, prop);

      if(isNaN(Date.parse(param)) || !moment.utc(new Date(param)).isValid()) {
        this.logMessage(`The ${prop} parameter must be a date.`);
        throw { message: `Invalid request.`, state: ErrorState.InvalidParameter };
      }
    }
  }

  /**
   * Check if a boolean is valid.
   */
  checkBoolean(req: Request, prop: string, isRequired: boolean = true): void {
    if(isRequired) {
      let param = this.checkParam(req, prop);
      
      // GET requests always toString() values, so we need to change booleans to an actual boolean
      if(req.method === 'GET') {
        param = param === 'true';
      }

      if(!/^1$|^true$|^0$|^false$/i.test(param)) {
        this.logMessage(`The ${prop} parameter must be a boolean.`);
        throw { message: `Invalid request.`, state: ErrorState.InvalidParameter };
      }
    }
  }

  /**
   * Check if a string is valid.
   */
  checkString(req: Request, prop: string, isRequired: boolean = true, validValues?: string[]): void {
    if(isRequired) {
      const param = this.checkParam(req, prop);

      if(validValues) {
        let valid = false;
  
        for(const value of validValues) {
          if(param === value) {
            valid = true;
          }
        }
  
        if(!valid) {
          this.logMessage(`${prop} must be one of ${validValues.join(', ')}`);
          throw { message: `Invalid request.`, state: ErrorState.InvalidParameter };
        }
      }
    }
  }
}

export default new MongoHelper();
