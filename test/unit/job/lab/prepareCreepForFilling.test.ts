import _ from 'lodash'
import labJobs from 'job/lab'
import { LabManager } from 'role/creep/labManager.d'
import { expect } from '../../../expect'

describe('Preparing creep to fill lab with speciied resources', () => {
  const { prepareCreepForFilling } = labJobs
  const room = {} as Room
  let terminal: StructureTerminal
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    room.terminal = terminal = {
      id: 'terminal',
      store: { [RESOURCE_UTRIUM_ACID]: Infinity },
    } as StructureTerminal
  })

  it('should target creep to fill given lab with specified resource', function () {
    const creep = {
      memory: {},
      store: { getFreeCapacity: () => Infinity },
    } as LabManager
    creep.room = room
    const lab = {
      id: 'theLab',
      store: { [RESOURCE_UTRIUM_ACID]: 0 },
    } as StructureLab
    expect(
      prepareCreepForFilling(creep, lab, RESOURCE_UTRIUM_ACID, 300),
    ).to.eql(true)
    expect(creep.memory._draw).to.eql('terminal', 'Invalid draw target id')
    expect(creep.memory._drawAmount).to.eql(300, 'Invalid draw amount')
    expect(creep.memory._targetLab).to.eql('theLab', 'Invalid deliver target')
    expect(creep.memory._drawType).to.eql(
      RESOURCE_UTRIUM_ACID,
      'Invalid resource type to draw from',
    )
    expect(creep.memory[Keys.fillType]).to.eql(
      RESOURCE_UTRIUM_ACID,
      'Invalid resource type to insert to',
    )
    expect(creep.memory.state).to.eql(
      State.HAUL_LAB_FROM_STORAGE,
      'Invalid state selected',
    )
  })

  it('should limit creep resource amount while lab is some filled', function () {
    const creep = {
      memory: {},
      store: { getFreeCapacity: () => Infinity },
    } as LabManager
    creep.room = room
    const lab = {
      id: 'theLab',
      store: { [RESOURCE_UTRIUM_ACID]: 100 },
    } as StructureLab
    expect(
      prepareCreepForFilling(creep, lab, RESOURCE_UTRIUM_ACID, 300),
    ).to.eql(true)
    expect(creep.memory._draw).to.eql('terminal')
    expect(creep.memory._drawAmount).to.eql(200)
    expect(creep.memory._targetLab).to.eql('theLab')
    expect(creep.memory._drawType).to.eql(RESOURCE_UTRIUM_ACID)
    expect(creep.memory[Keys.fillType]).to.eql(RESOURCE_UTRIUM_ACID)
    expect(creep.memory.state).to.eql(State.HAUL_LAB_FROM_STORAGE)
  })

  it('should limit creep resource amount while creep cannot carry everything at once', function () {
    const creep = {
      memory: {},
      store: { getFreeCapacity: () => 200 },
    } as LabManager
    creep.room = room
    const lab = {
      id: 'theLab',
      store: { [RESOURCE_UTRIUM_ACID]: 0 },
    } as StructureLab
    expect(
      prepareCreepForFilling(creep, lab, RESOURCE_UTRIUM_ACID, 300),
    ).to.eql(true)
    expect(creep.memory._draw).to.eql('terminal')
    expect(creep.memory._drawAmount).to.eql(200)
    expect(creep.memory._targetLab).to.eql('theLab')
    expect(creep.memory._drawType).to.eql(RESOURCE_UTRIUM_ACID)
    expect(creep.memory[Keys.fillType]).to.eql(RESOURCE_UTRIUM_ACID)
    expect(creep.memory.state).to.eql(State.HAUL_LAB_FROM_STORAGE)
  })

  it('should fail for missing terminal', function () {
    const creep = {
      memory: {},
      store: { getFreeCapacity: () => 200 },
    } as LabManager
    creep.room = room
    delete room.terminal
    const lab = {
      id: 'theLab',
      store: { [RESOURCE_UTRIUM_ACID]: 0 },
    } as StructureLab
    expect(
      prepareCreepForFilling(creep, lab, RESOURCE_UTRIUM_ACID, 300),
    ).to.eql(false)
    expect(creep.memory._draw).to.be.undefined
    expect(creep.memory._drawAmount).to.be.undefined
    expect(creep.memory._targetLab).to.be.undefined
    expect(creep.memory._drawType).to.be.undefined
    expect(creep.memory[Keys.fillType]).to.be.undefined
    expect(creep.memory.state).to.be.undefined
  })

  it('should fail for missing resources in terminal', function () {
    const creep = {
      memory: {},
      store: { getFreeCapacity: () => 200 },
    } as LabManager
    creep.room = room
    terminal.store[RESOURCE_UTRIUM_ACID] = 299
    const lab = {
      id: 'theLab',
      store: { [RESOURCE_UTRIUM_ACID]: 0 },
    } as StructureLab
    expect(
      prepareCreepForFilling(creep, lab, RESOURCE_UTRIUM_ACID, 300),
    ).to.eql(false)
    expect(creep.memory._draw).to.be.undefined
    expect(creep.memory._drawAmount).to.be.undefined
    expect(creep.memory._targetLab).to.be.undefined
    expect(creep.memory._drawType).to.be.undefined
    expect(creep.memory[Keys.fillType]).to.be.undefined
    expect(creep.memory.state).to.be.undefined
  })

  it('should fail for missing resources in terminal with store resources in lab', function () {
    const creep = {
      memory: {},
      store: { getFreeCapacity: () => 50 },
    } as LabManager
    creep.room = room
    terminal.store[RESOURCE_UTRIUM_ACID] = 99
    const lab = {
      id: 'theLab',
      store: { [RESOURCE_UTRIUM_ACID]: 150 },
    } as StructureLab
    expect(
      prepareCreepForFilling(creep, lab, RESOURCE_UTRIUM_ACID, 300),
    ).to.eql(false)
    expect(creep.memory._draw).to.be.undefined
    expect(creep.memory._drawAmount).to.be.undefined
    expect(creep.memory._targetLab).to.be.undefined
    expect(creep.memory._drawType).to.be.undefined
    expect(creep.memory[Keys.fillType]).to.be.undefined
    expect(creep.memory.state).to.be.undefined
  })
})
