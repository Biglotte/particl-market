// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemActionService } from '../../services/ListingItemActionService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemUpdatePostRequest } from '../../requests/ListingItemUpdatePostRequest';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ListingItemUpdateCommand extends BaseCommand implements RpcCommandInterface<ListingItem> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemActionService) public listingItemActionService: ListingItemActionService
    ) {
        super(Commands.ITEM_POST_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingitem hash to update
     *  [1]: listingitemtemplate id to update the listingitem with
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {

        return await this.listingItemActionService.updatePostItem({
            hash: data.params[0],
            listingItemTemplateId: data.params[1] || undefined
        } as ListingItemUpdatePostRequest);

    }

    public usage(): string {
        return this.getName() + ' <listingitemHash> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <hash>                   - String - The hash of the listing item we want to Update. \n'
            + '    <listingItemTemplateId>  - Number - The Id of the listing item template which listing-item we want to Update. ';
    }

    public description(): string {
        return 'Update the details of listing item given by listingitemHash or by listingItemTemplateId.';
    }

    public example(): string {
        return 'item ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb 1';
    }
}
