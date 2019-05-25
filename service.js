// Copyright (c) 2018, Brandon Lehmann, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

'use strict'

const TurtleCoind = require('./')
const util = require('util')

var daemon = new TurtleCoind({
  loadCheckpoints: './checkpoints.csv',
pollingInterval: 10000, // How often to check the daemon in milliseconds
  maxPollingFailures: 5, // How many polling intervals can fail before we emit a down event?
  checkHeight: true, // Check the daemon block height against known trusted nodes
  maxDeviance: 10, // What is the maximum difference between our block height and the network height that we're willing to accept?
  clearP2pOnStart: true, // Will automatically delete the p2pstate.bin file on start if set to true
  clearDBLockFile: true, // Will automatically delete the DB LOCK file on start if set to true
  timeout: 9000, // How long to wait for RPC responses in milliseconds
  enableWebSocket: true, // Enables a socket.io websocket server on the rpcBindPort + 1
  webSocketPassword: false, // Set this to a password to use for the privileged socket events.

  // Load additional daemon parameters here
  enableBlockExplorer: false, // Enable the block explorer
  loadCheckpoints: false, // If set to a path to a file, will supply that file to the daemon if it exists.
  dataDirectory: '/root/.TurtleCoin',
  rpcBindIp: '0.0.0.0', // What IP to bind the RPC server to
  rpcBindPort: 11898, // What Port to bind the RPC server to
  p2pBindIp: '127.0.0.0', // What IP to bind the P2P network to
  p2pBindPort: 11897, // What Port to bind the P2P network to
  dbEnableCompression: true, // Enable DB Compression for TurtleCoind  0.14.6+
  rocksdb: true, // Use RocksDb for local cache files
  feeAddress: 'TRTLuyvXNb2GANcwm6p1KYX5LCyGnhEWt4kNpNf7WsjGE5Az32Jedc1BsrgHcvpP1YHNjb5fX87e4ciez6YWvMt2hZhkGmHwNZj', // allows to specify the fee address for the node
  feeAmount: 190000 // allows to specify the fee amount for the node
})

function log (message) {
  console.log(util.format('%s: %s', (new Date()).toUTCString(), message))
}

daemon.on('start', (args) => {
  log(util.format('TurtleCoind has started... %s', args))
})

daemon.on('started', () => {
  log('TurtleCoind is attempting to synchronize with the network...')
})

daemon.on('syncing', (info) => {
  log(util.format('TurtleCoind has synchronized %s out of %s blocks [%s%]', info.height, info.network_height, info.percent))
})

daemon.on('synced', () => {
  log('TurtleCoind is synchronized with the network...')
})

daemon.on('ready', (info) => {
  log(util.format('TurtleCoind is waiting for connections at %s @ %s - %s H/s', info.height, info.difficulty, info.globalHashRate))
})

daemon.on('desync', (daemon, network, deviance) => {
  log(util.format('TurtleCoind is currently off the blockchain by %s blocks. Network: %s  Daemon: %s', deviance, network, daemon))
})

daemon.on('down', () => {
  log('TurtleCoind is not responding... stopping process...')
  daemon.stop()
})

daemon.on('stopped', (exitcode) => {
  log(util.format('TurtleCoind has closed (exitcode: %s)... restarting process...', exitcode))
  daemon.start()
})

daemon.on('info', (info) => {
  log(info)
})

daemon.on('error', (err) => {
  log(err)
})

daemon.start()
