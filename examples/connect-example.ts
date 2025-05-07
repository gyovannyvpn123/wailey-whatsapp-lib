// examples/connect-example.ts

import makeWaSocket from '../src/Socket/wa-socket'
import { useMultiFileAuthState } from '../src/Utils/use-multi-file-auth-state'

const startWailey = async () => {
    const { state, saveState } = await useMultiFileAuthState('./auth_info')

    const sock = makeWaSocket({
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveState)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        console.log('Connection update:', update)

        if (connection === 'close') {
            console.log('Connection closed, reconnecting...')
            startWailey()
        }
    })
}

startWailey()
