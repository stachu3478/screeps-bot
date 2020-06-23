import '../../constants'
import { expect } from 'chai';
import _ from 'lodash'
import sinon from 'sinon'
import storageManagement from 'job/storageManagement';
import { StorageManager } from 'role/creep/storageManager';

describe('Checking if terminal needs to be filled from storage', () => {
  const { findJob } = storageManagement
  let storage: StructureStorage
  let terminal: StructureTerminal
  let creep: StorageManager
  beforeEach(() => {
    global.Game = _.clone(Game);
    global.Memory = _.clone(Memory);
    storage = { store: {} } as StructureStorage
    terminal = { store: {} } as StructureTerminal
    creep = { motherRoom: { storage, terminal }, memory: {} } as StorageManager
    sinon.restore()
    sinon.stub(storageManagement, 'prepareToTakeResource')
  });

  describe('Storage does not exist', () => {
    beforeEach(() => {
      delete creep.motherRoom.storage
    })

    it('Should return false', () => {
      expect(findJob(creep)).to.eql(false)
      expect(storageManagement.prepareToTakeResource).to.not.be.called
    })
  })

  describe('Terminal does not exist', () => {
    beforeEach(() => {
      delete creep.motherRoom.terminal
    })

    it('Should return false', () => {
      expect(findJob(creep)).to.eql(false)
      expect(storageManagement.prepareToTakeResource).to.not.be.called
    })
  })

  describe('No resource to transfer', () => {
    beforeEach(() => {
      sinon.stub(storageManagement, 'shouldBeTakenFromStorage').returns(0)
      sinon.stub(storageManagement, 'shouldBeTakenToStorage').returns(0)
    })

    it('Should return false', () => {
      expect(findJob(creep)).to.eql(false)
      expect(storageManagement.prepareToTakeResource).to.not.be.called
    })
  })

  describe('Reources to transfer from terminal', () => {
    beforeEach(() => {
      sinon.stub(storageManagement, 'shouldBeTakenFromStorage').callsFake((resource: ResourceConstant) => resource === RESOURCE_POWER ? 1 : 0)
      sinon.stub(storageManagement, 'shouldBeTakenToStorage').returns(0)
    })

    it('Should return true', () => {
      expect(findJob(creep)).to.eql(true)
      expect(storageManagement.prepareToTakeResource).to.be.calledWithExactly(creep, RESOURCE_POWER, 1, creep.motherRoom.storage, creep.motherRoom.terminal)
    })
  })

  describe('Resources to transfer to terminal', () => {
    beforeEach(() => {
      sinon.stub(storageManagement, 'shouldBeTakenFromStorage').returns(0)
      sinon.stub(storageManagement, 'shouldBeTakenToStorage').callsFake((resource: ResourceConstant) => resource === RESOURCE_POWER ? 1 : 0)
    })

    it('Should return true', () => {
      expect(findJob(creep)).to.eql(true)
      expect(storageManagement.prepareToTakeResource).to.be.calledWithExactly(creep, RESOURCE_POWER, 1, creep.motherRoom.terminal, creep.motherRoom.storage)
    })
  })

  describe('Energy can be transferred', () => {
    beforeEach(() => {
      sinon.stub(storageManagement, 'shouldBeTakenFromStorage').returns(0)
      sinon.stub(storageManagement, 'shouldBeTakenToStorage').callsFake((resource: ResourceConstant) => resource === RESOURCE_ENERGY ? 1 : 0)
    })

    it('Should not transfer energy', () => {
      expect(findJob(creep)).to.eql(false)
      expect(storageManagement.prepareToTakeResource).to.not.be.called
    })
  })
});
