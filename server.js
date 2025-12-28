const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 9002;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket bağlantıları
  const users = new Map();

  io.on('connection', (socket) => {
    console.log('Kullanıcı bağlandı:', socket.id);

    // Kullanıcı giriş yaptığında
    socket.on('user-login', (userData) => {
      users.set(userData.id, socket.id);
      console.log(`${userData.username} giriş yaptı`);
    });



    socket.on('disconnect', () => {
      // Kullanıcıyı listeden çıkar
      for (let [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);
          break;
        }
      }
      console.log('Kullanıcı ayrıldı:', socket.id);
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});