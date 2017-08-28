const globalPack = require('../index'),
  _ = require('highland'),
  expect = require('chai').expect,
  Linter = require('eslint').Linter,
  linter = new Linter();

describe('index', function () {
  const TEST_INPUT = [{
      source: 'require(\'./b\');',
      deps: {'./b': 'b'},
      id: 'a'
    }, {
      source: 'console.log("b")',
      deps: {},
      id: 'b'
    }],
    expectedOut = [
      'window.modules=[];',
      'window.modules["a"] = [function(require,module,exports){require(\'./b\');}, {"./b":"b"}];',
      'window.modules["b"] = [function(require,module,exports){console.log("b")}, {}];',
      'require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module \'"+o+"\'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})(window.modules,{},[]);'
    ];

  it ('emits a prelude', function (done) {
    _(TEST_INPUT).through(globalPack()).toArray((results) => {
      expect(results[0]).to.equal(expectedOut[0]);
      done();
    });
  });
  it ('emits a module chunk for each module', function (done) {
    _(TEST_INPUT).through(globalPack()).toArray((results)=> {
      expect(results[1]).to.equal(expectedOut[1])
      expect(results[2]).to.equal(expectedOut[2])
      done();
    });
  });
  it ('emits a postlude', function () {
    _(TEST_INPUT).through(globalPack()).toArray((results)=> {
      expect(results.slice(-1)[0]).to.equal(expectedOut[3]);
      done();
    });
  });
  it ('does not emit anything else', function (done) {
    _(TEST_INPUT).through(globalPack()).toArray((results)=>{
      expect(results.length).to.equal(4);
      done();
    });
  });
  it ('emits chunks that are valid Javascript', function (done) {
    _(TEST_INPUT).through(globalPack()).toArray((results)=>{
      results.forEach(js => {
        const lintResults = linter.verify(js, {});

        expect(lintResults.length).to.equal(0);
      });
      done();
    });
  });
  it ('changes scope if scope option is set', function (done) {
    _(TEST_INPUT).through(globalPack({scope: 'foo.bar'})).toArray((results)=>{
      results.forEach((result, index) => {
        expect(result).to.equal(expectedOut[index].replace(/window.modules/g,'foo.bar'));
      });
      done();
    });
  });
});
