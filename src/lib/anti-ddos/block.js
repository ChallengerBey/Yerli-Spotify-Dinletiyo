const https = require("https");
const fs = require("fs");
const path = require("path");

// In-memory blocked IPs set for faster lookups
let blockedIPs = new Set();

// Load blocked IPs from file on startup
function loadBlockedIPs() {
    try {
        const blockedFile = path.join(process.cwd(), 'logs', 'blocked-ips.json');
        if (fs.existsSync(blockedFile)) {
            const data = fs.readFileSync(blockedFile, 'utf8');
            const ips = JSON.parse(data);
            blockedIPs = new Set(ips);
            console.log(`🛡️ Loaded ${blockedIPs.size} blocked IPs from cache`);
        }
    } catch (error) {
        console.error('Error loading blocked IPs:', error);
    }
}

// Save blocked IPs to file
function saveBlockedIPs() {
    try {
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const blockedFile = path.join(logDir, 'blocked-ips.json');
        fs.writeFileSync(blockedFile, JSON.stringify([...blockedIPs], null, 2));
    } catch (error) {
        console.error('Error saving blocked IPs:', error);
    }
}

// Check if IP is blocked
function isBlocked(ip) {
    return blockedIPs.has(ip);
}

// Add IP to blocked list
function addToBlockedList(ip) {
    if (!blockedIPs.has(ip)) {
        blockedIPs.add(ip);
        saveBlockedIPs();
        console.log(`🚫 IP ${ip} added to blocked list`);
        return true;
    }
    return false;
}

// Remove IP from blocked list
function removeFromBlockedList(ip) {
    if (blockedIPs.has(ip)) {
        blockedIPs.delete(ip);
        saveBlockedIPs();
        console.log(`✅ IP ${ip} removed from blocked list`);
        return true;
    }
    return false;
}

// Get all blocked IPs
function getBlockedIPs() {
    return [...blockedIPs];
}

// Block IP via cPanel (if configured)
function blockIPViaCPanel(addresses, callback) {
    // Load cPanel config if exists
    let config = {};
    try {
        const configPath = path.join(process.cwd(), '.config.json');
        if (fs.existsSync(configPath)) {
            config = require(configPath);
        }
    } catch (error) {
        console.log('No cPanel config found, using local blocking only');
    }

    const { cpanel_user, cpanel_token, cpanel_host } = config;

    addresses.forEach(ip => {
        // Always add to local blocked list
        addToBlockedList(ip);

        // If cPanel is configured, also block there
        if (cpanel_user && cpanel_token && cpanel_host) {
            const options = {
                hostname: cpanel_host,
                port: 2083,
                path: `/execute/BlockIP/add_ip?ip=${ip}`,
                method: "GET",
                headers: {
                    "Authorization": `cpanel ${cpanel_user}:${cpanel_token}`,
                    "Accept": "application/json"
                },
                rejectUnauthorized: false
            };

            const req = https.request(options, res => {
                let data = "";
                res.on("data", chunk => { data += chunk; });
                res.on("end", () => {
                    try {
                        const response = JSON.parse(data);
                        callback(`${ip}\t${response.status ? "✅ cPanel" : "❌ cPanel"}`);
                    } catch (error) {
                        callback(`${ip}\t❌ cPanel parse error`);
                    }
                });
            });

            req.on("error", error => {
                callback(`${ip}\t❌ cPanel error: ${error.message}`);
            });

            req.end();
        } else {
            callback(`${ip}\t✅ Local only`);
        }
    });
}

// Initialize blocked IPs on module load
loadBlockedIPs();

exports.blockIP = blockIPViaCPanel;
exports.isBlocked = isBlocked;
exports.addToBlockedList = addToBlockedList;
exports.removeFromBlockedList = removeFromBlockedList;
exports.getBlockedIPs = getBlockedIPs;
exports.loadBlockedIPs = loadBlockedIPs;
exports.saveBlockedIPs = saveBlockedIPs;