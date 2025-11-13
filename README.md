# 🛡️ ScriptGuard - Lua Script Protection

A web platform to hide your Lua source code and enable fast updates via loadstring URLs.

## Features

✅ **Source Code Protection** - Your code is obfuscated and hidden from direct viewing  
✅ **Fast Updates** - Edit your scripts instantly, URL stays the same  
✅ **Easy Management** - Simple dashboard to manage all your scripts  
✅ **Secure** - Login system with password hashing and JWT authentication

## Quick Start

1. **Register an account** at the homepage
2. **Add a script** in the dashboard
3. **Copy the loadstring** URL
4. **Use it in your Roblox script**:
   ```lua
   loadstring(game:HttpGet("YOUR-URL-HERE"))()
   ```
5. **Update anytime** by clicking the edit button - the URL never changes!

## How It Works

1. You paste your Lua code into the dashboard
2. The system obfuscates it (encodes it so it can't be easily read)
3. You get a unique URL that loads your code
4. When someone uses the loadstring, they get the obfuscated version
5. The obfuscated code decodes itself at runtime and executes
6. You can update the code anytime - the URL stays the same!

## API Endpoints

### For Your Scripts
- `GET /api/load/:scriptId` - Loads your obfuscated script

### For Dashboard
- `POST /api/register` - Create account
- `POST /api/login` - Login
- `GET /api/scripts` - List your scripts
- `POST /api/scripts` - Upload new script
- `POST /api/scripts/:id` - Update existing script
- `DELETE /api/scripts/:id` - Delete script

## Security Notes

- Passwords are hashed with bcrypt
- Authentication uses JWT tokens
- Scripts are base64 encoded with decoder
- Set `JWT_SECRET` environment variable for production

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript + Tailwind CSS
- **Storage**: JSON files (easy to upgrade to database later)

## For Developers

### Running Locally
The server runs on port 5000 by default.

### Environment Variables
- `JWT_SECRET` - Secret key for JWT tokens (recommended for security)

### Storage
All data is stored in the `data/` directory as JSON files:
- `users.json` - User accounts
- `scripts.json` - Your uploaded scripts
- `keys.json` - License keys (if you use them)
- `whitelist.json` - Whitelist entries (if you use them)

## Additional Features

Beyond basic script protection, ScriptGuard also includes:
- **License Key System** - Generate keys with expiration dates
- **Usage Limits** - Control how many times a key can be used
- **Whitelist Management** - Control who can access your scripts
- **HWID Tracking** - Track hardware IDs for advanced protection

---

Built for Roblox developers who want to protect their scripts! 🚀
