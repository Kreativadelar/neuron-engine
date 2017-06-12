var expect = require('chai').expect;
var sinon = require("sinon");

var index = require('../../../../../../lib/engine/flow/index');
var events = require('../../../../../../lib/engine/flow/events');
var node = require('../../../../../../lib/engine/flow/node');

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

var inId,aPort,aValue,cPort,cValue,outId;

function nodeInputChanged(id, portName, value){
  inId = id;
  aPort = portName;
  aValue = value;
}

function nodeOutputChanged(id, portName, value){
  outId = id;
  cPort = portName;
  cValue = value; 
}

var inputCases = [
 {
    a: -1,
    c: 100
 },
 {
    a: 1,
    c: 0
 },
 {
    a: 0,
    c: 100
 }
];

describe('NOT node', function(){
  var enine;
  var id;
  var _activeNodeCache;

  before(function() {
    engine = index.create(DEFAULT_CONF);
    id = engine.addNode("NOT");  
    engine.on(events.NODEOUTPUT, nodeOutputChanged);
    engine.on(events.NODEINPUT, nodeInputChanged);
    _activeNodeCache = engine.getActiveNodeCache();
  });

  after(function() {
    engine.removeNode(id);
    engine.removeListener(events.NODEOUTPUT, nodeOutputChanged);
    engine.removeListener(events.NODEINPUT, nodeInputChanged);
    engine.stop();
    engine = null;
  });

  it('When setup, should update outport', function() {
    _activeNodeCache[id].setup();
    expect(outId).to.be.eql(id);
    expect(cPort).to.be.eql('c'); 
    expect(cValue).to.be.eql(100);    
  });

  it('When input changed, should update outport', function() {
    for (var i = 0; i < inputCases.length; i++){
      _activeNodeCache[id].updateInput('a', inputCases[i].a, true);
      expect(inId).to.be.eql(id);
      expect(aPort).to.be.eql('a'); 
      expect(aValue).to.be.eql(inputCases[i].a); 

      expect(outId).to.be.eql(id);
      expect(cPort).to.be.eql('c'); 
      expect(cValue).to.be.eql(inputCases[i].c); 
    }
  });
});


