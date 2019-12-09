/********************************************************************************
 * Copyright (c) 2019 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0 4
 ********************************************************************************/

/**
 * Check if the given protocol name is valid and transforms to nice readable string
 * This enables the flexibility of being independent of the concrete notation of a protocol
 * This notation should always be used when generating Filenames or representations for the frontend
 *
 * @param param is the name of the protocol
 * @returns protocol name as readable notation or null
 */
const readableProtocol = (param) => {
  param = param.toLowerCase()
  let output = null

  switch (param) {
    case 'mqtt':
      output = 'MQTT'
      break
    case 'coap':
      output = 'CoAP'
      break
    case 'nmap':
      output = 'Nmap'
      break
    case 'opc':
    case 'opcua':
    case 'opc-ua':
      output = 'OPC-UA'
      break
  }

  return output
}

/**
 * Check if the given protocol name is valid and transforms to lowercase string
 * This enables the flexibility of being independent of the concrete notation of a protocol
 * This notation should always be used when generating paths / uris
 *
 * @param param is the name of the protocol
 * @returns protocol name as lowercase notation or null
 */
// TODO: the whole module should be named testsuites or similar, not protocols!
const lowerCaseProtocol = (param) => {
  param = param.toLowerCase()
  let output = null

  switch (param) {
    case 'mqtt':
      output = 'mqtt'
      break
    case 'coap':
      output = 'coap'
      break
    case 'nmap':
      output = 'nmap'
      break
    case 'opc':
    case 'opcua':
    case 'opc-ua':
      output = 'opc'
      break
  }

  return output
}

module.exports = {
  readableProtocol: readableProtocol,
  lowerCaseProtocol: lowerCaseProtocol
}
