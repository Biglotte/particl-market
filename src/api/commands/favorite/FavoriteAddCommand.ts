import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { FavoriteItemService } from '../../services/FavoriteItemService';
import { ListingItemService } from '../../services/ListingItemService';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { FavoriteItem } from '../../models/FavoriteItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { FavoriteSearchParams } from '../../requests/FavoriteSearchParams';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { FavoriteItemCreateRequest } from '../../requests/FavoriteItemCreateRequest';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

/**
 * Command for adding an item to your favorites, identified by ID or hash.
 */
export class FavoriteAddCommand extends BaseCommand implements RpcCommandInterface<FavoriteItem> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.FAVORITE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     *  [0]: profile_id or null
     *  [1]: item_id or hash
     *
     * when data.params[0] is null then use default profile
     * when data.params[1] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<FavoriteItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<FavoriteItem> {
        const favoriteParams = await this.favoriteItemService.getSearchParams(data);
        // Check if favorite Item already exist
        let favoriteItem = await this.favoriteItemService.search({profileId: favoriteParams[0], itemId: favoriteParams[1] } as FavoriteSearchParams);

        // favorite item not already exist then create
        if (favoriteItem === null) {
            favoriteItem = await this.favoriteItemService.create({
                profile_id: favoriteParams[0],
                listing_item_id: favoriteParams[1]
            } as FavoriteItemCreateRequest);
        }
        return favoriteItem;
    }

    public usage(): string {
        return this.getName() + ' <profileId> (<itemId>|<hash>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>                   - Numeric - The ID of the profile we \n'
            + '                                     want to associate this favorite with. \n'
            + '    <itemId>                      - Numeric - The ID of the listing item you want to \n'
            + '                                     add to your favorites. \n'
            + '    <hash>                        - String - The hash of the listing item you want \n'
            + '                                     to add to your favorites. ';
    }

    public description(): string {
        return 'Command for adding an item to your favorites, identified by ID or hash.';
    }

    public example(): string {
        return 'favorite ' + this.getName() + ' 1 1 b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }
}
