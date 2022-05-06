import PostgresDatabase from '../Infrastructure/PostgresDatabase';
import Model from 'Common/Models/IncomingCallRouting';
import DatabaseService from './DatabaseService';

export default class Service extends DatabaseService<Model> {
    public constructor(database: PostgresDatabase) {
        super(Model, database);
    }
}


