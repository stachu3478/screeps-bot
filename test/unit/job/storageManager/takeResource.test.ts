import _ from 'lodash'
import sinon from 'sinon'
import storageManagement from 'job/storageManagement';
import { FactoryManager } from 'role/creep/factoryManager';
import { expect } from '../../../expect';

describe('Preparing creep to transfer lab between terminal and storage', () => {
  const { prepareToTakeResource } = storageManagement
  let storage: StructureStorage
  let terminal: StructureTerminal
  let creep: FactoryManager
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    storage = { store: { [RESOURCE_UTRIUM]: 5000 }, id: 'storage' } as StructureStorage
    terminal = { store: { [RESOURCE_UTRIUM]: 1000 }, id: 'terminal' } as StructureTerminal
    creep = { memory: {}, store: { getFreeCapacity: () => Infinity } } as FactoryManager
    sinon.restore()
  });

  describe('Enough carry capacity for creep to take all at once', () => {
    it('should not limit resources to take', () => {
      prepareToTakeResource(creep, RESOURCE_UTRIUM, 1000, storage, terminal)
      expect(creep.memory._draw).to.eql('storage', 'Invalid draw target id')
      expect(creep.memory._drawAmount).to.eql(1000, 'Invalid draw amount')
      expect(creep.memory._drawType).to.eql(RESOURCE_UTRIUM, 'Invalid resource type to draw from')
      expect(creep.memory._fill).to.eql('terminal', 'Invalid deliver target')
      expect(creep.memory._fillType).to.eql(RESOURCE_UTRIUM, 'Invalid resource type to insert to')
    });
  })

  describe('Not enough carry capacity for creep to take all at once', () => {
    beforeEach(() => {
      sinon.stub(creep.store, 'getFreeCapacity').returns(100)
    })

    it('should limit resources to take', () => {
      prepareToTakeResource(creep, RESOURCE_UTRIUM, 1000, storage, terminal)
      expect(creep.memory._draw).to.eql('storage', 'Invalid draw target id')
      expect(creep.memory._drawAmount).to.eql(100, 'Invalid draw amount')
      expect(creep.memory._drawType).to.eql(RESOURCE_UTRIUM, 'Invalid resource type to draw from')
      expect(creep.memory._fill).to.eql('terminal', 'Invalid deliver target')
      expect(creep.memory._fillType).to.eql(RESOURCE_UTRIUM, 'Invalid resource type to insert to')
    });
  })
});
