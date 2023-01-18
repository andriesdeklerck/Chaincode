/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class LabchaincodeContract extends Contract {

    async labchaincodeExists(ctx, studentId) {
        const buffer = await ctx.stub.getState(studentId);
        return (!!buffer && buffer.length > 0);
    }

    async initLedger(ctx) {
        const dummyData = [
            { studentId: "0", name: "Pedro", birthYear: 1975, passed: true },
            { studentId: "1", name: "Pol", birthYear: 1958, passed: true },
            { studentId: "2", name: "Jan", birthYear: 2000, passed: false },
            { studentId: "3", name: "Bart", birthYear: 1946, passed: false }
        ]

        for (let i = 0; i < dummyData.length; i++) {
            const studentId = dummyData[i].studentId;
            const name = dummyData[i].name;
            const birthYear = dummyData[i].birthYear;
            const passed = dummyData[i].passed;
            
            const exists = await this.labchaincodeExists(ctx, studentId);
            if (exists) {
                throw new Error(`The labchaincode ${studentId} already exists`);
            }
            const asset = { studentId, name, birthYear, passed };
            const buffer = Buffer.from(JSON.stringify(asset));
            await ctx.stub.putState(studentId, buffer);
        }
    }

    async updatePassedState(ctx, studentId, isPassed) {
        const exists = await this.labchaincodeExists(ctx, studentId);
        if (!exists) {
            throw new Error(`The labchaincode ${studentId} does not exist`);
        }
        
        const buffer = await ctx.stub.getState(studentId);
        const asset = JSON.parse(buffer.toString());
        asset.passed = isPassed;
        const bufferWrite = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(studentId, bufferWrite);
    }

    async readStudentData(ctx, studentId) {
        const exists = await this.labchaincodeExists(ctx, studentId);
        if (!exists) {
            throw new Error(`The labchaincode ${studentId} does not exist`);
        }
        const buffer = await ctx.stub.getState(studentId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }
}

module.exports = LabchaincodeContract;