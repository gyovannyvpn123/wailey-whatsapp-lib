/**
 * Wailey WhatsApp Library - API Server
 * WebSocket API server for WhatsApp integration
 */

const http = require('http');
const { WebSocketServer } = require('ws');
const { BaileysJS } = require('./lib/baileysjs');
const { DEFAULT_CONFIG } = require('./src/defaults');

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Wailey WhatsApp API</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #075e54; }
            .status { padding: 10px; background-color: #f0f0f0; border-radius: 5px; margin: 20px 0; }
            .connected { background-color: #dcf8c6; }
            .disconnected { background-color: #ffcccc; }
            code { background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <h1>Wailey WhatsApp API Server</h1>
          <div id="status" class="status disconnected">Connection Status: Disconnected</div>
          <p>WebSocket endpoint is available at <code>ws://localhost:5000/ws</code></p>
          <p>API Documentation:</p>
          <ul>
            <li><strong>Connect to WhatsApp:</strong> Send <code>{"action": "connect"}</code></li>
            <li><strong>Send Message:</strong> Send <code>{"action": "send", "data": {"to": "123456789", "content": {"type": "text", "text": "Hello"}}}</code></li>
            <li><strong>Get Status:</strong> Send <code>{"action": "status"}</code></li>
            <li><strong>Logout:</strong> Send <code>{"action": "logout"}</code></li>
          </ul>
          
          <script>
            // Connect to the WebSocket
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const wsUrl = \`\${protocol}//\${window.location.host}/ws\`;
            const socket = new WebSocket(wsUrl);
            
            socket.onopen = () => {
              console.log('Connected to WebSocket server');
              socket.send(JSON.stringify({action: 'status'}));
            };
            
            socket.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                console.log('Received:', data);
                
                if (data.status === 'connected') {
                  document.getElementById('status').className = 'status connected';
                  document.getElementById('status').innerText = 'Connection Status: Connected to WhatsApp';
                } else {
                  document.getElementById('status').className = 'status disconnected';
                  document.getElementById('status').innerText = 'Connection Status: Disconnected from WhatsApp';
                }
              } catch (error) {
                console.error('Error parsing message:', error);
              }
            };
            
            socket.onerror = (error) => {
              console.error('WebSocket error:', error);
            };
            
            socket.onclose = () => {
              console.log('Disconnected from WebSocket server');
              document.getElementById('status').className = 'status disconnected';
              document.getElementById('status').innerText = 'Connection Status: Disconnected';
            };
          </script>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Initialize Baileys client
const client = new BaileysJS();
let isInitialized = false;

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Welcome to Wailey WhatsApp API',
    time: new Date().toISOString()
  }));
  
  // Handle messages from clients
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);
      
      // Process different actions
      switch (data.action) {
        case 'connect':
          if (!isInitialized) {
            await client.initialize();
            isInitialized = true;
          }
          
          try {
            const connection = await client.connect();
            
            // Handle QR code events
            client.on('qr', (qr) => {
              ws.send(JSON.stringify({
                type: 'qr',
                qr
              }));
            });
            
            // Handle connection open event
            client.on('open', () => {
              ws.send(JSON.stringify({
                type: 'connection',
                status: 'connected',
                time: new Date().toISOString()
              }));
            });
            
            // Handle logout event
            client.on('logout', () => {
              ws.send(JSON.stringify({
                type: 'connection',
                status: 'disconnected',
                reason: 'logged_out',
                time: new Date().toISOString()
              }));
            });
            
            // Handle message events
            client.on('message', (m) => {
              ws.send(JSON.stringify({
                type: 'incoming_message',
                data: m,
                time: new Date().toISOString()
              }));
            });
            
            ws.send(JSON.stringify({
              type: 'info',
              message: 'Connecting to WhatsApp...',
              time: new Date().toISOString()
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to connect to WhatsApp',
              error: error.message,
              time: new Date().toISOString()
            }));
          }
          break;
          
        case 'send':
          if (!client || !isInitialized) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Not connected to WhatsApp. Please connect first.',
              time: new Date().toISOString()
            }));
            break;
          }
          
          try {
            const { to, content } = data.data || {};
            if (!to || !content) {
              throw new Error('Missing required parameters: to and content');
            }
            
            const result = await client.sendMessage(to, content);
            ws.send(JSON.stringify({
              type: 'message_sent',
              data: result,
              time: new Date().toISOString()
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to send message',
              error: error.message,
              time: new Date().toISOString()
            }));
          }
          break;
          
        case 'status':
          if (!client || !isInitialized) {
            ws.send(JSON.stringify({
              type: 'status',
              status: 'disconnected',
              time: new Date().toISOString()
            }));
            break;
          }
          
          try {
            const status = client.getConnectionStatus();
            ws.send(JSON.stringify({
              type: 'status',
              status: status.connected ? 'connected' : 'disconnected',
              user: status.user,
              time: new Date().toISOString()
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to get status',
              error: error.message,
              time: new Date().toISOString()
            }));
          }
          break;
          
        case 'logout':
          if (!client || !isInitialized) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Not connected to WhatsApp',
              time: new Date().toISOString()
            }));
            break;
          }
          
          try {
            const success = await client.logout();
            ws.send(JSON.stringify({
              type: 'logout',
              success,
              time: new Date().toISOString()
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to logout',
              error: error.message,
              time: new Date().toISOString()
            }));
          }
          break;
          
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: `Unknown action: ${data.action}`,
            time: new Date().toISOString()
          }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format or server error',
        error: error.message,
        time: new Date().toISOString()
      }));
    }
  });
  
  // Handle connection close
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
});