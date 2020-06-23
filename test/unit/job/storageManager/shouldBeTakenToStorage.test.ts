import '../../constants'
import { expect } from 'chai';
import _ from 'lodash'
import sinon from 'sinon'
import storageManagement from 'job/storageManagement';
import { storageBufferingThreshold } from 'config/terminal';

describe('Checking if terminal needs to be dumped out of resources', () => {
  const { shouldBeTakenToStorage } = storageManagement
  let storage: StructureStorage
  let terminal: StructureTerminal
  beforeEach(() => {
    global.Game = _.clone(Game);
    global.Memory = _.clone(Memory);
    storage = { store: {} } as StructureStorage
    terminal = { store: {} } as StructureTerminal
    sinon.restore()
  });

  describe('Amount stored in terminal is low', () => {
    beforeEach(() => {
      terminal.store[RESOURCE_UTRIUM] = 0
      storage.store.getFreeCapacity = sinon.fake.returns(Infinity)
    })

    it('Should return false', () => {
      expect(shouldBeTakenToStorage(RESOURCE_UTRIUM, terminal, storage)).to.eql(0)
    })
  })

  describe('Amount stored in terminal is enough', () => {
    beforeEach(() => {
      terminal.store[RESOURCE_UTRIUM] = storageBufferingThreshold
      storage.store.getFreeCapacity = sinon.fake.returns(Infinity)
    })

    it('Should return false', () => {
      expect(shouldBeTakenToStorage(RESOURCE_UTRIUM, terminal, storage)).to.eql(0)
    })
  })

  describe('Amount stored in terminal is too high', () => {
    beforeEach(() => {
      terminal.store[RESOURCE_UTRIUM] = storageBufferingThreshold + 1000
    })

    describe('Storage is not full', () => {
      beforeEach(() => {
        storage.store.getFreeCapacity = sinon.fake.returns(1000)
      })

      it('Should return true', () => {
        expect(shouldBeTakenToStorage(RESOURCE_UTRIUM, terminal, storage)).to.eql(1000)
      })
    })

    describe('Storage is full', () => {
      beforeEach(() => {
        storage.store.getFreeCapacity = sinon.fake.returns(0)
      })

      it('Should return false', () => {
        expect(shouldBeTakenToStorage(RESOURCE_UTRIUM, terminal, storage)).to.eql(0)
      })
    })
  })
});
