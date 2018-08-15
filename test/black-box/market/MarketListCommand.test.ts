// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';

describe('MarketListCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method =  Commands.MARKET_ROOT.commandName;
    const subCommand =  Commands.MARKET_LIST.commandName;
    const addMarketCommand =  Commands.MARKET_ADD.commandName;

    const marketData = {
        name: 'Test Market',
        private_key: 'privateKey',
        address: 'Market Address'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should return only one default market', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should list all created markets', async () => {
        // add market
        await rpc(method, [addMarketCommand, marketData.name, marketData.private_key, marketData.address]);

        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should fail to create market if try with existing market name', async () => {
        // add markets
        const marketRes = await rpc(method, [addMarketCommand, marketData.name, marketData.private_key, marketData.address]);
        marketRes.expectJson();
        marketRes.expectStatusCode(400);
        expect(marketRes.error.error.success).toBe(false);
        expect(marketRes.error.error.message).toBe('Could not create the market!');
    });

});
