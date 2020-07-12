import '../constants'
import 'overloads/all'
import sinon from 'sinon'
import _ from 'lodash'
import sendExcess from '../../../src/routine/terminal/sendExcess'
import { Memory } from '../mock'
import Game from '../mock/Game'
import RoomPosition from '../mock/RoomPosition'
import { NOTHING_TODO, SUCCESS, DONE } from 'constants/response';
import { expect } from '../../expect';

describe('routine/terminal/sendExcess', () => {
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
    const term = { room: { memory: {} }, store: {} } as StructureTerminal
    term.room.store = () => 0
    expect(sendExcess(term)).to.eql(NOTHING_TODO);
  });

  it('should perform send while has excess resources and other term to fill', () => {
    const term = {
      room: { memory: { terminalDealResourceType: RESOURCE_HYDROGEN } },
      store: { [RESOURCE_HYDROGEN]: Infinity, [RESOURCE_ENERGY]: Infinity }
    } as StructureTerminal
    term.room.store = () => Infinity
    Memory.myRooms.test = 0
    Game.rooms.test = { terminal: { my: true, store: { [RESOURCE_HYDROGEN]: 0 } } } as Room
    Game.rooms.test.store = () => 0
    term.send = sinon.fake.returns(OK)
    expect(sendExcess(term)).to.eql(SUCCESS);
    expect(term.send).to.be.called
  });

  it('should do nothing at all', () => {
    const term = {
      room: { memory: { terminalDealResourceType: RESOURCE_HYDROGEN } },
      store: { [RESOURCE_HYDROGEN]: Infinity, [RESOURCE_ENERGY]: Infinity }
    } as StructureTerminal
    term.room.store = () => Infinity
    Memory.myRooms.test = 0
    Game.rooms.test = { terminal: { my: true, store: { [RESOURCE_HYDROGEN]: Infinity } } } as Room
    Game.rooms.test.store = () => Infinity
    term.send = sinon.fake.returns(OK)
    expect(sendExcess(term)).to.eql(DONE);
    expect(term.send).to.not.be.called
  });
});
