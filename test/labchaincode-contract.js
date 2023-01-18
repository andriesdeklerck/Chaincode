/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { LabchaincodeContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('LabchaincodeContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new LabchaincodeContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"labchaincode 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"labchaincode 1002 value"}'));
    });

    describe('#labchaincodeExists', () => {

        it('should return true for a labchaincode', async () => {
            await contract.labchaincodeExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a labchaincode that does not exist', async () => {
            await contract.labchaincodeExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#readStudentData', () => {

        it('should return a labchaincode', async () => {
            await contract.readStudentData(ctx, '1001').should.eventually.deep.equal({ value: 'labchaincode 1001 value' });
        });

        it('should throw an error for a labchaincode that does not exist', async () => {
            await contract.readStudentData(ctx, '1003').should.be.rejectedWith(/The labchaincode 1003 does not exist/);
        });

    });

    describe('#updatePassedState', () => {

        it('should update a labchaincode', async () => {
            await contract.updatePassedState(ctx, '1001', 'labchaincode 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"labchaincode 1001 new value"}'));
        });

        it('should throw an error for a labchaincode that does not exist', async () => {
            await contract.updatePassedState(ctx, '1003', 'labchaincode 1003 new value').should.be.rejectedWith(/The labchaincode 1003 does not exist/);
        });

    });

});
