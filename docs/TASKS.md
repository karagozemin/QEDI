# QEDI - Task Distribution and Progress

## Project Status

### Completed Tasks

- [x] Project structure created
- [x] React + Vite + TypeScript setup
- [x] Enoki SDK integration (zkLogin)
- [x] Auth Context and Login system
- [x] Sui dApp Kit setup
- [x] Basic layout (Navbar) and routing
- [x] Landing page
- [x] Auth callback page

### Ongoing Tasks

#### Priority 1: Smart Contract (Critical)
- [ ] Move contract: LinkTreeProfile struct and functions
- [ ] Move contract: Registry (username mapping)
- [ ] Contract tests
- [ ] Deploy to testnet

#### Priority 2: Core Features
- [ ] Profile creation page and transaction
- [ ] Profile display page
- [ ] Profile editing page
- [ ] Walrus integration (avatar upload)

#### Priority 3: Extra Features
- [ ] Theme system (6 themes)
- [ ] Explore page (profile list)
- [ ] QR code generator
- [ ] Share button

#### Priority 4: Deployment
- [ ] Walrus Sites deployment
- [ ] SuiNS domain connection
- [ ] Testing and polish

---

## Task Distribution

### Your Tasks (Main Developer)

**Smart Contract (Critical - 100% Priority)**
- LinkTreeProfile and Link structs
- create_profile, update_profile functions
- add_link, remove_link, update_avatar functions
- Registry module (dynamic fields)
- Deploy and test

**Frontend Core Features**
- Profile creation page
- Profile display page
- Profile editing page
- Transaction builders
- Blockchain integration

**Deployment**
- Walrus Sites deployment
- SuiNS configuration
- Production build

### Teammate Tasks (Backend/Tools)

**Move Learning & Testing**
- Read Move Book (https://move-book.com/move-basics/)
- Write contract tests
- Document CLI test commands

**Backend Tooling**
- Walrus upload service (Node.js)
- Image optimization script
- Bulk avatar upload tool
- Deploy automation script

**Optional Frontend Support**
- Theme CSS files
- Explore page development
- QR code feature

---

## Timeline (7 Days)

### Day 1-2: Foundation (Completed!)
- [x] Project setup
- [x] Auth system
- [x] Landing page

### Day 3: Smart Contract
- [ ] Write Move contract
- [ ] Deploy it
- [ ] Test it

### Day 4: Profile Creation
- [ ] Profile creation UI
- [ ] Transaction builder
- [ ] Walrus avatar upload

### Day 5: Profile Display & Edit
- [ ] Profile display
- [ ] Profile editing
- [ ] Theme system

### Day 6: Polish & Testing
- [ ] Explore page
- [ ] Bug fixes
- [ ] Mobile responsive

### Day 7: Deployment
- [ ] Walrus Sites
- [ ] SuiNS
- [ ] Demo video

---

## Important Links

**Sui & Move**
- https://move-book.com/
- https://docs.sui.io/guides/developer/sui-101
- https://docs.sui.io/guides/developer/getting-started/hello-world

**Walrus**
- https://docs.wal.app/
- https://docs.wal.app/walrus-sites/tutorial-publish.html

**Enoki (zkLogin)**
- https://docs.enoki.mystenlabs.com/
- https://github.com/MystenLabs/sui-move-community-modules/tree/main/module_5

**dApp Kit**
- https://sdk.mystenlabs.com/dapp-kit
- https://sdk.mystenlabs.com/dapp-kit/create-dapp

**SuiNS**
- https://docs.suins.io/
- https://testnet.suins.io/

---

## How We Work

### Git Workflow

```bash
# Main branch: main
# Your branch: feature/core
# Teammate branch: feature/backend-tools

# Daily workflow
git checkout feature/core
git pull origin main
# ... write code ...
git add .
git commit -m "feat: add profile creation page"
git push origin feature/core
```

### Communication
- Daily Discord/WhatsApp updates
- Notify before major changes
- Inform before merging

### Code Review
- Open pull request
- Get at least 1 review
- Resolve conflicts
- Merge

---

## Emergency Situations

**If contract deployment fails:**
1. Get tokens from faucet
2. Increase gas budget
3. Check syntax errors

**If frontend breaks:**
1. Run `npm install`
2. Check `.env.local` file
3. Delete node_modules and reinstall

**If zkLogin doesn't work:**
1. Check Enoki API key
2. Verify Google OAuth redirect URI
3. Check console for errors

---

## Definition of Done

A task is considered complete when:
- [ ] Code is written and working
- [ ] Tested (manual or automated)
- [ ] Documented
- [ ] Pushed to git
- [ ] Team notified

---

**Last Update:** October 24, 2025  
**Project Status:** First phase completed, moving to smart contract development