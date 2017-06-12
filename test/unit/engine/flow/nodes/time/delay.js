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

var configCases = [
 {
    config: 2,
    wantInPort: 'delay',
    wantInValue: 2,
 },
 {
    config: -1,
    wantInPort: 'delay',
    wantInValue: -1,
 },
 {
    config: 0,
    wantInPort: 'delay',
    wantInValue: 0,
 }
];

var inputAPortCases = [
 {
    input: 1,
    wantInPort: 'a',
    wantInValue: 1,
    wantOutPort: 'b',
    wantOutValue: 1
 },
 {
    input: 10,
    wantInPort: 'a',
    wantInValue: 10,
    wantOutPort: 'b',
    wantOutValue: 10
 },
 {
    input: 100,
    wantInPort: 'a',
    wantInValue: 100,
    wantOutPort: 'b',
    wantOutValue: 100
 }
];

var inputDelayCases = [
 {
    input: 1,
    wantInPort: 'delay',
    wantInValue: 1
 },
 {
    input: 0,
    wantInPort: 'delay',
    wantInValue: 0
 },
 {
    input: -2,
    wantInPort: 'delay',
    wantInValue: -2
 }
];

describe('DELAY node', function(){
  var enine;
  var id;
  var numberId;
  var _activeNodeCache;
  var clock;

  before(function() {
    clock = sinon.useFakeTimers();
    engine = index.create(DEFAULT_CONF);
    id = engine.addNode("DELAY");
    numberId = engine.addNode("NUMBER");  
    engine.on(events.NODEOUTPUT, nodeOutputChanged);
    engine.on(events.NODEINPUT, nodeInputChanged);
    var defaultConfig = engine.getNodeConfigs(id);
    _activeNodeCache = engine.getActiveNodeCache();
  });

  after(function() {
    clock.restore();
    engine.removeNode(id);
    engine.removeNode(numberId);
    engine.removeListener(events.NODEOUTPUT, nodeOutputChanged);
    engine.removeListener(events.NODEINPUT, nodeInputChanged);
    engine.stop();
    engine = null;
  });

  it('When config delay changed, delay should report to app', function() {
    for (var i = 0; i < configCases.length; i++){
      engine.configNode(id,{'delay':configCases[i].config}); 
      expect(inId).to.be.eql(id);
      expect(inPort).to.be.eql(configCases[i].wantInPort); 
      expect(inValue).to.be.eql(configCases[i].wantInValue); 

      _activeNodeCache[id].updateInput('a', inputAPortCases[i].input, true);
      expect(inId).to.be.eql(id);
      expect(inPort).to.be.eql(inputAPortCases[i].wantInPort); 
      expect(inValue).to.be.eql(inputAPortCases[i].wantInValue);
      if (configCases[i].config > 0){
        clock.tick(configCases[i].config * 1000);
      }
      expect(outId).to.be.eql(id);
      expect(outPort).to.be.eql(inputAPortCases[i].wantOutPort); 
      expect(outValue).to.be.eql(inputAPortCases[i].wantOutValue);
    }
  });

  it('When input a or delay changed, a or delay should report to app', function() {
    engine.connect(numberId,'number', id, 'delay');
    for (var i = 0; i < inputAPortCases.length; i++){
      engine.configNode(numberId,{'number':inputDelayCases[i].input});
      expect(inId).to.be.eql(id);
      expect(inPort).to.be.eql(inputDelayCases[i].wantInPort); 
      expect(inValue).to.be.eql(inputDelayCases[i].wantInValue); 

      _activeNodeCache[id].updateInput('a', inputAPortCases[i].input, true);
      expect(inId).to.be.eql(id);
      expect(inPort).to.be.eql(inputAPortCases[i].wantInPort); 
      expect(inValue).to.be.eql(inputAPortCases[i].wantInValue); 
      clock.tick(inputDelayCases[i].input * 1000); 
      expect(outId).to.be.eql(id);
      expect(outPort).to.be.eql(inputAPortCases[i].wantOutPort); 
      expect(outValue).to.be.eql(inputAPortCases[i].wantOutValue);
    }
  });

});


