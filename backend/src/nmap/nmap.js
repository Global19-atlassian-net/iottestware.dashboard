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

'use strict'

const {spawn} = require('child_process')
const fileHelper = require('../helpers/fileHelper')
const pathHelper = require('../helpers/pathHelper')
const timeStamp = require('../helpers/timeStamp')
const nmap = require('./nmapParser')

const EventEmitter = require('events')
class IoTNmapEmitter extends EventEmitter {}
const nmapEmitter = new IoTNmapEmitter()

const scanParams = (target, profile, timestamp, flags) => {
  fileHelper.mkdirSync(pathHelper.storagePath('nmap', timestamp))
  const outputFile = pathHelper.storagePath('nmap', timestamp, 'nmap_scan')

  let p = ['-oA', outputFile]
  if (profile === 'ping_scan') {
    p.push('-sn', '-Pn')
  } else if (profile === 'quick_scan') {
    p.push('-T4', '-F')
  } else if (profile === 'quick_scan_plus') {
    p.push('-T4', '-p 1-65535')
  } else if (profile === 'quick_scan_iot') {
    // Note: only a guess for demo puposes (should capture mqtt, coap and opc-ua)
    // what about -PO switch here?
    p.push('-T4', '-p 1-10000')
    // Quick Scan+ / traceroute require root privileges
    // } else if (profile === 'quick_scan_plus') {
    //  p.push('-sV', '-T4', '-O', '-F', '--version-light', target)
    // } else if (profile === 'quick_traceroute') {
    //  p.push('-sn', '-traceroute', target)
  } else if (profile === 'intense_scan') {
    p.push('-T4', '-A', '-v')
    // UDP scan requires root privileges https://www.unix.com/ip-networking/248432-why-nmap-udp-need-root.html
    // } else if (profile === 'intense_scan_udp') {
    //  p.push('-sS', '-sU', '-T4', '-A', '-v', target)
  } else if (profile === 'intense_scan_all_tcp') {
    p.push('-p 1-65535', '-T4', '-A', '-v')
  } else if (profile === 'intense_scan_no_ping') {
    p.push('-T4', '-A', '-v', '-Pn')
  }

  if (flags.skipHostDiscovery && !p.find(e => e === '-Pn')) {
    p.push('-Pn')
  } else {
    // do nothing
  }

  p.push(target)
  return p
}

/**
 * IoTnmap => like zenmap but for IoT-Testware
 */

const scan = (target, profile, flags) => {
  const ts = timeStamp()
  const params = scanParams(target, profile, ts, flags)
  let proc = spawn('nmap', params)

  // Note: remove the -oA [path] switch for the FE
  const shortCmd = 'nmap ' + params.slice(2).join(' ')
  const cmd = 'nmap ' + params.join(' ')
  nmapEmitter.emit('rawCommand', cmd)

  let report = null
  let done
  proc.stdout.on('data', (data) => {
    // split data line by line
    let lines = data.toString().split(/\r?\n/)
    lines.map((line) => {
      // emit the raw line for terminal view
      nmapEmitter.emit('rawLine', line)
    })

    // parse the data and build report for FE
    const result = nmap.parse(data.toString(), report)
    done = result[0]
    report = result[1]
    nmapEmitter.emit('report', report)

    /* only for debug purposes! FE does not require
    if (done) {
      console.log('##> REPORT: ' + JSON.stringify(report))
      // TODO: send out done/finish to FE?
    } */
  })

  proc.on('error', (error) => {
    console.error('Error from child process: ' + error)
  })

  proc.on('exit', () => {
    nmapEmitter.emit('exit')
  })

  proc.stdout.on('end', () => {
    nmapEmitter.emit('end')
  })

  if (proc.pid) {
    return [true, nmapEmitter, shortCmd]
  } else {
    return [false, proc]
  }
}

module.exports = {
  scan: scan
}
