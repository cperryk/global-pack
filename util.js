const combineSourceMap = require('combine-source-map');

function getPrelude(scope) {
  return `${scope}=[];`;
}

function getModuleString(dep, scope) {
  const path = `./bundle/${dep.id}.js`,
    depsString = JSON.stringify(dep.deps),
    srcString = combineSourceMap.removeComments(dep.source);

  return `${scope}["${dep.id}"] = [function(require,module,exports){${srcString}}, ${depsString}];`;
}

function getPostlude(scope) {
  return `require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})(${scope},{},[]);`
}

module.exports.getModuleString = getModuleString;
module.exports.getPostlude = getPostlude;
module.exports.getPrelude = getPrelude;
