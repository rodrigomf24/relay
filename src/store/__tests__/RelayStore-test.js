/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

jest.dontMock('RelayStore');

describe('RelayStore', () => {
  var GraphQLQueryRunner;
  var Relay;
  var RelayStore;
  var RelayStoreData;

  var observeAllRelayQueryData;
  var observeRelayQueryData;
  var readRelayQueryData;

  var filter;
  var dataIDs;
  var queries;
  var callback;
  var recordStore;

  var {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    GraphQLQueryRunner = require('GraphQLQueryRunner');
    Relay = require('Relay');
    RelayStoreData = require('RelayStoreData');
    RelayStore = require('RelayStore');

    observeAllRelayQueryData = require('observeAllRelayQueryData');
    observeRelayQueryData = require('observeRelayQueryData');
    readRelayQueryData = require('readRelayQueryData');

    filter = () => true;
    dataIDs = ['feedback_id', 'likers_id'];
    queries = {};
    callback = jest.genMockFunction();
    recordStore = RelayStoreData.getDefaultInstance().getRecordStore();
  });

  describe('primeCache', () => {
    it('invokes `GraphQLQueryRunner.run`', () => {
      RelayStore.primeCache(queries, callback);

      expect(GraphQLQueryRunner.run).toBeCalled();
      expect(GraphQLQueryRunner.run.mock.calls[0][0]).toBe(queries);
      expect(GraphQLQueryRunner.run.mock.calls[0][1]).toBe(callback);
    });
  });

  describe('forceFetch', () => {
    it('invokes `GraphQLQueryRunner.forceFetch`', () => {
      RelayStore.forceFetch(queries, callback);

      expect(GraphQLQueryRunner.forceFetch).toBeCalled();
      expect(GraphQLQueryRunner.forceFetch.mock.calls[0][0]).toBe(queries);
      expect(GraphQLQueryRunner.forceFetch.mock.calls[0][1]).toBe(callback);
    });
  });

  describe('read', () => {
    it('invokes `readRelayQueryData`', () => {
      RelayStore.read(queries, dataIDs[0]);
      expect(readRelayQueryData).toBeCalled();
      expect(readRelayQueryData.mock.calls[0][1]).toEqual(queries);
      expect(readRelayQueryData.mock.calls[0][2]).toBe(dataIDs[0]);
      expect(readRelayQueryData.mock.calls[0][3]).toBeUndefined();
    });

    it('invokes `readRelayQueryData` with a filter', () => {
      RelayStore.read(queries, dataIDs[0], filter);
      expect(readRelayQueryData).toBeCalled();
      expect(readRelayQueryData.mock.calls[0][3]).toBe(filter);
    });
  });

  describe('readAll', () => {
    it('invokes `readRelayQueryData`', () => {
      RelayStore.readAll(queries, dataIDs);
      expect(readRelayQueryData.mock.calls.length).toBe(dataIDs.length);
      expect(readRelayQueryData.mock.calls.map(call => call[2])).toEqual(
        dataIDs
      );
    });

    it('invokes `readRelayQueryData` with a filter', () => {
      RelayStore.readAll(queries, dataIDs, filter);
      expect(readRelayQueryData.mock.calls.length).toBe(dataIDs.length);
      readRelayQueryData.mock.calls.forEach((call) => {
        expect(call[3]).toBe(filter);
      });
    });
  });

  describe('readQuery', () => {
    it('accepts a query with no arguments', () => {
      recordStore.putRootCallID('viewer', null, 'client:viewer');
      RelayStore.readQuery(getNode(Relay.QL`query{viewer{actor{id}}}`));
      expect(readRelayQueryData.mock.calls.length).toBe(1);
      expect(readRelayQueryData.mock.calls[0][2]).toBe('client:viewer');
    });

    it('accepts a query with arguments', () => {
      RelayStore.readQuery(getNode(Relay.QL`query{nodes(ids:["123","456"]){id}}`));
      expect(readRelayQueryData.mock.calls.length).toBe(2);
      expect(readRelayQueryData.mock.calls[0][2]).toBe('123');
      expect(readRelayQueryData.mock.calls[1][2]).toBe('456');
    });

    it('accepts a query with unrecognized arguments', () => {
      var result = RelayStore.readQuery(getNode(Relay.QL`query{username(name:"foo"){id}}`));
      expect(readRelayQueryData.mock.calls.length).toBe(0);
      expect(result).toEqual([undefined]);
    });
  });

  describe('observe', () => {
    it('invokes `observeRelayQueryData`', () => {
      RelayStore.observe(queries, dataIDs[0]);
      expect(observeRelayQueryData).toBeCalled();
      expect(observeRelayQueryData.mock.calls[0][1]).toEqual(queries);
      expect(observeRelayQueryData.mock.calls[0][2]).toEqual(dataIDs[0]);
      expect(observeRelayQueryData.mock.calls[0][3]).toBeUndefined();
    });

    it('invokes `observeRelayQueryData` with filter', () => {
      RelayStore.observe(queries, dataIDs[0], filter);
      expect(observeRelayQueryData).toBeCalled();
      expect(observeRelayQueryData.mock.calls[0][3]).toBe(filter);
    });
  });

  describe('observeAll', () => {
    it('invokes `observeAllRelayQueryData`', () => {
      RelayStore.observeAll(queries, dataIDs);
      expect(observeAllRelayQueryData).toBeCalled();
      expect(observeAllRelayQueryData.mock.calls[0][1]).toEqual(queries);
      expect(observeAllRelayQueryData.mock.calls[0][2]).toEqual(dataIDs);
      expect(observeAllRelayQueryData.mock.calls[0][3]).toBeUndefined();
    });

    it('invokes `observeAllRelayQueryData` with filter', () => {
      RelayStore.observeAll(queries, dataIDs, filter);
      expect(observeAllRelayQueryData).toBeCalled();
      expect(observeAllRelayQueryData.mock.calls[0][3]).toBe(filter);
    });
  });
});
