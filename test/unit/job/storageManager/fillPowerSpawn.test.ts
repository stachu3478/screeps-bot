import '../../constants'
import _ from 'lodash'
import sinon from 'sinon'
import storageManagement from 'job/storageManagement';
import { FactoryManager } from 'role/creep/factoryManager';
import { expect } from '../../../expect';

describe('Checking if power spawn needs to be filled from terminal', () => {
  const { fillPowerSpawn } = storageManagement
  let powerSpawn: StructurePowerSpawn
  let terminal: StructureTerminal
  let creep: FactoryManager
  beforeEach(() => {
    global.Game = _.clone(Game);
    global.Memory = _.clone(Memory);
    powerSpawn = { id: 'test', store: { getFreeCapacity: (r) => r === RESOURCE_POWER ? POWER_SPAWN_POWER_CAPACITY : 0 } } as StructurePowerSpawn
    terminal = { store: {} } as StructureTerminal
    terminal.store[RESOURCE_POWER] = 1
    creep = { motherRoom: { powerSpawn, terminal }, memory: {} } as FactoryManager
    sinon.restore()
    sinon.stub(storageManagement, 'prepareToTakeResource')
  });

  describe('No resource to transfer', () => {
    [
      () => { terminal.store[RESOURCE_POWER] = 0 },
      () => { powerSpawn.store = { getFreeCapacity: () => 50 as number } as Store<RESOURCE_ENERGY | RESOURCE_POWER, false> },
    ].forEach((f) => {
      beforeEach(() => {
        f()
      })

      it('Should return false', () => {
        expect(fillPowerSpawn(creep, terminal, powerSpawn)).to.eql(false)
        expect(storageManagement.prepareToTakeResource).to.not.be.called
      })
    })
  })

  describe('Reource to transfer', () => {
    it('Should return true', () => {
      expect(fillPowerSpawn(creep, terminal, powerSpawn)).to.eql(true)
      expect(storageManagement.prepareToTakeResource).to.be.calledWithExactly(creep, RESOURCE_POWER, 1, terminal, powerSpawn)
    })
  })
});
