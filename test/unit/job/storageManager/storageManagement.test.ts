import '../../constants'
import _ from 'lodash'
import sinon from 'sinon'
import storageManagement from 'job/storageManagement';
import { FactoryManager } from 'role/creep/factoryManager';
import { expect } from '../../../expect';

describe('Checking if terminal needs to be filled from storage', () => {
  const { exchangeTerminalAndStorage } = storageManagement
  let storage: StructureStorage
  let terminal: StructureTerminal
  let creep: FactoryManager
  beforeEach(() => {
    global.Game = _.clone(Game);
    global.Memory = _.clone(Memory);
    storage = { store: {} } as StructureStorage
    terminal = { store: {} } as StructureTerminal
    creep = { motherRoom: { storage, terminal }, memory: {} } as FactoryManager
    sinon.restore()
    sinon.stub(storageManagement, 'prepareToTakeResource')
  });

  describe('No resource to transfer', () => {
    beforeEach(() => {
      sinon.stub(storageManagement, 'shouldBeTakenFromStorage').returns(0)
      sinon.stub(storageManagement, 'shouldBeTakenToStorage').returns(0)
    })

    it('Should return false', () => {
      expect(exchangeTerminalAndStorage(creep, storage, terminal)).to.eql(false)
      expect(storageManagement.prepareToTakeResource).to.not.be.called
    })
  })

  describe('Reources to transfer from terminal', () => {
    beforeEach(() => {
      sinon.stub(storageManagement, 'shouldBeTakenFromStorage').callsFake((resource: ResourceConstant) => resource === RESOURCE_POWER ? 1 : 0)
      sinon.stub(storageManagement, 'shouldBeTakenToStorage').returns(0)
    })

    it('Should return true', () => {
      expect(exchangeTerminalAndStorage(creep, storage, terminal)).to.eql(true)
      expect(storageManagement.prepareToTakeResource).to.be.calledWithExactly(creep, RESOURCE_POWER, 1, creep.motherRoom.storage, creep.motherRoom.terminal)
    })
  })

  describe('Resources to transfer to terminal', () => {
    beforeEach(() => {
      sinon.stub(storageManagement, 'shouldBeTakenFromStorage').returns(0)
      sinon.stub(storageManagement, 'shouldBeTakenToStorage').callsFake((resource: ResourceConstant) => resource === RESOURCE_POWER ? 1 : 0)
    })

    it('Should return true', () => {
      expect(exchangeTerminalAndStorage(creep, storage, terminal)).to.eql(true)
      expect(storageManagement.prepareToTakeResource).to.be.calledWithExactly(creep, RESOURCE_POWER, 1, creep.motherRoom.terminal, creep.motherRoom.storage)
    })
  })

  describe('Energy can be transferred', () => {
    beforeEach(() => {
      sinon.stub(storageManagement, 'shouldBeTakenFromStorage').returns(0)
      sinon.stub(storageManagement, 'shouldBeTakenToStorage').callsFake((resource: ResourceConstant) => resource === RESOURCE_ENERGY ? 1 : 0)
    })

    it('Should transfer energy', () => {
      expect(exchangeTerminalAndStorage(creep, storage, terminal)).to.eql(true)
      expect(storageManagement.prepareToTakeResource).to.be.calledWithExactly(creep, RESOURCE_ENERGY, 1, creep.motherRoom.terminal, creep.motherRoom.storage)
    })
  })
});
