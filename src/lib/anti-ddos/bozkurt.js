const fs = require('fs');
const readline = require('readline');

let startLines = {}

function UnixTime(str) {
    // Define the regex pattern to extract components
    const regex = /(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([\+\-]\d{4})/;
    
    // Apply regex to extract components
    const match = str.match(regex);
  
    if (match) {
      // Extract the components from the regex match
      const day = match[1];
      const month = match[2];
      const year = match[3];
      const hours = match[4];
      const minutes = match[5];
      const seconds = match[6];
      const timezone = match[7];
  
      // Create a month-to-number mapping
      const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
  
      // Create a Date object using UTC to ignore the local timezone effect
      const date = new Date(Date.UTC(
        year, 
        months[month], 
        day, 
        hours, 
        minutes, 
        seconds
      ));
  
      // Return Unix timestamp in seconds
      return Math.floor(date.getTime() / 1000);  // Convert milliseconds to seconds
    } else {
      //throw new Error('Invalid date format');
    }
}

function log(str) {
    //write log.txt file
    const logPath = process.env.NODE_ENV === 'production' ? '/var/log/blocked.log' : './logs/blocked.log';
    
    // Ensure logs directory exists
    const logDir = require('path').dirname(logPath);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFile(logPath, str, () => {});
}

function parse(logRow) {
    const logPattern = /(?<ip>\S+) \S+ \S+ \[(?<timestamp>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status_code>\d+) (?<bytes_sent>\S+) "(?<referrer>[^"]*)" "(?<user_agent>[^"]*)"/;
    const match = logRow.match(logPattern);
    if(match){
        const logData = match.groups;
        const date = new Date(logData.timestamp);
        const unixTimestamp = date.getTime() / 1000; // Convert to seconds
        let unixTime = UnixTime(logData.timestamp)

        return {
            ip: logData.ip,
            referrer: logData.referrer,
            url: logData.url,
            time: unixTime,
            method: logData.method,
            status_code: logData.status_code,
            user_agent: logData.user_agent
        }
    }
    return null;
}

function linesAll(logFilePath, startLine, period, removePeriod, callback) {
    return new Promise((res, rej) => {
        let list = []
        
        if (!fs.existsSync(logFilePath)) {
            console.log(`Log file not found: ${logFilePath}`);
            res();
            return;
        }
        
        const logStream = fs.createReadStream(logFilePath);
        const rl = readline.createInterface({ input: logStream});
        let index = 0;
        
        rl.on('line', (line) => {
            index++;
            if(startLines[logFilePath] && startLines[logFilePath] - period < index) return;
            
            const parsed = parse(line);
            if (parsed) {
                list.push(parsed)
            }
            
            if(list.length == period){
                callback(list)
                startLines[logFilePath] = index
                list.splice(0, removePeriod)
            }
        });
        
        rl.on('close', () => {
            res()
        });
        
        rl.on('error', (err) => {
            console.error(`Error reading log file ${logFilePath}:`, err);
            res();
        });
    })
}

function linesLast(path, startLine, period, removePeriod, callback) {
    return new Promise((res, rej) => {
        let list = [];
        
        if (!fs.existsSync(path)) {
            console.log(`Log file not found: ${path}`);
            callback(list);
            res();
            return;
        }
        
        const stream = fs.createReadStream(path, { encoding: "utf-8" });
        const rl = readline.createInterface({
            input: stream,
            crlfDelay: Infinity,
        });
        
        rl.on("line", (line) => {
            const parsed = parse(line);
            if (parsed) {
                list.push(parsed)
            }
            if (list.length == period) {
                callback(list)
                res()
                rl.close();
            }
        });
        
        rl.on("close", () => {
            callback(list)
            res()
        });
        
        rl.on("error", (err) => {
            console.error(`Error reading log file ${path}:`, err);
            callback(list);
            res();
        });
    })
}

const filter = function (ips, second, callback) {
    // Sort by time (assuming ips is an array of request objects)
    ips.sort((a, b) => a.time - b.time);
    
    let detected = {};
    let datas = {};
    let flagged = [];

    for (let i = 0; i < ips.length; i++) {
        let ip = ips[i].ip;
        let time = ips[i].time;

        if (!detected[ip]){
            detected[ip] = [];
            datas[ip] = [];
        }
        detected[ip].push(time);
        datas[ip].push(ips[i])

        // Remove outdated requests beyond the time window
        detected[ip] = detected[ip].filter(t => t >= time - second);
        datas[ip] = datas[ip].filter(t => t.time >= time - second);
        
        callback(Object.values(datas[ip]), flagged)
    }
    
    return flagged;
}

function listen(path, callback){
    let stop = false;
    fs.watchFile(path, (curr, prev) => {
        if(stop) return
        stop = true
        linesLast(path, 1000, (lines) => {
            stop = false
            find(lines.map(e => parse(e)), callback)
        })
    });
}

let index = 0;
function find(list, callback){
    let founded = new Set();

    // Check for rapid requests to homepage (10 requests in 5 seconds)
    var filtered = filter(list, 5, function(datas, flagged){
        let f = datas.filter(e => e.url == "/" || e.url.startsWith("/api/"))
        if(f.length > 10){
            flagged.push(f)
        }
    })
    filtered.map(addr => { founded.add(addr[0].ip) })

    // Check for sustained attacks (120 requests in 60 seconds)
    var filtered = filter(list, 60, function(datas, flagged){
        let f = datas.filter(e => e.url == "/" || e.url.startsWith("/api/"))
        if(f.length > 120){
            flagged.push(f)
        }
    })
    filtered.map(addr => { founded.add(addr[0].ip) })
    
    // Check for API abuse (50 API requests in 10 seconds)
    var filtered = filter(list, 10, function(datas, flagged){
        let f = datas.filter(e => e.url.startsWith("/api/"))
        if(f.length > 50){
            flagged.push(f)
        }
    })
    filtered.map(addr => { founded.add(addr[0].ip) })
    
    callback(founded)
}

let ips = new Set();
let logs = [];
let logIndex = 0;
let method = linesAll;

function next(callback){
    if (logs.length === 0) {
        setTimeout(() => {
            next(callback);
        }, 5000);
        return;
    }
    
    logIndex = logIndex % logs.length;
    let file = logs[logIndex];
    
    method(file, startLines[file], 2000, 200, (data) => {
        find(data, (_ips) => {
            Array.from(_ips).map(ip => {
                if(ips.has(ip)) return;
                ips.add(ip)
                log(`${new Date().toISOString()} - BLOCKED: ${ip}\n`);
                callback(ip)
            })
        })
    }).then(() => {
        logIndex++;
        setTimeout(() => {
            next(callback);
        }, 2000)
    })
}

function start(_logs = [], callback){
    logs = _logs;
    logs.map(e => {
        startLines[e] = 0;
    })
    
    console.log(`🛡️ Bozkurt Anti-DDoS started monitoring ${logs.length} log files`);
    next(callback)
}

exports.start = start;
exports.find = find;
exports.parse = parse;