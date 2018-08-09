// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategoryUpdateRequest } from '../../requests/ItemCategoryUpdateRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { CategoryIsDoableService } from '../../services/CategoryIsDoableService';

export class ItemCategoryUpdateCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.CategoryIsDoableService) private categoryIsDoableService: CategoryIsDoableService
    ) {
        super(Commands.CATEGORY_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * updates user defined category
     *
     * data.params[]:
     *  [0]: category id
     *  [1]: category name
     *  [2]: description
     *  [3]: parentItemCategoryId
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemCategory> {
        const isUpdateable = await this.categoryIsDoableService.isDoable(data.params[0]);
        if (isUpdateable) {
            const parentItemCategory = data.params[3] || 'cat_ROOT'; // if null then default_category will be parent
            const parentItemCategoryId = await this.itemCategoryService.getCategoryIdByKey(parentItemCategory);
            return await this.itemCategoryService.update(data.params[0], {
                name: data.params[1],
                description: data.params[2],
                parent_item_category_id: parentItemCategoryId
            } as ItemCategoryUpdateRequest);
        } else {
            throw new MessageException(`category can't be update. id= ${data.params[0]}`);
        }
    }

    public usage(): string {
        return this.getName() + ' <categoryId> <categoryName> <description> [<parentItemCategoryId>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryId>                  - Numeric - The ID of the category we want to \n'
            + '                                     update. \n'
            + '    <categoryName>                - String - The new name of the category we want \n'
            + '                                     to update. \n'
            + '    <description>                 - String - The new description of the category \n'
            + '                                     we want to update. \n'
            + '    <parentItemCategoryId>        - [optional] Numeric - The ID that identifies the \n'
            + '                                     new parent category of the category we want to \n'
            + '                                     update; default is the root category. ';
    }

    public description(): string {
        return 'Update the details of an item category given by categoryId.';
    }

    public example(): string {
        return 'category ' + this.getName() + ' 81 updatedCategory \'Updated category description\' 80 ';
    }
}
