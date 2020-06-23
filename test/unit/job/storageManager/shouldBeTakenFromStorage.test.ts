import '../../constants'
import { expect } from 'chai';
import _ from 'lodash'
import sinon from 'sinon'
import storageManagement from 'job/storageManagement';
import { storageBufferingThreshold } from 'config/terminal';

describe('Checking if terminal needs to be filled from storage', () => {
  const { shouldBeTakenFromStorage } = storageManagement
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
      terminal.store[RESOURCE_UTRIUM] = 500
      storage.store.getFreeCapacity = sinon.fake.returns(Infinity)
    })

    describe('Storage stores that resource', () => {
      beforeEach(() => {
        storage.store[RESOURCE_UTRIUM] = 1000
      })

      it('Should return true', () => {
        expect(shouldBeTakenFromStorage(RESOURCE_UTRIUM, terminal, storage)).to.eql(1000)
      })
    })

    describe('Storage stores more resource', () => {
      beforeEach(() => {
        storage.store[RESOURCE_UTRIUM] = Infinity
      })

      it('Should return true', () => {
        expect(shouldBeTakenFromStorage(RESOURCE_UTRIUM, terminal, storage)).to.eql(storageBufferingThreshold - 500)
      })
    })

    describe('Storage does not store that resource', () => {
      beforeEach(() => {
        storage.store[RESOURCE_UTRIUM] = 0
      })

      it('Should return false', () => {
        expect(shouldBeTakenFromStorage(RESOURCE_UTRIUM, terminal, storage)).to.eql(0)
      })
    })
  })

  describe('Amount stored in terminal is enough', () => {
    beforeEach(() => {
      terminal.store[RESOURCE_UTRIUM] = storageBufferingThreshold
      storage.store[RESOURCE_UTRIUM] = Infinity
    })

    it('Should return false', () => {
      expect(shouldBeTakenFromStorage(RESOURCE_UTRIUM, terminal, storage)).to.eql(0)
    })
  })

  describe('Amount stored in terminal is too high', () => {
    beforeEach(() => {
      terminal.store[RESOURCE_UTRIUM] = storageBufferingThreshold + 1000
      storage.store[RESOURCE_UTRIUM] = Infinity
    })

    it('Should return false', () => {
      expect(shouldBeTakenFromStorage(RESOURCE_UTRIUM, terminal, storage)).to.eql(0)
    })
  })
});
