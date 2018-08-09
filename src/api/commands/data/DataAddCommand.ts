import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { TestDataService } from '../../services/TestDataService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { TestDataCreateRequest } from '../../requests/TestDataCreateRequest';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class DataAddCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService
    ) {
        super(Commands.DATA_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: CreatableModel, model to generate
     *  [1]: json
     *  [2]: withRelated, return full objects or just id's
     *
     * @param {RpcRequest} data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {
        const withRelated = data.params[2] ? data.params[2] : true;
        return await this.testDataService.create({
            model: data.params[0],
            data: JSON.parse(data.params[1]),
            withRelated
        } as TestDataCreateRequest);
    }

    public usage(): string {
        return this.getName() + ' <model> <json> [<withRelated>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <model>                  - ENUM{listingitemtemplate|listingitem|profile|itemcategory \n'
            + '                                |favoriteitem|iteminformation|bid|paymentinformation|itemimage} \n'
            + '                                - The type of data we want to generate. \n'
            + '    <json>                   - String - [TODO] \n'
            + '    <withRelated>            - [optional] Boolean - [TODO] ';
    }

    public description(): string {
        return 'Adds data to the database.';
    }

    public example(): string {
        return 'data add profile \'{"name":"someChangeFoundBetweenTwoCouchSeats","address":"1EBHA1ckUWzNKN7BMfDwGTx6GKEbADUozX"}\'';
    }
}
