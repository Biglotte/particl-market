// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { OrderItemObject } from '../../src/api/models/OrderItemObject';
import { OrderItemObjectService } from '../../src/api/services/OrderItemObjectService';
import {OrderItemObjectCreateRequest} from '../../src/api/requests/OrderItemObjectCreateRequest';
import {OrderItemObjectUpdateRequest} from '../../src/api/requests/OrderItemObjectUpdateRequest';

describe('OrderItemObject', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let orderItemObjectService: OrderItemObjectService;

    let createdId;

    const testData = {
        dataId: 'id1',
        dataValue: 'value1'
    } as OrderItemObjectCreateRequest;

    const testDataUpdated = {
        dataId: 'id2',
        dataValue: 'value2'
    } as OrderItemObjectUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        orderItemObjectService = app.IoC.getNamed<OrderItemObjectService>(Types.Service, Targets.Service.OrderItemObjectService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();


    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderItemObjectService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new order item object', async () => {
        // testData['related_id'] = 0;
        const orderItemObjectModel: OrderItemObject = await orderItemObjectService.create(testData);
        createdId = orderItemObjectModel.Id;

        const result = orderItemObjectModel.toJSON();

        // test the values
        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
    });

    test('Should throw ValidationException because we want to create a empty order item object', async () => {
        expect.assertions(1);
        await orderItemObjectService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list order item objects with our new create one', async () => {
        const orderItemObjectCollection = await orderItemObjectService.findAll();
        const orderItemObject = orderItemObjectCollection.toJSON();
        expect(orderItemObject.length).toBe(1);

        const result = orderItemObject[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
    });

    test('Should return one order item object', async () => {
        const orderItemObjectModel: OrderItemObject = await orderItemObjectService.findOne(createdId);
        const result = orderItemObjectModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderItemObjectService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the order item object', async () => {
        // testDataUpdated['related_id'] = 0;
        const orderItemObjectModel: OrderItemObject = await orderItemObjectService.update(createdId, testDataUpdated);
        const result = orderItemObjectModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.dataValue).toBe(testDataUpdated.dataValue);
    });

    test('Should delete the order item object', async () => {
        expect.assertions(1);
        await orderItemObjectService.destroy(createdId);
        await orderItemObjectService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
