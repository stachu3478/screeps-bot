import '../constants'
import sinon from 'sinon'
import _ from 'lodash'
import placeStructure from '../../../src/planner/place/structure'
import { Memory } from '../mock'
import Game from '../mock/Game'
import RoomPosition from '../mock/RoomPosition'
import { NOTHING_TODO, SUCCESS } from 'constants/response';
import { expect } from '../../expect';

describe('planner/place/place', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    // @ts-ignore : allow adding Memory to global
    global.RoomPosition = RoomPosition
  });

  afterEach(() => {
    sinon.reset()
    sandbox.restore()
  });

  it('should return NOTHING_TODO number when called with no context', () => {
    const controller = { room: { memory: {} } } as StructureController
    expect(placeStructure(controller, '')).to.eql(NOTHING_TODO);
  });

  it('should place a structure', () => {
    const controller = {
      level: 8,
      room: { memory: {} }
    } as StructureController
    controller.room.lookForAt = () => ([])
    controller.room.createConstructionSite = sinon.fake.returns(OK)
    expect(placeStructure(controller, 'a')).to.eql(SUCCESS);
    expect(controller.room.createConstructionSite).to.be.called
  });
});
