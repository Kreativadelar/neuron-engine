var expect = require('chai').expect;
var sinon = require("sinon");

var index = require('../../../../../../lib/engine/flow/index');
var events = require('../../../../../../lib/engine/flow/events');
var node = require('../../../../../../lib/engine/flow/node');
var protocol = require('../../../../../../lib/protocol');

var DEFAULT_CONF = {
  driver: 'mock', 
  loglevel: 'WARN',
  serverIP: '192.168.100.1',
  socketServerPort: 8082,
  userKey: 'a2a9705fc33071cc212af979ad9e52d75bc096936fb28fe18d0a6b56067a6bf8',
  uuid: '76FA49A9-78D8-4AE5-82A3-EC960138E908',
  device: '',
  runtime: 'node',
};

var inId,inPort,inValue, outId,outPort,outValue;

function nodeOutputChanged(id, portName, value){
  outId = id;
  outPort = portName;
  outValue = value; 
}

function nodeInputChanged(id, portName, value){
  inId = id;
  inPort = portName;
  inValue = value; 
}

describe('TOUCH_BUTTON node', function(){
  var driver;
  var enine;
  var id;
  var _activeNodeCache;
  var client;

  before(function() {
    engine = index.create(DEFAULT_CONF);
    driver = engine.setDriver('mock');
    engine.on(events.NODEOUTPUT, nodeOutputChanged);
    engine.on(events.NODEINPUT, nodeInputChanged);
    _activeNodeCache = engine.getActiveNodeCache();
    driver._generate(protocol.serialize({
      no: 1, // block no
      type: 0x10,
      data: [{
        'BYTE': 0x64 
      }, {
        'BYTE': 0x05
      }]
    }));
    for (var ID in _activeNodeCache){
      if (_activeNodeCache[ID].type === "TOUCH_BUTTON"){
        id = ID;
      }
    }
    driver._generate(protocol.serialize({
      no: 1, // block no
      type: 0x64,
      subtype: 0x05,
      data: [{
        'BYTE': 0x01
      }, {
        'BYTE': 0x01
      }]
    }));
  });

  after(function() {
/*
    nodes = engine.getActiveNodes();
    for(var i = 0; i < nodes.length; i++){
      engine.removeNode(nodes[i].id);
    }
*/
    engine.removeNode(id);
    engine.removeListener(events.NODEOUTPUT, nodeOutputChanged);
    engine.removeListener(events.NODEINPUT, nodeInputChanged);
    engine.stop();
    engine = null;
  });

  it('report block status', function() {

  });

});
